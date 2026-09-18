import fs from "node:fs";

const bacias = JSON.parse(fs.readFileSync("circunscricoes_hidrograficas_mg.geojson", "utf8"));
const estacoes = JSON.parse(fs.readFileSync("estacoes_sace_mg.geojson", "utf8"));

function pointInRing(pt, ring) {
  let inside = false;
  const [x, y] = pt;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInPolygonGeom(pt, geom) {
  if (geom.type === "Polygon") {
    if (!pointInRing(pt, geom.coordinates[0])) return false;
    for (let k = 1; k < geom.coordinates.length; k++) {
      if (pointInRing(pt, geom.coordinates[k])) return false; // hole
    }
    return true;
  } else if (geom.type === "MultiPolygon") {
    for (const poly of geom.coordinates) {
      if (pointInRing(pt, poly[0])) {
        let inHole = false;
        for (let k = 1; k < poly.length; k++) {
          if (pointInRing(pt, poly[k])) { inHole = true; break; }
        }
        if (!inHole) return true;
      }
    }
    return false;
  }
  return false;
}

function isInMG(lon, lat) {
  const pt = [lon, lat];
  for (const f of bacias.features) {
    if (pointInPolygonGeom(pt, f.geometry)) return true;
  }
  return false;
}

const dentro = [];
const fora = [];
for (const f of estacoes.features) {
  const [lon, lat] = f.geometry.coordinates;
  if (isInMG(lon, lat)) dentro.push(f);
  else fora.push(f);
}

console.error(`Dentro de MG: ${dentro.length}`);
console.error(`Fora de MG: ${fora.length}`);
fora.forEach(f => console.error(`  FORA: ${f.properties.codigo_tooltip} (${f.properties.bacia}) [${f.geometry.coordinates}]`));

const out = { type: "FeatureCollection", features: dentro };
fs.writeFileSync("estacoes_sace_mg_filtrado.geojson", JSON.stringify(out, null, 2), "utf8");
console.error("Wrote estacoes_sace_mg_filtrado.geojson");
