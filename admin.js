// ===== ADMIN PANEL =====
// Change this password to something secure before going live!
const ADMIN_PASSWORD = 'kirobiler2025';
const AUTH_KEY = 'kirobiler_auth';

let editingId = null;
let deleteTargetId = null;
let pendingImages = []; // Array of base64 data URLs

// ===== AUTH =====
function checkLogin() {
  const val = document.getElementById('passwordInput').value;
  if (val === ADMIN_PASSWORD) {
    sessionStorage.setItem(AUTH_KEY, '1');
    showPanel();
  } else {
    document.getElementById('loginError').style.display = 'block';
    document.getElementById('passwordInput').value = '';
  }
}

function adminLogout() {
  sessionStorage.removeItem(AUTH_KEY);
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('logoutBtn').style.display = 'none';
}

function showPanel() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';
  document.getElementById('logoutBtn').style.display = 'inline-flex';
  renderAdminList();
}

// ===== RENDER ADMIN LIST =====
function formatPrice(p) { return p.toLocaleString('da-DK') + ' kr'; }

function renderAdminList() {
  const list = document.getElementById('adminCarList');
  const cars = getCars();

  if (cars.length === 0) {
    list.innerHTML = '<p style="color:var(--text-secondary);padding:40px 0;text-align:center">Ingen biler endnu. Tilføj din første bil!</p>';
    return;
  }

  list.innerHTML = cars.map(car => {
    const thumbHtml = car.images && car.images.length > 0
      ? `<img src="${car.images[0]}" alt="${car.brand}"/>`
      : `🚗`;

    const statusColor = car.status === 'Til salg' ? 'var(--status-sale-text)' :
                        car.status === 'Solgt'    ? 'var(--status-sold-text)' : 'var(--status-res-text)';

    return `
    <div class="admin-car-row">
      <div class="admin-car-thumb">${thumbHtml}</div>
      <div class="admin-car-info">
        <div class="admin-car-name">${car.brand} ${car.model}</div>
        <div class="admin-car-meta">${car.year} · ${car.km.toLocaleString('da-DK')} km · <span style="color:${statusColor};font-weight:500">${car.status}</span></div>
      </div>
      <div class="admin-car-price">${formatPrice(car.price)}</div>
      <div class="admin-car-actions">
        <button class="btn-edit" onclick="openForm('${car.id}')">Rediger</button>
        <button class="btn-delete" onclick="openDelete('${car.id}')">Slet</button>
      </div>
    </div>`;
  }).join('');
}

// ===== FORM =====
function openForm(id) {
  editingId = id || null;
  pendingImages = [];

  const title = document.getElementById('formTitle');
  title.textContent = id ? 'Rediger bil' : 'Tilføj ny bil';

  if (id) {
    const car = getCarById(id);
    if (!car) return;
    document.getElementById('f_brand').value  = car.brand  || '';
    document.getElementById('f_model').value  = car.model  || '';
    document.getElementById('f_year').value   = car.year   || '';
    document.getElementById('f_km').value     = car.km     || '';
    document.getElementById('f_kml').value    = car.kml    || '';
    document.getElementById('f_fuel').value   = car.fuel   || 'Benzin';
    document.getElementById('f_gear').value   = car.gear   || 'Manuelt gear';
    document.getElementById('f_color').value  = car.color  || '';
    document.getElementById('f_price').value  = car.price  || '';
    document.getElementById('f_status').value = car.status || 'Til salg';
    document.getElementById('f_desc').value   = car.desc   || '';
    pendingImages = car.images ? [...car.images] : [];
  } else {
    ['f_brand','f_model','f_year','f_km','f_kml','f_color','f_price','f_desc'].forEach(id => {
      document.getElementById(id).value = '';
    });
    document.getElementById('f_fuel').value   = 'Benzin';
    document.getElementById('f_gear').value   = 'Manuelt gear';
    document.getElementById('f_status').value = 'Til salg';
  }

  renderImagePreviews();
  document.getElementById('modalOverlay').style.display = 'flex';
}

function closeForm() {
  document.getElementById('modalOverlay').style.display = 'none';
  editingId = null;
  pendingImages = [];
}

function handleImages(event) {
  const files = Array.from(event.target.files);
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      pendingImages.push(e.target.result);
      renderImagePreviews();
    };
    reader.readAsDataURL(file);
  });
  event.target.value = '';
}

function renderImagePreviews() {
  const container = document.getElementById('imagePreviews');
  const prompt    = document.getElementById('uploadPrompt');

  if (pendingImages.length === 0) {
    prompt.style.display = 'block';
    container.innerHTML = '';
    return;
  }

  prompt.style.display = 'none';
  container.innerHTML = pendingImages.map((src, i) => `
    <div class="preview-item">
      <img src="${src}" alt="Foto ${i+1}"/>
      <button class="preview-remove" onclick="removeImage(${i})">✕</button>
    </div>`).join('');
}

function removeImage(idx) {
  pendingImages.splice(idx, 1);
  renderImagePreviews();
}

function saveCar() {
  const brand  = document.getElementById('f_brand').value.trim();
  const model  = document.getElementById('f_model').value.trim();
  const year   = parseInt(document.getElementById('f_year').value);
  const km     = parseInt(document.getElementById('f_km').value);
  const kml    = parseFloat(document.getElementById('f_kml').value) || 0;
  const fuel   = document.getElementById('f_fuel').value;
  const gear   = document.getElementById('f_gear').value;
  const color  = document.getElementById('f_color').value.trim();
  const price  = parseInt(document.getElementById('f_price').value);
  const status = document.getElementById('f_status').value;
  const desc   = document.getElementById('f_desc').value.trim();

  if (!brand || !model || !year || !km || !price) {
    alert('Udfyld venligst: mærke, model, årgang, kilometerstand og pris.');
    return;
  }

  const carData = { brand, model, year, km, kml, fuel, gear, color, price, status, desc, images: pendingImages };

  if (editingId) {
    updateCar(editingId, carData);
  } else {
    addCar(carData);
  }

  closeForm();
  renderAdminList();
}

// ===== DELETE =====
function openDelete(id) {
  deleteTargetId = id;
  document.getElementById('deleteOverlay').style.display = 'flex';
}

function closeDelete() {
  document.getElementById('deleteOverlay').style.display = 'none';
  deleteTargetId = null;
}

function confirmDelete() {
  if (deleteTargetId) {
    deleteCar(deleteTargetId);
    closeDelete();
    renderAdminList();
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem(AUTH_KEY) === '1') {
    showPanel();
  }

  // Close modals on overlay click
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeForm();
  });
  document.getElementById('deleteOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('deleteOverlay')) closeDelete();
  });
});
