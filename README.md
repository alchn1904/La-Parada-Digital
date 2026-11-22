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

## Manejo de secretos
- **En el repositorio no hay secretos** (lo verifica gitleaks en cada push). Solo existe `.env.example` con nombres de variables.
- **Vercel** guarda únicamente la URL y la llave pública `anon` de Supabase. Esa llave no da acceso por sí sola: cada consulta pasa por Row Level Security.
- **Supabase** es la fuente de verdad de los datos sensibles: Auth (sesiones y JWT), PostgreSQL con RLS y Supabase Vault para guardar claves de servicios externos cuando dejen de estar simulados.
- **GitHub Secrets** guarda los tokens del pipeline (por ejemplo, para aplicar migraciones). La llave `service_role` no se usa en la aplicación.

## Ramas y despliegue
- `main`: producción. Solo recibe Pull Requests con el CI en verde.
- `test`: rama de pruebas; cada cambio pasa primero por aquí.
- Vercel está conectado al repositorio: `main` se publica en producción y `test` genera una vista previa. Las migraciones de `supabase/migrations/` se aplican con Supabase CLI o desde el SQL Editor.
