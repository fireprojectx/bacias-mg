import fs from "node:fs";

const BACIAS = ["doce", "muriae", "velhas", "pomba", "saofrancisco"];
const BASE = "https://sace.sgb.gov.br";
const UA = "Mozilla/5.0 (research script - contato: wallacefaz@gmail.com)";

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getText(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.text();
}

function parseStations(html, bacia) {
  // Match blocks: const estacao<bacia>_pmX_sY_srZ = L.circleMarker([lat, lon], { ... fillColor: "#XXXXXX" ...}) ... .bindTooltip("NOME", ...
  const stations = [];
  const re = /const\s+estacao\w*_pm(\d+)_s(\d+)_sr(\d+)\s*=\s*L\.circleMarker\(\[(-?\d+\.?\d*),\s*(-?\d+\.?\d*)\],\s*\{[^}]*?fillColor:\s*"(#[0-9A-Fa-f]{6})"[^}]*?\}\)[\s\S]*?\.bindTooltip\("([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    stations.push({
      bacia,
      pm: m[1],
      s: m[2],
      sr: m[3],
      lat: parseFloat(m[4]),
      lon: parseFloat(m[5]),
      fillColor: m[6],
      tooltip: m[7],
    });
  }
  return stations;
}

function parseRelatorio(html) {
  const cotaMatch = html.match(/<h2[^>]*>([\d.,]+)\s*Cota\s*\(cm\)<\/h2>/i);
  const medicaoMatch = html.match(/Última medição:\s*<b>([^<]+)<\/b>/i);
  const situacaoMatch = html.match(/Situa[cç][aã]o:\s*<span[^>]*><\/span>([^<\n]+)/i);
  const nomeMatch = html.match(/Nível do rio[^-]*-\s*([^<\n]+)/i);
  return {
    cota_cm: cotaMatch ? parseFloat(cotaMatch[1].replace(",", ".")) : null,
    ultima_medicao: medicaoMatch ? medicaoMatch[1].trim() : null,
    situacao: situacaoMatch ? situacaoMatch[1].trim() : null,
    nome_local: nomeMatch ? nomeMatch[1].trim() : null,
  };
}

const allFeatures = [];
const errors = [];

for (const bacia of BACIAS) {
  console.error(`=== ${bacia} ===`);
  let html;
  try {
    html = await getText(`${BASE}/estacoes_mapa.php?bacia=${bacia}`);
  } catch (e) {
    console.error(`Falha ao buscar mapa de ${bacia}: ${e.message}`);
    errors.push({ bacia, error: e.message });
    continue;
  }
  const stations = parseStations(html, bacia);
  console.error(`  ${stations.length} estações encontradas`);
  await sleep(500);

  for (const st of stations) {
    const url = `${BASE}/relatorio.php?apenas_grafico=sim&bacia=${st.bacia}&pm=${st.pm}&s=${st.s}&sr=${st.sr}`;
    try {
      const rhtml = await getText(url);
      const info = parseRelatorio(rhtml);
      allFeatures.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: [st.lon, st.lat] },
        properties: {
          bacia: st.bacia,
          codigo_tooltip: st.tooltip,
          pm: st.pm,
          s: st.s,
          sr: st.sr,
          cor_status: st.fillColor,
          cota_cm: info.cota_cm,
          situacao: info.situacao,
          ultima_medicao: info.ultima_medicao,
          local: info.nome_local,
        },
      });
      console.error(`  OK: ${st.tooltip} -> cota=${info.cota_cm}cm situacao=${info.situacao}`);
    } catch (e) {
      console.error(`  ERRO estacao ${st.tooltip}: ${e.message}`);
      errors.push({ bacia, station: st.tooltip, error: e.message });
    }
    await sleep(400);
  }
}

const geojson = { type: "FeatureCollection", features: allFeatures };
fs.writeFileSync("estacoes_sace_mg.geojson", JSON.stringify(geojson, null, 2), "utf8");
console.error(`\nTotal features: ${allFeatures.length}`);
console.error(`Erros: ${errors.length}`);
if (errors.length) console.error(JSON.stringify(errors, null, 2));
console.error("Wrote estacoes_sace_mg.geojson");
