-- Casa de cambio con la que se muestran los montos en dólares.
-- Aditiva y anulable: NULL significa "mostrar en la moneda de la cuenta", que
-- es como venían funcionando todas las cuentas hasta ahora. Los montos siguen
-- guardándose en pesos; esto solo cambia cómo se dibujan.
-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "usdCasa" TEXT;
