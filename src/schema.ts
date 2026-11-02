// Resultado del análisis de un email y validaciones.

export const CATEGORIAS = ["consulta_venta", "pedido_estado", "soporte", "reclamo", "mayorista", "spam", "otro"] as const;
export const URGENCIAS = ["alta", "media", "baja"] as const;
export const SENTIMIENTOS = ["positivo", "neutral", "negativo"] as const;

export type Categoria = (typeof CATEGORIAS)[number];
export type Urgencia = (typeof URGENCIAS)[number];
export type Sentimiento = (typeof SENTIMIENTOS)[number];

export type Email = { de: string; asunto: string; cuerpo: string };

export type Analisis = {
  categoria: Categoria;
  urgencia: Urgencia;
  sentimiento: Sentimiento;
  resumen: string;
  nombre_cliente: string;
  numero_pedido: string;
  requiere_humano: boolean;
  motivo_humano: string;
  borrador_asunto: string;
  borrador_respuesta: string;
  confianza: number;
};

export const ANALISIS_SCHEMA = {
  type: "object",
  properties: {
    categoria: { type: "string", enum: CATEGORIAS },
    urgencia: { type: "string", enum: URGENCIAS },
    sentimiento: { type: "string", enum: SENTIMIENTOS },
    resumen: { type: "string", description: "Una oración con lo que pide el cliente." },
    nombre_cliente: { type: "string", description: "Nombre del cliente si lo menciona. Vacío si no." },
    numero_pedido: { type: "string", description: "Número de pedido si lo menciona. Vacío si no." },
    requiere_humano: { type: "boolean", description: "true si una persona del equipo debe intervenir antes de responder." },
    motivo_humano: { type: "string", description: "Por qué requiere a una persona. Vacío si no." },
    borrador_asunto: { type: "string", description: "Asunto de la respuesta. Vacío si es spam." },
    borrador_respuesta: { type: "string", description: "Borrador de respuesta listo para revisar. Vacío si es spam." },
    confianza: { type: "number", description: "De 0 a 1." },
  },
  required: [
    "categoria", "urgencia", "sentimiento", "resumen", "nombre_cliente", "numero_pedido",
    "requiere_humano", "motivo_humano", "borrador_asunto", "borrador_respuesta", "confianza",
  ],
  additionalProperties: false,
} as const;

export class AnalisisInvalidoError extends Error {}

const enLista = <T extends string>(lista: readonly T[], v: unknown): v is T =>
  typeof v === "string" && (lista as readonly string[]).includes(v);

export function parseAnalisis(data: unknown): Analisis {
  if (typeof data !== "object" || data === null) throw new AnalisisInvalidoError("La respuesta no es un objeto");
  const d = data as Record<string, unknown>;
  if (!enLista(CATEGORIAS, d.categoria)) throw new AnalisisInvalidoError(`Categoría desconocida: ${String(d.categoria)}`);
  if (!enLista(URGENCIAS, d.urgencia)) throw new AnalisisInvalidoError(`Urgencia desconocida: ${String(d.urgencia)}`);
  if (!enLista(SENTIMIENTOS, d.sentimiento)) throw new AnalisisInvalidoError(`Sentimiento desconocido: ${String(d.sentimiento)}`);
  for (const k of ["resumen", "nombre_cliente", "numero_pedido", "motivo_humano", "borrador_asunto", "borrador_respuesta"]) {
    if (typeof d[k] !== "string") throw new AnalisisInvalidoError(`Falta el campo "${k}"`);
  }
  if (typeof d.requiere_humano !== "boolean") throw new AnalisisInvalidoError('Falta el campo "requiere_humano"');
  if (typeof d.confianza !== "number" || !Number.isFinite(d.confianza)) throw new AnalisisInvalidoError('Falta el campo "confianza"');

  const s = (k: string) => (d[k] as string).trim();
  return aplicarReglas({
    categoria: d.categoria,
    urgencia: d.urgencia,
    sentimiento: d.sentimiento,
    resumen: s("resumen"),
    nombre_cliente: s("nombre_cliente"),
    numero_pedido: s("numero_pedido"),
    requiere_humano: d.requiere_humano,
    motivo_humano: s("motivo_humano"),
    borrador_asunto: s("borrador_asunto"),
    borrador_respuesta: s("borrador_respuesta"),
    confianza: Math.min(1, Math.max(0, d.confianza)),
  });
}

// Reglas de negocio que no dependen de la IA: se aplican siempre, aunque el modelo no las marque.
export function aplicarReglas(a: Analisis): Analisis {
  const extra: string[] = [];
  if (a.categoria === "reclamo" && a.sentimiento === "negativo" && a.urgencia === "alta") {
    extra.push("Reclamo urgente con cliente molesto.");
  }
  if (a.confianza < 0.6 && a.categoria !== "spam") extra.push("La IA tiene baja confianza en el análisis.");
  if (/reembolso|devoluci[oó]n del? dinero|abogad|defensa del consumidor/i.test(a.resumen + " " + a.borrador_respuesta)) {
    extra.push("Menciona reembolsos o reclamos legales.");
  }
  const motivos = [...new Set([a.motivo_humano, ...extra].filter(Boolean))];
  return {
    ...a,
    requiere_humano: a.requiere_humano || extra.length > 0,
    motivo_humano: motivos.join(" "),
    borrador_asunto: a.categoria === "spam" ? "" : a.borrador_asunto,
    borrador_respuesta: a.categoria === "spam" ? "" : a.borrador_respuesta,
  };
}
