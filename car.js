// ===== CAR DETAIL PAGE =====

function formatPrice(p) { return p.toLocaleString('da-DK') + ' kr'; }
function formatKm(k)    { return k.toLocaleString('da-DK') + ' km'; }

function renderDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) { location.href = 'index.html'; return; }

  const car = getCarById(id);
  if (!car) { location.href = 'index.html'; return; }

  document.title = `Kiro Biler – ${car.brand} ${car.model}`;

  // Badges
  document.getElementById('detailFuelBadge').textContent = t(car.fuel);
  document.getElementById('detailGearBadge').textContent = t(car.gear);

  // Title & meta
  document.getElementById('detailTitle').textContent = `${car.brand} ${car.model}`;
  document.getElementById('detailYearKm').textContent = `${car.year} · ${formatKm(car.km)}`;
  document.getElementById('detailPrice').textContent = formatPrice(car.price);
  document.getElementById('detailDesc').textContent = car.desc || '–';

  // Specs grid
  const lang = getCurrentLang();
  const specs = [
    { label: { da:'Årgang', en:'Year' },          value: car.year },
    { label: { da:'Kilometerstand', en:'Mileage' }, value: formatKm(car.km) },
    { label: { da:'Brændstof', en:'Fuel type' },   value: t(car.fuel) },
    { label: { da:'Gearkasse', en:'Gearbox' },     value: t(car.gear) },
    { label: { da:'Farve', en:'Colour' },           value: car.color || '–' },
  ];
  if (car.fuel !== 'Elbil') {
    specs.push({ label: { da:'Km/l', en:'Km/l' }, value: car.kml });
  }

  const grid = document.getElementById('detailSpecsGrid');
  grid.innerHTML = specs.map(s => `
    <div class="spec-item">
      <div class="spec-item-label" data-da="${s.label.da}" data-en="${s.label.en}">${s.label[lang]}</div>
      <div class="spec-item-value">${s.value}</div>
    </div>`).join('');

  // Gallery
  const galleryMain = document.getElementById('galleryMain');
  const thumbsEl    = document.getElementById('galleryThumbs');

  if (car.images && car.images.length > 0) {
    let activeIdx = 0;

    function showImg(idx) {
      activeIdx = idx;
      galleryMain.innerHTML = `<img src="${car.images[idx]}" alt="${car.brand} ${car.model}"/>`;
      document.querySelectorAll('.gallery-thumb').forEach((t,i) => {
        t.classList.toggle('active', i === idx);
      });
    }

    thumbsEl.innerHTML = car.images.map((img, i) => `
      <div class="gallery-thumb${i===0?' active':''}" onclick="showImage(${i})">
        <img src="${img}" alt="Foto ${i+1}"/>
      </div>`).join('');

    window.showImage = showImg;
    showImg(0);
  } else {
    galleryMain.innerHTML = `
      <div class="gallery-placeholder">
        <svg width="80" height="48" viewBox="0 0 80 48" fill="none">
          <rect x="5" y="16" width="70" height="22" rx="4" fill="currentColor" opacity=".12"/>
          <path d="M12 16 L24 4 L56 4 L68 16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
          <circle cx="22" cy="38" r="7" fill="currentColor" opacity=".25"/>
          <circle cx="58" cy="38" r="7" fill="currentColor" opacity=".25"/>
        </svg>
      </div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderDetail();
  setTimeout(() => applyLang(), 50);

  document.getElementById('langToggle')?.addEventListener('click', () => {
    setTimeout(() => { renderDetail(); applyLang(); }, 50);
  });
});
