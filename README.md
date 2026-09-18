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

## Atualização

Dados extraídos em 2026-09-18 a partir do GeoServer público do IGAM. Para atualizar, refazer a consulta WFS e reprocessar com mapshaper.
