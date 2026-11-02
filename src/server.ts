import Anthropic from "@anthropic-ai/sdk";
import express, { type Express } from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AnalisisError, analizarEmail } from "./analizar";
import { NEGOCIO } from "./negocio";
import type { Analisis, Email } from "./schema";

export const MAX_CUERPO = 20_000;

export type Deps = { analizar: (email: Email) => Promise<Analisis> };

const here = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.join(here, "..");

export function leerBandeja(): Email[] {
  return JSON.parse(fs.readFileSync(path.join(raiz, "samples", "bandeja.json"), "utf8")) as Email[];
}

export function validarEmail(body: unknown): Email | string {
  const b = (body ?? {}) as Record<string, unknown>;
  const de = typeof b.de === "string" ? b.de.trim() : "";
  const asunto = typeof b.asunto === "string" ? b.asunto.trim() : "";
  const cuerpo = typeof b.cuerpo === "string" ? b.cuerpo.trim() : "";
  if (!cuerpo) return "El email no tiene texto.";
  if (cuerpo.length > MAX_CUERPO) return "El email es demasiado largo (máximo 20.000 caracteres).";
  return { de: de || "(sin remitente)", asunto: asunto || "(sin asunto)", cuerpo };
}

export function createApp(deps: Deps): Express {
  const app = express();
  app.use(express.json({ limit: "100kb" }));
  app.use(express.static(path.join(raiz, "public")));

  app.get("/api/negocio", (_req, res) => res.json({ nombre: NEGOCIO.nombre, rubro: NEGOCIO.rubro }));
  app.get("/api/bandeja", (_req, res) => res.json(leerBandeja()));

  app.post("/api/analizar", async (req, res) => {
    const email = validarEmail(req.body);
    if (typeof email === "string") return res.status(400).json({ error: email });
    try {
      res.json({ analisis: await deps.analizar(email) });
    } catch (err) {
      if (err instanceof AnalisisError) return res.status(422).json({ error: err.message });
      console.error("Error al analizar el email:", err instanceof Error ? err.message : err);
      res.status(502).json({ error: "No se pudo analizar el email. Probá de nuevo en unos segundos." });
    }
  });

  return app;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Falta ANTHROPIC_API_KEY. Copiá .env.example a .env y completala.");
    process.exit(1);
  }
  const client = new Anthropic();
  const app = createApp({ analizar: (email) => analizarEmail(client, email) });
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => console.log(`Asistente de emails en http://localhost:${port}`));
}
