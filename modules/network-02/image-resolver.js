const imageCache=new Map();

function exactNameCandidate(results,scientificName){
  const needle=scientificName.trim().toLowerCase();
  return results.find(r=>(r.name||'').toLowerCase()===needle)||results[0];
}
function kingdomFromIconic(iconic){
  const x=(iconic||'').toLowerCase();
  if(['plantae','planta'].includes(x)) return 'Planta';
  if(['fungi','hongo'].includes(x)) return 'Hongo';
  if(['protozoa','protozoario'].includes(x)) return 'Protozoario';
  if(['chromista','cromista'].includes(x)) return 'Cromista';
  if(['bacteria'].includes(x)) return 'Bacteria';
  if(x) return 'Animal';
  return 'Sin clasificar';
}
async function fromINaturalist(scientificName){
  const q=encodeURIComponent(scientificName);
  const res=await fetch(`https://api.inaturalist.org/v1/taxa/autocomplete?q=${q}&per_page=10`);
  if(!res.ok) return null;
  const data=await res.json();
  const taxon=exactNameCandidate(data.results||[],scientificName);
  if(!taxon) return null;
  const photo=taxon.default_photo;
  return {
    url:photo?(photo.medium_url||photo.url||photo.square_url):'',
    source:'iNaturalist',
    sourceUrl:taxon.id?`https://www.inaturalist.org/taxa/${taxon.id}`:'https://www.inaturalist.org/',
    attribution:photo?.attribution||'',
    taxonMatched:taxon.name||scientificName,
    iconicTaxonName:taxon.iconic_taxon_name||'',
    kingdom:kingdomFromIconic(taxon.iconic_taxon_name)
  };
}
async function fromCommons(scientificName){
  const params=new URLSearchParams({action:'query',generator:'search',gsrsearch:scientificName,gsrnamespace:'6',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'640',format:'json',origin:'*'});
  const res=await fetch('https://commons.wikimedia.org/w/api.php?'+params.toString());
  if(!res.ok) return null;
  const data=await res.json(),pages=Object.values((data.query&&data.query.pages)||{});
  const p=pages.find(x=>x.imageinfo&&x.imageinfo[0]); if(!p) return null;
  const info=p.imageinfo[0];
  return {url:info.thumburl||info.url,source:'Wikimedia Commons',sourceUrl:info.descriptionurl||'https://commons.wikimedia.org/',attribution:info.extmetadata?.Artist?.value||'',taxonMatched:scientificName,iconicTaxonName:'',kingdom:'Sin clasificar'};
}
export async function resolveSpeciesImage(species){
  const name=species.taxon||species.scientificName||species.id||'';
  if(!name) return null;
  if(species.imagen_url) return {url:species.imagen_url,source:species.imagen_fuente||'RIBB',kingdom:species.kingdom||'Sin clasificar'};
  if(imageCache.has(name)) return imageCache.get(name);
  let result=null;
  try{result=await fromINaturalist(name)}catch(_){}
  if(!result?.url){try{const fallback=await fromCommons(name); if(fallback) result={...(result||{}),...fallback}}catch(_){}}
  imageCache.set(name,result); return result;
}
export {kingdomFromIconic};
