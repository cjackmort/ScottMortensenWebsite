<#
  Generates web-sized versions of Photos/*.jpg into Photos/web/.

  The originals are 36MP camera files (~15 MB each) but never display larger
  than ~800px on screen, so shipping them costs ~150x more bytes than needed.
  Re-run this after adding new photos to Photos/.

    powershell -ExecutionPolicy Bypass -File tools\optimize-images.ps1

  Two widths are emitted per photo:
    <name>.jpg      max 1600px long edge  - hero / lightbox / retina grid
    <name>-800.jpg  max  800px long edge  - gallery grid tiles
#>

param(
  [int] $Quality = 82,
  [switch] $Force
)

Add-Type -AssemblyName System.Drawing

$srcDir = Join-Path $PSScriptRoot '..\Photos' | Resolve-Path
$outDir = Join-Path $srcDir 'web'
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
             Where-Object { $_.MimeType -eq 'image/jpeg' }
$encParams = New-Object System.Drawing.Imaging.EncoderParameters 1
$encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
  [System.Drawing.Imaging.Encoder]::Quality, [int64]$Quality)

# EXIF orientation (tag 0x0112) -> the rotate/flip needed to display upright.
# System.Drawing ignores the tag, so unrotated phone/camera shots come out sideways.
$exifRotate = @{
  2 = [System.Drawing.RotateFlipType]::RotateNoneFlipX
  3 = [System.Drawing.RotateFlipType]::Rotate180FlipNone
  4 = [System.Drawing.RotateFlipType]::Rotate180FlipX
  5 = [System.Drawing.RotateFlipType]::Rotate90FlipX
  6 = [System.Drawing.RotateFlipType]::Rotate90FlipNone
  7 = [System.Drawing.RotateFlipType]::Rotate270FlipX
  8 = [System.Drawing.RotateFlipType]::Rotate270FlipNone
}

function Save-Resized {
  param($Image, [int]$MaxEdge, [string]$Destination)

  $scale = [math]::Min($MaxEdge / $Image.Width, $MaxEdge / $Image.Height)
  if ($scale -ge 1) { $scale = 1 }   # never upscale
  $w = [int][math]::Round($Image.Width  * $scale)
  $h = [int][math]::Round($Image.Height * $scale)

  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g   = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $g.DrawImage($Image, 0, 0, $w, $h)
  $g.Dispose()

  $bmp.Save($Destination, $jpegCodec, $encParams)
  $bmp.Dispose()
  return "$w x $h"
}

$srcBytes = 0; $outBytes = 0
$photos = Get-ChildItem $srcDir -File | Where-Object { $_.Extension -match '^\.(jpg|jpeg)$' }

foreach ($photo in $photos) {
  $base  = [System.IO.Path]::GetFileNameWithoutExtension($photo.Name)
  $large = Join-Path $outDir "$base.jpg"
  $small = Join-Path $outDir "$base-800.jpg"
  $srcBytes += $photo.Length

  if (-not $Force -and (Test-Path $large) -and (Test-Path $small) -and
      (Get-Item $large).LastWriteTime -gt $photo.LastWriteTime) {
    $outBytes += (Get-Item $large).Length + (Get-Item $small).Length
    Write-Host ("  skip  {0}" -f $photo.Name) -ForegroundColor DarkGray
    continue
  }

  $img = [System.Drawing.Image]::FromFile($photo.FullName)
  try {
    if ($img.PropertyIdList -contains 0x0112) {
      $o = $img.GetPropertyItem(0x0112).Value[0]
      if ($exifRotate.ContainsKey([int]$o)) { $img.RotateFlip($exifRotate[[int]$o]) }
    }
    $dimLarge = Save-Resized $img 1600 $large
    $null     = Save-Resized $img  800 $small
  } finally { $img.Dispose() }

  $newSize = (Get-Item $large).Length + (Get-Item $small).Length
  $outBytes += $newSize
  Write-Host ("  ok    {0,-22} {1,-11} {2,7:N1} MB -> {3,6:N0} KB" -f `
    $photo.Name, $dimLarge, ($photo.Length/1MB), ($newSize/1KB)) -ForegroundColor Green
}

Write-Host ''
Write-Host ("Total: {0:N1} MB -> {1:N1} MB  ({2:N0}x smaller)" -f `
  ($srcBytes/1MB), ($outBytes/1MB), ($srcBytes/[math]::Max($outBytes,1))) -ForegroundColor Cyan
