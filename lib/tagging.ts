const TAG_RULES: Record<string, string[]> = {
  EUDR: ["eudr", "deforestation regulation", "eu deforestation"],
  CBAM: ["cbam", "carbon border", "carbon adjustment mechanism"],
  CSRD: ["csrd", "corporate sustainability reporting", "sustainability reporting directive"],
  "due diligence": ["due diligence", "diligencia debida"],
  deforestation: ["deforestation", "deforestación", "forest loss"],
  organic: ["organic", "orgánico", "organics", "ecológico"],
  recycled: ["recycled", "reciclado", "circular economy", "economía circular"],
  "biofuels/ISCC": ["biofuel", "iscc", "renewable fuel", "combustible renovable"],
  textiles: ["textile", "textil", "clothing", "apparel", "ropa"],
  agriculture: ["agriculture", "agricultural", "agricultura", "agro", "farming", "crop"],
  forestry: ["forestry", "forest", "forestal", "timber", "madera"],
  "exports/imports": ["export", "import", "exportación", "importación", "trade", "comercio exterior", "arancel", "tariff"],
};

export function detectTags(text: string): string[] {
  const lower = text.toLowerCase();
  const detected: string[] = [];
  for (const [tag, keywords] of Object.entries(TAG_RULES)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      detected.push(tag);
    }
  }
  return detected;
}

export const ALL_TAGS = Object.keys(TAG_RULES);
