import { prisma } from "../src/lib/prisma";

// Coordenadas aproximadas em Teresina-PI, só para popular o mapa no MVP.
// Trocar por dados geocodificados de verdade quando o cadastro de locais
// (RF04, vitrine do empreendedor) existir.
const today17h = new Date();
today17h.setHours(17, 0, 0, 0);

const places = [
  {
    name: "Museu do Piauí",
    description: "Museu histórico no centro de Teresina, com acervo sobre a formação do estado.",
    category: "TURISMO" as const,
    latitude: -5.0919,
    longitude: -42.8034,
    address: "Centro, Teresina - PI",
    imageUrl:
      "https://slayezxjtclzldutarwr.supabase.co/storage/v1/object/public/image/local_museu_piaui.jpg",
    rating: 4.3,
    isFree: true,
    eventDate: null,
  },
  {
    name: "Parque Cidadania",
    description: "Área verde com pista de caminhada e espaços de lazer ao ar livre.",
    category: "LAZER" as const,
    latitude: -5.102,
    longitude: -42.785,
    address: "Teresina - PI",
    imageUrl:
      "https://slayezxjtclzldutarwr.supabase.co/storage/v1/object/public/image/local_parque_da_cidadania.jpg",
    rating: null,
    isFree: true,
    eventDate: null,
  },
  {
    name: "Bar do Rufino",
    description: "Bar tradicional com música ao vivo e petiscos regionais.",
    category: "GASTRONOMIA" as const,
    latitude: -5.098,
    longitude: -42.81,
    address: "Teresina - PI",
    imageUrl:
      "https://slayezxjtclzldutarwr.supabase.co/storage/v1/object/public/image/local_bar_do_rufino.webp",
    rating: 4.5,
    isFree: false,
    eventDate: null,
  },
  {
    name: "Kartódromo - Rio Poty",
    description: "Pista de kart às margens do Rio Poty, aberta para corridas recreativas.",
    category: "LAZER" as const,
    latitude: -5.065,
    longitude: -42.775,
    address: "Rio Poty, Teresina - PI",
    imageUrl:
      "https://slayezxjtclzldutarwr.supabase.co/storage/v1/object/public/image/local_kart_rio_poty.jpg",
    rating: 5.0,
    isFree: false,
    eventDate: null,
  },
  {
    name: "Feira Cultural",
    description: "Feira com artesanato local, comidas típicas e apresentações culturais.",
    category: "EVENTOS" as const,
    latitude: -5.0895,
    longitude: -42.8015,
    address: "Centro, Teresina - PI",
    imageUrl: null,
    rating: null,
    isFree: true,
    eventDate: today17h,
  },
];

async function main() {
  for (const place of places) {
    await prisma.place.upsert({
      where: { name: place.name },
      update: place,
      create: place,
    });
  }
  console.log(`Seed concluído: ${places.length} locais.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
