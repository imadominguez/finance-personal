-- Apariencia elegida por cada persona: modo, acento y radio.
-- Aditiva y anulable: las cuentas que ya existen quedan en NULL, que significa
-- "el tema original de la app".
-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "theme" JSONB;
