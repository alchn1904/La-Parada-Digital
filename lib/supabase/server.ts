import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente de Supabase para componentes de servidor y acciones. Usa la sesión del usuario (cookie),
// así Row Level Security decide qué filas puede ver. Nunca se usa la llave service_role aquí.
export async function crearClienteServidor() {
  const almacen = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return almacen.getAll();
      },
      setAll(lista) {
        try {
          for (const { name, value, options } of lista) almacen.set(name, value, options);
        } catch {
          // Se llamó desde un componente de servidor: el proxy ya refresca la sesión.
        }
      },
    },
  });
}
