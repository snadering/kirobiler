// ===== DATA LAYER — SUPABASE =====
// All car data is now stored in Supabase Postgres.
// Images are stored as base64 text in the images column (comma-separated).

async function getCars() {
  const { data, error } = await sb
    .from('cars')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('getCars error:', error); return []; }
  return data.map(parseCar);
}

async function getCarById(id) {
  const { data, error } = await sb
    .from('cars')
    .select('*')
    .eq('id', id)
    .single();
  if (error) { console.error('getCarById error:', error); return null; }
  return parseCar(data);
}

async function addCar(car) {
  const { data, error } = await sb
    .from('cars')
    .insert([formatCar(car)])
    .select()
    .single();
  if (error) { console.error('addCar error:', error); return null; }
  return parseCar(data);
}

async function updateCar(id, car) {
  const { error } = await sb
    .from('cars')
    .update(formatCar(car))
    .eq('id', id);
  if (error) console.error('updateCar error:', error);
}

async function deleteCar(id) {
  const { error } = await sb
    .from('cars')
    .delete()
    .eq('id', id);
  if (error) console.error('deleteCar error:', error);
}

// Images stored as JSON array string in the text column
function formatCar(car) {
  return {
    brand:  car.brand,
    model:  car.model,
    year:   car.year,
    km:     car.km,
    kml:    car.kml,
    fuel:   car.fuel,
    gear:   car.gear,
    color:  car.color,
    price:  car.price,
    status: car.status,
    desc:   car.desc,
    images: JSON.stringify(car.images || [])
  };
}

function parseCar(row) {
  let images = [];
  try { images = JSON.parse(row.images || '[]'); } catch(e) {}
  return { ...row, images };
}
