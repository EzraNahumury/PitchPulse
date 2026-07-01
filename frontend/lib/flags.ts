// Maps a team name (as returned by the feed) to its premium flag-card asset in
// public/asset/Stickers. Names are normalised (lowercase, accent- and
// punctuation-stripped) and a few aliases cover the feed's spellings.

const FILES: Record<string, string> = {
  argentina: "001_ARGENTINA.jpg",
  australia: "002_AUSTRALIA.jpg",
  austria: "003_AUSTRIA.jpg",
  belgium: "004_BELGIUM_31245203.jpg",
  brazil: "005_BRAZIL.jpg",
  canada: "006_CANADA.jpg",
  "costa rica": "007_COSTA_RICA.jpg",
  croatia: "008_CROATIA.jpg",
  "czech republic": "009_CZECH_REPUBLIC.jpg",
  denmark: "010_DENMARK.jpg",
  ecuador: "011_ECUADOR.jpg",
  egypt: "012_EGYPT.jpg",
  england: "013_ENGLAND_1861c69d.jpg",
  france: "014_FRANCE_50f489c3.jpg",
  germany: "015_GERMANY.jpg",
  ghana: "016_GHANA.jpg",
  iran: "017_IRAN.jpg",
  italy: "018_ITALY.jpg",
  japan: "019_JAPAN.jpg",
  "south korea": "020_SOUTH_KOREA_faaad415.jpg",
  mexico: "021_MEXICO_6c4f3ab4.jpg",
  morocco: "022_MOROCCO.jpg",
  netherlands: "023_NETHERLANDS.jpg",
  "new zealand": "024_NEW_ZEALAND_8b255506.jpg",
  nigeria: "025_NIGERIA.jpg",
  norway: "026_NORWAY.jpg",
  panama: "027_PANAMA.jpg",
  paraguay: "028_PARAGUAY.jpg",
  poland: "029_POLAND.jpg",
  portugal: "030_PORTUGAL.jpg",
  "saudi arabia": "031_SAUDI_ARABIA.jpg",
  senegal: "032_SENEGAL.jpg",
  serbia: "033_SERBIA.jpg",
  "south africa": "034_SOUTH_AFRICA.jpg",
  spain: "035_SPAIN.jpg",
  sweden: "036_SWEDEN.jpg",
  switzerland: "037_SWITZERLAND.jpg",
  tunisia: "038_TUNISIA.jpg",
  turkey: "039_TURKEY.jpg",
  ukraine: "040_UKRAINE.jpg",
  "united states": "041_UNITED_STATES.jpg",
  uruguay: "042_URUGUAY.jpg",
  uzbekistan: "043_UZBEKISTAN.jpg",
  wales: "044_WALES.jpg",
  algeria: "045_ALGERIA.jpg",
  colombia: "046_COLOMBIA.jpg",
  peru: "047_PERU.jpg",
  cameroon: "048_CAMEROON.jpg",
  "bosnia and herzegovina": "049_BOSNIA_AND_HERZEGOVINA.jpg",
  "ivory coast": "050_IVORY_COAST.jpg",
  "dr congo": "051_DR_CONGO.jpg",
  "cape verde": "052_CAPE_VERDE.jpg",
  curacao: "053_CURACAO.jpg",
  haiti: "054_HAITI.jpg",
  iraq: "055_IRAQ.jpg",
  jordan: "056_JORDAN.jpg",
  qatar: "057_QATAR.jpg",
  scotland: "058_SCOTLAND.jpg",
};

// Alternate spellings the feed may use.
const ALIASES: Record<string, string> = {
  usa: "united states",
  "united states of america": "united states",
  "congo dr": "dr congo",
  "dr congo republic": "dr congo",
  "korea republic": "south korea",
  "korea south": "south korea",
  czechia: "czech republic",
  "cote divoire": "ivory coast",
  "ivory coast republic": "ivory coast",
  turkiye: "turkey",
  holland: "netherlands",
};

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/** Returns the public path to a team's flag card, or null if unmapped. */
export function flagCard(teamName: string): string | null {
  const n = normalize(teamName);
  const key = ALIASES[n] ?? n;
  const file = FILES[key];
  return file ? `/asset/Stickers/${file}` : null;
}
