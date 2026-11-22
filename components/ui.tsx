import type { ReactNode } from "react";

export const campo = "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600";
export const boton = "rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50";
export const botonSecundario = "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-50";
export const tarjeta = "rounded-lg border border-slate-200 bg-white p-5 shadow-sm";

export function Mensaje({ error, ok }: { error?: string; ok?: string }) {
  if (!error && !ok) return null;
  return (
    <p
      role={error ? "alert" : "status"}
      className={"mb-4 rounded-md px-3 py-2 text-sm " + (error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800")}
    >
      {error ?? ok}
    </p>
  );
}

export function Etiqueta({ texto, children }: { texto: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {texto}
      <span className="mt-1 block font-normal">{children}</span>
    </label>
  );
}

export function Pagina({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">{titulo}</h1>
      {children}
    </main>
  );
}

export function formatoFechaHora(fecha: string, hora: string): string {
  const d = new Date(fecha + "T" + hora);
  return d.toLocaleDateString("es-PE", { weekday: "short", day: "2-digit", month: "short" }) + " " + hora.slice(0, 5);
}
