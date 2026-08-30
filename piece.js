/* Populates piece.html from pieces-data.js based on the ?id= query param.
 * A plain data-driven template keeps one file instead of one hand-written
 * HTML page per sculpture — the gallery already has 15 of these and grows. */
(function () {
  const id = new URLSearchParams(location.search).get('id');
  const piece = typeof getPiece === 'function' ? getPiece(id) : null;

  if (!piece) {
    document.querySelector('.piece-inner').innerHTML =
      '<a href="gallery.html" class="piece-back">&larr; All works</a>' +
      '<p class="body-text light" style="margin-top:24px">That piece could not be found. ' +
      '<a href="gallery.html" style="color:var(--gold)">Back to the gallery</a>.</p>';
    return;
  }

  document.title = `${piece.title} · Scott Mortensen Fine Arts`;
  document.getElementById('pieceMetaDesc').setAttribute('content',
    `${piece.title} — ${piece.medium} by Scott Mortensen. ${piece.description}`);

  document.getElementById('pieceImg').src = piece.image;
  document.getElementById('pieceImg').alt = `${piece.title} — ${piece.medium} sculpture by Scott Mortensen`;
  document.getElementById('pieceCat').textContent = piece.category;
  document.getElementById('pieceTitle').textContent = piece.title;
  document.getElementById('piecePrice').textContent = formatPrice(piece.price);
  document.getElementById('pieceDesc').textContent = piece.description;

  const spec = document.getElementById('pieceSpec');
  const rows = [
    ['Medium', piece.medium],
    ['Edition', piece.edition],
    ['Available', piece.available > 0 ? `${piece.available} available` : 'Inquire — ask what’s currently in the studio'],
  ].filter(([, v]) => v);
  spec.innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');

  const buyBtn = document.getElementById('pieceBuyBtn');
  const note = document.getElementById('pieceNote');
  if (piece.buyUrl) {
    buyBtn.href = piece.buyUrl;
    buyBtn.target = '_blank';
    buyBtn.rel = 'noopener noreferrer';
    buyBtn.textContent = `Buy — ${formatPrice(piece.price)}`;
    note.textContent = 'Checkout opens on the Square store.';
  } else {
    buyBtn.href = `contact.html?piece=${encodeURIComponent(piece.title)}`;
    buyBtn.textContent = piece.price != null ? `Inquire — ${formatPrice(piece.price)}` : 'Inquire';
    note.textContent = 'This piece isn’t connected to checkout yet — send an inquiry and Scott will follow up directly.';
  }
})();
