# La Parada Digital: reglas del proyecto

Plataforma web (Next.js + Supabase + Vercel) para ordenar el ingreso, el estibaje y la inspección sanitaria del mercado de La Parada.

## Comandos
- `npm run dev`: servidor local.
- `npm test`: pruebas (Vitest). `npm run test:coverage`: con cobertura.
- `npm run lint` y `npm run typecheck`: calidad y tipos.
- `npm run build`: compilación de producción.

## Reglas que no se rompen
1. **Sin secretos en el código.** Solo `.env.local` (ignorado por git). La llave `service_role` de Supabase nunca se usa en el repositorio.
2. **La seguridad vive en la base de datos.** Toda tabla nueva lleva Row Level Security y sus políticas en una migración de `supabase/migrations/`.
3. **Las reglas de negocio van en `lib/domain/`** como funciones puras con pruebas en `tests/`. Si cambias una regla, cambia su prueba.
4. **Todo dato de un formulario pasa por un esquema Zod** de `lib/domain/validators.ts` antes de llegar a Supabase.
5. **El monto de estibaje nunca viene del cliente:** lo calcula la base de datos con el tarifario oficial.
6. **Antes de hacer commit** deben pasar `npm run lint`, `npm run typecheck` y `npm test`.
7. Commits descriptivos que citan la historia de Jira (por ejemplo `HU-08: reservar cita de descarga`).
8. Ramas: `main` (producción) y `test` (pruebas). Los cambios llegan a `main` por Pull Request.
9. Next.js 16: el archivo de sesión se llama `proxy.ts` (antes `middleware.ts`). Consulta `node_modules/next/dist/docs/` ante dudas.
