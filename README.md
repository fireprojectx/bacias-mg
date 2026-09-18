# Bacias Hidrográficas de Minas Gerais

GeoJSON com as **43 Circunscrições Hidrográficas (CH)** oficiais de Minas Gerais — unidades de planejamento e gestão de recursos hídricos do estado, cobrindo as principais bacias (São Francisco, Rio Doce, Grande, Jequitinhonha, Paranaíba, Mucuri, Pardo, Itabapoana, entre outras).

- **Fonte:** IGAM/SISEMA — GeoServer oficial (`geoserver.meioambiente.mg.gov.br`), camada `IDE:ide_1108_mg_circunscricoes_hidrograficas_pol`
- **Projeção:** EPSG:4674 (SIRGAS 2000)
- **Geometria simplificada** (mapshaper, `-simplify 8%`) para reduzir o arquivo original de ~41MB para uso direto como camada web
- **Atributos:** sigla, nome, bacia federal, área (km²), sede administrativa, comitê de bacia (CBH), decreto de criação, entre outros metadados do IGAM

## Uso no ArcGIS

No ArcGIS Online ou ArcGIS Pro: **Add Data → From URL**, tipo **GeoJSON**, colar o link raw deste arquivo:

```
https://raw.githubusercontent.com/fireprojectx/bacias-mg/master/circunscricoes_hidrograficas_mg.geojson
```

## Estações de monitoramento (cotas), fonte SACE/SGB

`estacoes_sace_mg.geojson` — 28 estações fluviométricas em Minas Gerais monitoradas pelo SACE (Sistema de Alerta de Eventos Críticos, SGB/CPRM), extraídas dos endpoints públicos `estacoes_mapa.php` e `relatorio.php` de cada bacia (Doce, Muriaé, Velhas, Pomba, São Francisco) e filtradas para dentro do território de MG.

Atributos: `bacia`, `codigo_tooltip` (código/nome da estação), `cor_status` (cor do marcador igual ao mapa do SACE), `cota_cm` (cota atual em cm), `situacao` (Normal / Alerta / Sem Dados etc.), `ultima_medicao`, `local`.

```
https://raw.githubusercontent.com/fireprojectx/bacias-mg/master/estacoes_sace_mg.geojson
```

**Importante:** isso é uma **foto (snapshot)** do momento da extração — o SACE atualiza a cada poucos minutos, mas este arquivo só atualiza quando alguém rodar o script de extração novamente e publicar de novo. Não é um feed ao vivo.

## Atualização

Dados extraídos em 2026-09-18 a partir do GeoServer público do IGAM (bacias) e dos endpoints públicos do SACE/SGB (estações/cotas). Para atualizar, refazer a consulta WFS e/ou reprocessar os scripts `estacoes_sace.mjs` + `filtrar_mg.mjs`.
