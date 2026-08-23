import { redirect } from "next/navigation";

/**
 * Ya no hay alta separada: al entrar con Google, si la cuenta no existe se crea.
 * La ruta se mantiene para que los enlaces viejos no queden rotos.
 */
export default function CrearCuentaPage() {
  redirect("/ingresar");
}
