// ===== MAIN PAGE — SUPABASE =====

function formatPrice(p) { return p.toLocaleString('da-DK') + ' kr'; }
function formatKm(k)    { return k.toLocaleString('da-DK') + ' km'; }

function statusClass(s) {
  if (s === 'Solgt')      return 'status-sold';
  if (s === 'Reserveret') return 'status-res';
  return 'status-sale';
}

function renderCars(cars) {
  const grid  = document.getElementById('carGrid');
  const empty = document.getElementById('emptyMsg');
  if (!grid) return;

  if (cars.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  const lang = getCurrentLang();

  grid.innerHTML = cars.map((car, i) => {
    const imgHtml = car.images && car.images.length > 0
      ? `<img src="${car.images[0]}" alt="${car.brand} ${car.model}" loading="lazy"/>`
      : `<svg class="car-placeholder" width="80" height="48" viewBox="0 0 80 48" fill="none"><rect x="5" y="16" width="70" height="22" rx="4" fill="currentColor" opacity=".15"/><path d="M12 16 L24 4 L56 4 L68 16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linejoin="round"/><circle cx="22" cy="38" r="7" fill="currentColor" opacity=".2"/><circle cx="58" cy="38" r="7" fill="currentColor" opacity=".2"/></svg>`;

    const statusLabel = car.status === 'Til salg' ? t('tilSalg') :
                        car.status === 'Solgt'    ? t('solgt') : t('reserveret');

    const kmlSpec = car.fuel === 'Elbil'
      ? (lang === 'da' ? 'Elbil' : 'Electric')
      : car.kml + ' km/l';

    return `
    <div class="car-card" style="animation-delay:${i * 60}ms" onclick="location.href='car.html?id=${car.id}'">
      <div class="car-card-img">
        ${imgHtml}
        <span class="status-badge ${statusClass(car.status)}">${statusLabel}</span>
      </div>
      <div class="car-card-body">
        <div class="car-brand-tag">${car.brand}</div>
        <div class="car-title">${car.model}</div>
        <div class="car-specs-row">
          <span class="spec-pill">${car.year}</span>
          <span class="spec-pill">${formatKm(car.km)}</span>
          <span class="spec-pill">${kmlSpec}</span>
          <span class="spec-pill">${t(car.fuel)}</span>
        </div>
        <div class="car-card-footer">
          <div><div class="car-price">${formatPrice(car.price)}</div></div>
          <button class="btn-card">${t('seeBil')}</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

async function loadAndRender() {
  const grid = document.getElementById('carGrid');
  grid.innerHTML = '<div class="loading-msg" data-da="Henter biler..." data-en="Loading cars...">Henter biler...</div>';

  const allCars = await getCars();

  const fuel  = document.getElementById('filterFuel').value;
  const price = document.getElementById('filterPrice').value;
  const year  = document.getElementById('filterYear').value;

  const filtered = allCars.filter(car => {
    if (fuel  && car.fuel !== fuel)           return false;
    if (price && car.price > parseInt(price)) return false;
    if (year  && car.year < parseInt(year))   return false;
    return true;
  });

  renderCars(filtered);
  applyLang();

  const heroCount = document.getElementById('heroCount');
  if (heroCount) {
    heroCount.textContent = allCars.filter(c => c.status === 'Til salg').length;
  }
}

function initFilters() {
  ['filterFuel', 'filterPrice', 'filterYear'].forEach(id => {
    document.getElementById(id).addEventListener('change', loadAndRender);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initFilters();
  loadAndRender();

  document.getElementById('langToggle')?.addEventListener('click', () => {
    setTimeout(loadAndRender, 50);
  });
});
