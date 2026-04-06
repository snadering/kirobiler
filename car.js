// ===== CAR DETAIL PAGE — SUPABASE =====

function formatPrice(p) { return p.toLocaleString('da-DK') + ' kr'; }
function formatKm(k)    { return k.toLocaleString('da-DK') + ' km'; }

function showPageLoader() {
  document.getElementById('detailTitle').textContent = '';
  document.getElementById('detailYearKm').textContent = '';
  document.getElementById('detailPrice').textContent = '';
  document.getElementById('detailDesc').textContent = '';
  document.getElementById('detailFuelBadge').textContent = '';
  document.getElementById('detailGearBadge').textContent = '';
  document.getElementById('detailSpecsGrid').innerHTML = '';
  document.getElementById('galleryThumbs').innerHTML = '';
  document.getElementById('galleryMain').innerHTML = `
    <div class="loader-center" style="height:100%">
      <div class="spinner"></div>
    </div>`;

  // Skeleton specs
  document.getElementById('detailSpecsGrid').innerHTML = Array.from({length: 4}, () => `
    <div class="spec-item">
      <div class="skeleton-line short" style="height:10px;margin-bottom:6px"></div>
      <div class="skeleton-line medium" style="height:16px;margin-bottom:0"></div>
    </div>`).join('');
}

async function renderDetail() {
  const parts = window.location.pathname.split('/');
  const id = parts[parts.length - 1];
  if (!id) { location.href = '/'; return; }

  showPageLoader();

  const car = await getCarById(id);
  if (!car) { location.href = '/'; return; }

  document.title = `Kiro Biler – ${car.brand} ${car.model}`;

  document.getElementById('detailFuelBadge').textContent = t(car.fuel);
  document.getElementById('detailGearBadge').textContent = t(car.gear);
  document.getElementById('detailTitle').textContent = `${car.brand} ${car.model}`;
  document.getElementById('detailYearKm').textContent = car.km ? `${car.year} · ${formatKm(car.km)}` : `${car.year}`;
  document.getElementById('detailPrice').textContent = formatPrice(car.price);
  document.getElementById('detailDesc').textContent = car.desc || '–';

  const lang = getCurrentLang();
  const specs = [
    { label: { da:'Årgang', en:'Year' },           value: car.year },
    ...(car.km ? [{ label: { da:'Kilometerstand', en:'Mileage' }, value: formatKm(car.km) }] : []),
    { label: { da:'Brændstof', en:'Fuel type' },    value: t(car.fuel) },
    { label: { da:'Gearkasse', en:'Gearbox' },      value: t(car.gear) },
    { label: { da:'Farve', en:'Colour' },            value: car.color || '–' },
  ];
  if (car.fuel !== 'Elbil' && car.kml) {
    specs.push({ label: { da:'Km/l', en:'Km/l' }, value: car.kml });
  }

  document.getElementById('detailSpecsGrid').innerHTML = specs.map(s => `
    <div class="spec-item">
      <div class="spec-item-label" data-da="${s.label.da}" data-en="${s.label.en}">${s.label[lang]}</div>
      <div class="spec-item-value">${s.value}</div>
    </div>`).join('');

  const galleryMain = document.getElementById('galleryMain');
  const thumbsEl    = document.getElementById('galleryThumbs');

  if (car.images && car.images.length > 0) {
    function showImg(idx) {
      galleryMain.innerHTML = `<img src="${car.images[idx]}" alt="${car.brand} ${car.model}"/>`;
      document.querySelectorAll('.gallery-thumb').forEach((t,i) => t.classList.toggle('active', i === idx));
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

document.addEventListener('DOMContentLoaded', async () => {
  await renderDetail();
  applyLang();
  document.getElementById('langToggle')?.addEventListener('click', () => {
    setTimeout(async () => { await renderDetail(); applyLang(); }, 50);
  });
});
