// ===== ADMIN PANEL — SUPABASE AUTH =====

let editingId = null;
let deleteTargetId = null;
let pendingImages = [];

// ===== AUTH =====
function togglePassword() {
  const input = document.getElementById('passwordInput');
  input.type = input.type === 'password' ? 'text' : 'password';
}


async function checkLogin() {
  const email    = document.getElementById('emailInput').value.trim();
  const password = document.getElementById('passwordInput').value;
  const errEl    = document.getElementById('loginError');
  const btn      = document.getElementById('loginBtn');

  if (!email || !password) {
    errEl.textContent = 'Udfyld venligst email og adgangskode.';
    errEl.style.display = 'block';
    return;
  }

  btn.textContent = 'Logger ind...';
  btn.disabled = true;

  const { data, error } = await sb.auth.signInWithPassword({ email, password });

  if (error) {
    errEl.textContent = 'Forkert email eller adgangskode. Prøv igen.';
    errEl.style.display = 'block';
    btn.textContent = 'Log ind';
    btn.disabled = false;
    return;
  }

  showPanel();
}

async function adminLogout() {
  await sb.auth.signOut();
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

async function renderAdminList() {
  const list = document.getElementById('adminCarList');
  list.innerHTML = '<p style="color:var(--text-secondary);padding:40px 0;text-align:center">Henter biler...</p>';

  const cars = await getCars();

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
        <div class="admin-car-meta">${car.year}${car.km ? ` · ${car.km.toLocaleString('da-DK')} km` : ''} · <span style="color:${statusColor};font-weight:500">${car.status}</span></div>
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
async function openForm(id) {
  editingId = id || null;
  pendingImages = [];

  document.getElementById('formTitle').textContent = id ? 'Rediger bil' : 'Tilføj ny bil';

  // Clear all fields first
  ['f_brand','f_model','f_year','f_km','f_kml','f_color','f_price','f_desc'].forEach(fid => {
    document.getElementById(fid).value = '';
  });
  document.getElementById('f_fuel').value   = 'Benzin';
  document.getElementById('f_gear').value   = 'Manuelt gear';
  document.getElementById('f_status').value = 'Til salg';
  renderImagePreviews();

  // Show modal — if editing, show spinner over form while fetching
  document.getElementById('modalOverlay').style.display = 'flex';

  if (id) {
    const modalBody = document.querySelector('.modal-body');
    const originalContent = modalBody.innerHTML;
    modalBody.innerHTML = '<div class="modal-loader"><div class="spinner"></div><span>Henter biloplysninger...</span></div>';

    const car = await getCarById(id);

    modalBody.innerHTML = originalContent;

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
    renderImagePreviews();
  }
}

function closeForm() {
  document.getElementById('modalOverlay').style.display = 'none';
  editingId = null;
  pendingImages = [];
}

function compressImage(file) {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1600;
      let w = img.width, h = img.height;
      if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      canvas.toBlob(resolve, 'image/jpeg', 0.82);
    };
    img.src = url;
  });
}

async function handleImages(event) {
  const files = Array.from(event.target.files);
  event.target.value = '';

  for (const file of files) {
    // Show a local preview immediately so user gets instant feedback
    const localUrl = URL.createObjectURL(file);
    const index = pendingImages.length;
    pendingImages.push(localUrl);
    renderImagePreviews();

    const blob = await compressImage(file);
    const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
    const { error } = await sb.storage.from('car-images').upload(path, blob, { contentType: 'image/jpeg', upsert: true });
    if (error) {
      console.error('Image upload error:', error);
      alert(`Billede kunne ikke uploades: ${error.message}`);
      pendingImages.splice(index, 1);
      renderImagePreviews();
      continue;
    }
    const { data: { publicUrl } } = sb.storage.from('car-images').getPublicUrl(path);
    URL.revokeObjectURL(localUrl);
    pendingImages[index] = publicUrl;
  }
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
      <button class="preview-remove" onclick="event.stopPropagation();removeImage(${i})">✕</button>
    </div>`).join('');
}

function removeImage(idx) {
  pendingImages.splice(idx, 1);
  renderImagePreviews();
}

async function saveCar() {
  const brand  = document.getElementById('f_brand').value.trim();
  const model  = document.getElementById('f_model').value.trim();
  const year   = parseInt(document.getElementById('f_year').value);
  const km     = parseInt(document.getElementById('f_km').value) || null;
  const kml    = parseFloat(document.getElementById('f_kml').value) || null;
  const fuel   = document.getElementById('f_fuel').value;
  const gear   = document.getElementById('f_gear').value;
  const color  = document.getElementById('f_color').value.trim();
  const price  = parseInt(document.getElementById('f_price').value);
  const status = document.getElementById('f_status').value;
  const desc   = document.getElementById('f_desc').value.trim();

  if (!brand || !model || !year || !price) {
    alert('Udfyld venligst: mærke, model, årgang og pris.');
    return;
  }

  const saveBtn = document.querySelector('.modal-footer .btn-primary');
  saveBtn.textContent = 'Gemmer...';
  saveBtn.disabled = true;

  const carData = { brand, model, year, km, kml, fuel, gear, color, price, status, desc, images: pendingImages };

  if (editingId) {
    await updateCar(editingId, carData);
  } else {
    await addCar(carData);
  }

  saveBtn.textContent = 'Gem bil';
  saveBtn.disabled = false;

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

async function confirmDelete() {
  if (deleteTargetId) {
    await deleteCar(deleteTargetId);
    closeDelete();
    renderAdminList();
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  // Check if already logged in
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    showPanel();
  }

  // Enter key on password field
  document.getElementById('passwordInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') checkLogin();
  });

  // Close modals on overlay click
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeForm();
  });
  document.getElementById('deleteOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('deleteOverlay')) closeDelete();
  });
});
