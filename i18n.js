// ===== TRANSLATION SYSTEM =====
// All Danish strings have an English equivalent via data-da / data-en attributes.
// Call applyLang() after any dynamic DOM update.

const LANG_KEY = 'kirobiler_lang';

function getCurrentLang() {
  return localStorage.getItem(LANG_KEY) || 'da';
}

function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
  document.documentElement.setAttribute('data-lang', lang);
  applyLang(lang);
  updateLangToggle(lang);
}

function applyLang(lang) {
  lang = lang || getCurrentLang();
  document.querySelectorAll('[data-da]').forEach(el => {
    const text = el.getAttribute('data-' + lang);
    if (!text) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = text;
    } else if (el.tagName === 'OPTION') {
      el.textContent = text;
    } else {
      el.innerHTML = text;
    }
  });
  document.documentElement.lang = lang === 'da' ? 'da' : 'en';
}

function updateLangToggle(lang) {
  const flag = document.getElementById('langFlag');
  const label = document.getElementById('langLabel');
  if (!flag) return;
  if (lang === 'da') { flag.textContent = '🇩🇰'; label.textContent = 'DA'; }
  else               { flag.textContent = '🇺🇸'; label.textContent = 'EN'; }
}

function initLang() {
  const lang = getCurrentLang();
  document.documentElement.setAttribute('data-lang', lang);
  applyLang(lang);
  updateLangToggle(lang);

  const btn = document.getElementById('langToggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const next = getCurrentLang() === 'da' ? 'en' : 'da';
      setLang(next);
    });
  }
}

// Translation helpers for dynamically created elements
const T = {
  // Car listing page
  seeBil:  { da: 'Se bil', en: 'View car' },
  tilSalg: { da: 'Til salg', en: 'For sale' },
  solgt:   { da: 'Solgt', en: 'Sold' },
  reserveret: { da: 'Reserveret', en: 'Reserved' },
  km:      { da: 'km', en: 'km' },
  kml:     { da: 'km/l', en: 'mpg' },
  // Specs
  aargang: { da: 'Årgang', en: 'Year' },
  kmstand: { da: 'Kilometerstand', en: 'Mileage' },
  braendstof: { da: 'Brændstof', en: 'Fuel type' },
  gear:    { da: 'Gearkasse', en: 'Gearbox' },
  farve:   { da: 'Farve', en: 'Colour' },
  // Fuel types
  Benzin:  { da: 'Benzin', en: 'Petrol' },
  Diesel:  { da: 'Diesel', en: 'Diesel' },
  Hybrid:  { da: 'Hybrid', en: 'Hybrid' },
  Elbil:   { da: 'Elbil', en: 'Electric' },
  // Gear
  'Manuelt gear':  { da: 'Manuelt gear', en: 'Manual' },
  'Automatgear':   { da: 'Automatgear', en: 'Automatic' },
};

function t(key) {
  const lang = getCurrentLang();
  return (T[key] && T[key][lang]) ? T[key][lang] : key;
}

document.addEventListener('DOMContentLoaded', initLang);
