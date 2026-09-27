-- Substitui a taxonomia de categorias do Place (Eventos/Gastronomia/Lazer/Turismo)
-- pela nova (Ar Livre/Vida Noturna/Cultura/Compras/Trilhas/Museus), remapeando
-- os dados existentes em vez de descartá-los.

CREATE TYPE "PlaceCategory_new" AS ENUM ('AR_LIVRE', 'VIDA_NOTURNA', 'CULTURA', 'COMPRAS', 'TRILHAS', 'MUSEUS');

ALTER TABLE "places" ADD COLUMN "category_new" "PlaceCategory_new";

UPDATE "places" SET "category_new" = CASE category::text
    WHEN 'TURISMO' THEN 'MUSEUS'
    WHEN 'LAZER' THEN 'AR_LIVRE'
    WHEN 'GASTRONOMIA' THEN 'VIDA_NOTURNA'
    WHEN 'EVENTOS' THEN 'CULTURA'
END::"PlaceCategory_new";

ALTER TABLE "places" ALTER COLUMN "category_new" SET NOT NULL;
ALTER TABLE "places" DROP COLUMN "category";
ALTER TABLE "places" RENAME COLUMN "category_new" TO "category";

DROP TYPE "PlaceCategory";
ALTER TYPE "PlaceCategory_new" RENAME TO "PlaceCategory";
