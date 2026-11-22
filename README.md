# La Parada Digital

Plataforma web para ordenar el ingreso de vehículos, transparentar el cobro de estibaje y dar seguimiento a la salubridad en el mercado de La Parada (Proyecto Final de Carrera III, USIL).

**Stack:** Next.js 16 (React + TypeScript + Tailwind) · Supabase (Auth, PostgreSQL con Row Level Security, Storage) · Vercel · GitHub Actions.

## Qué hace
| Épica | Pantallas |
|---|---|
| Registro y formalización | `/registro`, `/login`, `/puestos`, `/admin/padron` |
| Citas de vehículos | `/citas`, `/acceso` |
| Estibaje transparente | `/estibaje` (tarifario oficial, el monto lo calcula la base de datos) |
| Inspección sanitaria | `/inspeccion` (semáforo verde, ámbar o rojo) y semáforo en `/puestos` |
| Seguridad y auditoría | `/admin/bitacora`, `/denuncia` (anónima) y `/admin/denuncias` |

Roles: comerciante, estibador, transportista, inspector, personal de acceso y administrador. Al registrarse solo se puede elegir comerciante, estibador o transportista, y toda cuenta queda pendiente hasta que un administrador la aprueba.

## Cómo correrlo
```bash
npm install
cp .env.example .env.local   # completa la URL y la llave anon de tu proyecto de Supabase
npm run dev
```

### Base de datos
1. Crea un proyecto en Supabase.
2. Ejecuta `supabase/migrations/0001_init.sql` y luego `supabase/seed.sql` (SQL Editor o `supabase db push`).
3. Regístrate en la app y vuelve a SQL para convertirte en el primer administrador:
   ```sql
   update public.perfiles set rol = 'administrador', estado = 'aprobado' where id = '<uuid del usuario>';
   ```

## Calidad y seguridad
| Control | Herramienta | Dónde corre |
|---|---|---|
| Lint y tipos | ESLint, TypeScript | CI |
| Pruebas unitarias y de autorización | Vitest (`npm test`) | CI |
| SAST | CodeQL | `.github/workflows/codeql.yml` |
| Dependencias (SCA) | Dependabot y `npm audit` | `dependabot.yml` y CI |
| Secretos | gitleaks y secret scanning de GitHub | CI |
| DAST | OWASP ZAP (baseline) | CI |
| Autorización en datos | Row Level Security | `supabase/migrations/0001_init.sql` |

## Ramas y despliegue
- `main`: producción. Solo recibe Pull Requests con el CI en verde.
- `test`: rama de pruebas; cada cambio pasa primero por aquí.
- Al terminar el CI en `main`, `deploy.yml` publica en Vercel y aplica las migraciones de Supabase (si están los secretos del repositorio: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`).
