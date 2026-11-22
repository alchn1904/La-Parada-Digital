// Endpoint de salud: lo usan el despliegue y el escaneo DAST para comprobar que la app responde.
export function GET() {
  return Response.json({ estado: "ok", servicio: "la-parada-digital" });
}
