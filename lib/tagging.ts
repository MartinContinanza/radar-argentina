// Taxonomy of tags used across the app
export const ALL_TAGS = [
  // Regulaciones europeas
  "EUDR",
  "CBAM",
  "CSRD",
  "Regulaciones UE",
  // Sostenibilidad y ambiente
  "Sostenibilidad",
  "Huella de carbono",
  "Deforestación",
  "Biodiversidad",
  "Bioeconomía",
  // Certificaciones y estándares
  "Certificaciones",
  "Orgánicos",
  "Forestería",
  // Sectores productivos
  "Agricultura",
  "Textiles",
  "Biocombustibles",
  "Reciclado",
  // Comercio
  "Comercio exterior",
  "Regulaciones comerciales",
  // Geografía
  "Argentina",
] as const;

export type Tag = (typeof ALL_TAGS)[number];

// Keyword map: each tag has a list of keywords to match against title+summary
const TAG_KEYWORDS: Record<Tag, string[]> = {
  "EUDR": [
    "eudr", "eu deforestation", "deforestation regulation", "reglamento deforestación",
    "regulation deforestation", "due diligence regulation", "diligencia debida ue",
    "forest regulation", "reglamento bosques",
  ],
  "CBAM": [
    "cbam", "carbon border", "mecanismo de ajuste", "carbon adjustment",
    "ajuste en frontera", "carbon frontier", "huella carbono frontera",
    "border carbon", "emissions trading import",
  ],
  "CSRD": [
    "csrd", "corporate sustainability reporting", "informe sostenibilidad corporativa",
    "non-financial reporting", "esg reporting", "reporting directive",
    "sustainability disclosure", "divulgación sostenibilidad", "dnf", "nfrd",
  ],
  "Regulaciones UE": [
    "european union", "unión europea", "comisión europea", "european commission",
    "parlamento europeo", "european parliament", "directiva europea", "eu regulation",
    "reglamento europeo", "green deal", "pacto verde", "taxonomy", "taxonomía ue",
    "fit for 55", "ets", "emission trading", "mercado carbono ue",
  ],
  "Sostenibilidad": [
    "sustainability", "sostenibilidad", "sustainable", "sustentable", "esg",
    "net zero", "carbon neutral", "neutralidad carbono", "scope 1", "scope 2", "scope 3",
    "ghg", "greenhouse gas", "gases efecto invernadero", "climate change", "cambio climático",
    "green", "verde", "renewabl", "renovable", "circular economy", "economía circular",
    "responsible sourcing", "abastecimiento responsable", "supply chain", "cadena de suministro",
  ],
  "Huella de carbono": [
    "carbon footprint", "huella de carbono", "huella carbono", "carbon emission",
    "emisiones co2", "co2 emission", "decarboni", "descarboniz", "net zero",
    "carbon offset", "compensación carbono", "carbon credit", "bono carbono",
    "carbon market", "mercado de carbono", "carbon price", "precio carbono",
    "scope emissions", "lcca", "life cycle", "ciclo de vida",
  ],
  "Deforestación": [
    "deforestation", "deforestación", "forest loss", "pérdida bosques",
    "forest clearance", "desforestación", "illegal logging", "tala ilegal",
    "amazon", "amazonas", "gran chaco", "chaco", "forest degradation",
    "degradación forestal", "no deforestation", "sin deforestación",
    "trazabilidad forestal", "forest traceability",
  ],
  "Biodiversidad": [
    "biodiversity", "biodiversidad", "ecosystem", "ecosistema",
    "species", "especie", "habitat", "hábitat", "wildlife", "fauna",
    "pollinator", "polinizador", "tnfd", "taskforce nature", "kunming",
    "cop15", "cop16", "naturaleza",
  ],
  "Bioeconomía": [
    "bioeconomía", "bioeconomy", "biobased", "bio-based", "biomass", "biomasa",
    "bioproduct", "bioproducto", "circular bioeconomy", "biorefinery",
    "biorrefinería", "green chemistry", "química verde",
  ],
  "Certificaciones": [
    "certification", "certificación", "certified", "certificado",
    "standard", "estándar", "fsc", "iscc", "rspo", "rtrs", "rainforest alliance",
    "bonsucro", "globalg.a.p", "ifoam", "organic certification", "fair trade",
    "comercio justo", "sgs", "bureau veritas", "control union", "tüv",
    "audit", "auditoría", "compliance", "cumplimiento",
  ],
  "Orgánicos": [
    "organic", "orgánico", "orgánica", "agroecolog", "agroecología",
    "pesticide free", "sin pesticidas", "biodynamic", "biodinámic",
    "natural farming", "agricultura natural", "regenerative", "regenerativa",
  ],
  "Forestería": [
    "forestry", "forestería", "silvicultura", "forest management", "manejo forestal",
    "timber", "madera", "wood", "lumber", "pulp", "celulosa", "paper", "papel",
    "afforestation", "reforestation", "reforestación", "plantation", "plantación",
    "fsc certification", "cadena custodia",
  ],
  "Agricultura": [
    "agriculture", "agricultura", "agri", "farming", "campo", "rural",
    "crop", "cultivo", "harvest", "cosecha", "soy", "soja", "corn", "maíz",
    "wheat", "trigo", "sunflower", "girasol", "livestock", "ganadería",
    "cattle", "bovine", "vacuno", "pork", "porcino", "poultry", "avicultura",
    "dairy", "lácteos", "fish", "aquaculture", "acuicultura", "senasa",
    "food safety", "inocuidad", "phytosanitary", "fitosanitario",
  ],
  "Textiles": [
    "textile", "textil", "apparel", "clothing", "ropa", "fashion", "moda",
    "cotton", "algodón", "wool", "lana", "fiber", "fibra",
    "recycled polyester", "poliéster reciclado", "sustainable fashion",
    "moda sostenible", "eu textile", "strategy for sustainable textiles",
  ],
  "Biocombustibles": [
    "biofuel", "biocombustible", "biodiesel", "bioethanol", "bioetanol",
    "renewable fuel", "combustible renovable", "iscc", "red ii", "red iii",
    "renewable energy directive", "directiva energía renovable",
    "sustainable aviation fuel", "saf", "feedstock", "materia prima",
  ],
  "Reciclado": [
    "recycled", "reciclado", "recycling", "reciclaje", "circular", "circular economy",
    "waste", "residuo", "end of life", "fin de vida", "post-consumer",
    "upcycled", "upcycling", "reuse", "reutilización",
  ],
  "Comercio exterior": [
    "export", "exportación", "exportar", "import", "importación",
    "trade", "comercio", "market access", "acceso al mercado",
    "tariff", "arancel", "quota", "cuota", "customs", "aduana",
    "cancillería", "chancellor", "free trade", "libre comercio",
    "mercosur", "wto", "omc", "unctad", "fas", "usda",
  ],
  "Regulaciones comerciales": [
    "regulation", "regulación", "regul", "policy", "política",
    "law", "ley", "directive", "directiva", "framework", "marco",
    "requirement", "requisito", "compliance", "cumplimiento",
    "due diligence", "diligencia debida", "mandatory", "obligatorio",
    "sanction", "sanción", "enforcement", "aplicación",
  ],
  "Argentina": [
    "argentina", "argentino", "argentines", "buenos aires", "senasa",
    "cancillería", "ministerio de agricultura", "secretaría bioeconomía",
    "clarin", "la nación", "infobae", "bichos de campo",
  ],
};

export function detectTags(text: string): Tag[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  return ALL_TAGS.filter(tag => {
    const keywords = TAG_KEYWORDS[tag];
    return keywords.some(kw => lower.includes(kw));
  });
}
