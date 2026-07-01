import Image from "next/image";

// Premium flag "collectible" cards from public/asset/Stickers. A spread of
// nations, opening with the four that appear in the live devnet feed
// (Jordan, Argentina, Algeria, Austria, South Africa, Canada).
const CARDS: { file: string; name: string }[] = [
  { file: "056_JORDAN.jpg", name: "Jordan" },
  { file: "001_ARGENTINA.jpg", name: "Argentina" },
  { file: "045_ALGERIA.jpg", name: "Algeria" },
  { file: "003_AUSTRIA.jpg", name: "Austria" },
  { file: "034_SOUTH_AFRICA.jpg", name: "South Africa" },
  { file: "006_CANADA.jpg", name: "Canada" },
  { file: "005_BRAZIL.jpg", name: "Brazil" },
  { file: "015_GERMANY.jpg", name: "Germany" },
  { file: "035_SPAIN.jpg", name: "Spain" },
  { file: "030_PORTUGAL.jpg", name: "Portugal" },
  { file: "023_NETHERLANDS.jpg", name: "Netherlands" },
  { file: "008_CROATIA.jpg", name: "Croatia" },
  { file: "019_JAPAN.jpg", name: "Japan" },
  { file: "022_MOROCCO.jpg", name: "Morocco" },
  { file: "042_URUGUAY.jpg", name: "Uruguay" },
  { file: "018_ITALY.jpg", name: "Italy" },
];

// Duplicated once so the -50% translate loops seamlessly.
const LOOP = [...CARDS, ...CARDS];

export default function StickerMarquee() {
  return (
    <div className="relative overflow-hidden py-2">
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />

      <div className="marquee-track flex w-max gap-4">
        {LOOP.map((c, i) => (
          <figure
            key={`${c.file}-${i}`}
            className="relative h-56 w-40 shrink-0 overflow-hidden rounded-xl ring-1 ring-neutral-200 shadow-sm"
          >
            <Image
              src={`/asset/Stickers/${c.file}`}
              alt={`${c.name} — collectible card`}
              fill
              sizes="160px"
              className="object-cover"
            />
          </figure>
        ))}
      </div>
    </div>
  );
}
