// Resolución de imágenes para especies visibles en network-02.
// Prioridad: URL ya guardada -> iNaturalist -> Wikimedia Commons.
// No se usa una imagen genérica como si fuera evidencia de una especie.

const imageCache = new Map();

function exactNameCandidate(results, scientificName) {
  const needle = scientificName.trim().toLowerCase();
  return results.find(r => (r.name || '').toLowerCase() === needle) || results[0];
}

async function fromINaturalist(scientificName) {
  const q = encodeURIComponent(scientificName);
  const url = `https://api.inaturalist.org/v1/taxa/autocomplete?q=${q}&per_page=10`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const taxon = exactNameCandidate(data.results || [], scientificName);
  const photo = taxon && taxon.default_photo;
  if (!photo) return null;
  return {
    url: photo.medium_url || photo.url || photo.square_url,
    source: 'iNaturalist',
    sourceUrl: taxon.id ? `https://www.inaturalist.org/taxa/${taxon.id}` : 'https://www.inaturalist.org/',
    attribution: photo.attribution || '',
    taxonMatched: taxon.name || scientificName
  };
}

async function fromCommons(scientificName) {
  const params = new URLSearchParams({
    action:'query', generator:'search', gsrsearch:scientificName, gsrnamespace:'6',
    prop:'imageinfo', iiprop:'url|extmetadata', iiurlwidth:'640',
    format:'json', origin:'*'
  });
  const res = await fetch('https://commons.wikimedia.org/w/api.php?' + params.toString());
  if (!res.ok) return null;
  const data = await res.json();
  const pages = Object.values((data.query && data.query.pages) || {});
  const p = pages.find(x => x.imageinfo && x.imageinfo[0]);
  if (!p) return null;
  const info = p.imageinfo[0];
  return {
    url: info.thumburl || info.url,
    source: 'Wikimedia Commons',
    sourceUrl: info.descriptionurl || 'https://commons.wikimedia.org/',
    attribution: (info.extmetadata && info.extmetadata.Artist && info.extmetadata.Artist.value) || '',
    taxonMatched: scientificName
  };
}

export async function resolveSpeciesImage(species) {
  const name = species.taxon || species.scientificName || '';
  if (!name) return null;
  if (species.imagen_url) return {url:species.imagen_url,source:species.imagen_fuente || 'RIBB'};
  if (imageCache.has(name)) return imageCache.get(name);

  let result = null;
  try { result = await fromINaturalist(name); } catch (_) {}
  if (!result) {
    try { result = await fromCommons(name); } catch (_) {}
  }
  imageCache.set(name, result);
  return result;
}

// Regla de interfaz: una especie entra a la red visual solo después de resolver
// una imagen específica. Los taxones superiores (Insecta, Fungi, etc.) se
// muestran como categorías, no como “especies”.
