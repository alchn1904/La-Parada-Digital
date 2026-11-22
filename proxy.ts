import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refresca la sesión de Supabase en cada petición y manda al login a quien no la tenga
// cuando entra a una pantalla privada. El rol se vuelve a verificar en cada página y en la base de datos.
const PRIVADAS = ["/panel", "/puestos", "/citas", "/estibaje", "/acceso", "/inspeccion", "/admin"];

export async function proxy(request: NextRequest) {
  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(lista) {
        for (const { name, value } of lista) request.cookies.set(name, value);
        respuesta = NextResponse.next({ request });
        for (const { name, value, options } of lista) respuesta.cookies.set(name, value, options);
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ruta = request.nextUrl.pathname;
  const esPrivada = PRIVADAS.some((p) => ruta === p || ruta.startsWith(p + "/"));
  if (esPrivada && !user) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/login";
    destino.search = "";
    return NextResponse.redirect(destino);
  }
  return respuesta;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
