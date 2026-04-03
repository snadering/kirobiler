// ===== DATA LAYER =====
// Cars are stored in localStorage so they persist between sessions.
// In a production setup you would replace this with Supabase API calls.

const STORAGE_KEY = 'kirobiler_cars';

const SAMPLE_CARS = [
  {
    id: 'car_1',
    brand: 'Volkswagen', model: 'Golf GTI',
    year: 2023, km: 18500, kml: 16.2,
    fuel: 'Benzin', gear: 'Manuelt gear', color: 'Tornado Rød',
    price: 329900, status: 'Til salg',
    desc: 'Fremragende stand. Fuld servicehistorik fra VW. Sportssæder, adaptiv fartpilot, keyless entry. Aldrig rygere. Syn til 2026.',
    images: []
  },
  {
    id: 'car_2',
    brand: 'Toyota', model: 'RAV4 Hybrid',
    year: 2021, km: 42000, kml: 22.4,
    fuel: 'Hybrid', gear: 'Automatgear', color: 'Hvid perlemor',
    price: 479000, status: 'Til salg',
    desc: 'Familievenlig SUV med lav brændstofforbrug. 7-personers sæder. Panoramatag. Fuld Toyota servicehistorik.',
    images: []
  },
  {
    id: 'car_3',
    brand: 'Tesla', model: 'Model 3 Long Range',
    year: 2022, km: 31200, kml: 0,
    fuel: 'Elbil', gear: 'Automatgear', color: 'Midnatssort',
    price: 389000, status: 'Til salg',
    desc: '530 km rækkevidde. Hvid interiør. Autopilot. Opgraderingspakke med premium audio. Gratis opladning på Tesla Supercharger til marts 2025.',
    images: []
  },
  {
    id: 'car_4',
    brand: 'BMW', model: '320d xDrive',
    year: 2020, km: 68000, kml: 20.8,
    fuel: 'Diesel', gear: 'Automatgear', color: 'Grå metallic',
    price: 349500, status: 'Solgt',
    desc: 'M-sport pakke, 190 hk, heads-up display, trækhjulstræk. Fuldt serviceret. Ny syn 2026.',
    images: []
  }
];

function getCars() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  // First run: seed with sample data
  saveCarsData(SAMPLE_CARS);
  return SAMPLE_CARS;
}

function saveCarsData(cars) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
}

function addCar(car) {
  const cars = getCars();
  car.id = 'car_' + Date.now();
  cars.unshift(car);
  saveCarsData(cars);
  return car;
}

function updateCar(id, updated) {
  const cars = getCars();
  const idx = cars.findIndex(c => c.id === id);
  if (idx !== -1) { cars[idx] = { ...cars[idx], ...updated }; saveCarsData(cars); }
}

function deleteCar(id) {
  const cars = getCars().filter(c => c.id !== id);
  saveCarsData(cars);
}

function getCarById(id) {
  return getCars().find(c => c.id === id) || null;
}
