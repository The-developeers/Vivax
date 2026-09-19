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
    address: "Rua Álvaro Mendes, 2000 - Centro, Teresina - PI, 64000-060",
    imageUrl:
      "https://slayezxjtclzldutarwr.supabase.co/storage/v1/object/public/image/local_museu_piaui.jpg",
    rating: 4.3,
    isFree: true,
    eventDate: null,
    openingHours: "08:00h — 17:00h",
  },
  {
    name: "Parque Cidadania",
    description:
      "O ambiente perfeito para curtir momentos de lazer com a família e os amigos. Aproveite as quadras, as atrações culturais e os espaços abertos para uma caminhada relaxante ao ar livre.",
    category: "LAZER" as const,
    latitude: -5.102,
    longitude: -42.785,
    address: "Av. Frei Serafim, 110 - Cabral, Teresina - PI, 64000-590",
    imageUrl:
      "https://slayezxjtclzldutarwr.supabase.co/storage/v1/object/public/image/local_parque_da_cidadania.jpg",
    rating: 4.8,
    isFree: true,
    eventDate: null,
    openingHours: "05:00h — 23:00h",
  },
  {
    name: "Bar do Rufino",
    description: "Bar tradicional com música ao vivo e petiscos regionais.",
    category: "GASTRONOMIA" as const,
    latitude: -5.098,
    longitude: -42.81,
    address: "Rua Coelho de Resende, 450 - Centro, Teresina - PI, 64000-140",
    imageUrl:
      "https://slayezxjtclzldutarwr.supabase.co/storage/v1/object/public/image/local_bar_do_rufino.webp",
    rating: 4.5,
    isFree: false,
    eventDate: null,
    openingHours: "18:00h — 00:00h",
  },
  {
    name: "Kartódromo - Rio Poty",
    description: "Pista de kart às margens do Rio Poty, aberta para corridas recreativas.",
    category: "LAZER" as const,
    latitude: -5.065,
    longitude: -42.775,
    address: "Av. Marechal Castelo Branco, s/n - Poti Velho, Teresina - PI",
    imageUrl:
      "https://slayezxjtclzldutarwr.supabase.co/storage/v1/object/public/image/local_kart_rio_poty.jpg",
    rating: 5.0,
    isFree: false,
    eventDate: null,
    openingHours: "14:00h — 22:00h",
  },
  {
    name: "Feira Cultural",
    description: "Feira com artesanato local, comidas típicas e apresentações culturais.",
    category: "EVENTOS" as const,
    latitude: -5.0895,
    longitude: -42.8015,
    address: "Praça Marechal Deodoro - Centro, Teresina - PI",
    imageUrl: null,
    rating: null,
    isFree: true,
    eventDate: today17h,
    openingHours: null,
  },
];

const activities = [
  {
    placeName: "Parque Cidadania",
    title: "Ginástica",
    schedule: "Seg e Ter • de 17h até 18h",
    imageUrl: null,
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

  for (const activity of activities) {
    const place = await prisma.place.findUnique({ where: { name: activity.placeName } });
    if (!place) continue;

    const existing = await prisma.placeActivity.findFirst({
      where: { placeId: place.id, title: activity.title },
    });

    if (existing) {
      await prisma.placeActivity.update({
        where: { id: existing.id },
        data: { schedule: activity.schedule, imageUrl: activity.imageUrl },
      });
    } else {
      await prisma.placeActivity.create({
        data: {
          title: activity.title,
          schedule: activity.schedule,
          imageUrl: activity.imageUrl,
          placeId: place.id,
        },
      });
    }
  }

  console.log(`Seed concluído: ${places.length} locais, ${activities.length} atividades.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
