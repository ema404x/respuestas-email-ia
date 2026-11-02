# Asistente de emails con IA

> **Proyecto demo.** El negocio (*Mates del Sur*) y los emails de ejemplo son ficticios.

Cada email que llega se **clasifica** (venta, estado de pedido, soporte, reclamo, mayorista o spam), se le asigna
**urgencia y tono**, se extraen el nombre y el número de pedido, y la IA prepara un **borrador de respuesta**
con la información real del negocio.

**Las respuestas nunca se envían solas:** una persona las revisa, las edita si hace falta y las copia.
Los casos delicados quedan marcados como **"Revisar"**, con el motivo.

Pensado para comercios y servicios que reciben muchas consultas repetidas por email.

```
Email entrante
      │
      ▼
Servidor Node.js ── valida el contenido
      │
      ├─ API de Claude ─→ categoría, urgencia, tono, datos y borrador (JSON Schema)
      ├─ Reglas de negocio ─→ marca reclamos urgentes, reembolsos y baja confianza
      └─ Bandeja web ─→ revisar, editar y copiar la respuesta
```

## Qué lo hace confiable

- **Responde solo con la información del negocio** ([`src/negocio.ts`](src/negocio.ts)). Si le preguntan algo que no sabe, no inventa: lo deriva a una persona.
- **No promete reembolsos ni descuentos:** esas decisiones siempre quedan en manos del equipo.
- **Reglas fijas además de la IA:** los reclamos urgentes, las menciones de reembolsos o reclamos legales y las lecturas con baja confianza se marcan para revisión aunque el modelo no lo haga.
- **Protegido contra instrucciones ocultas:** el texto del email se trata como datos. La bandeja incluye un ejemplo que intenta pedir un "descuento del 100%".
- **Salida estructurada** validada en el servidor y **tests automatizados**.

## Cómo probarlo

Requisitos: Node 20 o superior y una API key de Claude.

```bash
npm install
cp .env.example .env      # completá ANTHROPIC_API_KEY
npm start                 # abre http://localhost:3000
```

Tocá **"Analizar toda la bandeja"** para procesar los 7 emails de ejemplo, o **"Pegar un email"** para probar uno propio.

## Adaptarlo a otro negocio

Solo hay que cambiar [`src/negocio.ts`](src/negocio.ts): nombre, rubro, tono, firma e información (envíos, políticas, precios, horarios).
Después se puede conectar a Gmail u Outlook para leer los emails automáticamente.

## Tecnologías

TypeScript · Node.js · Express · API de Claude (salida estructurada) · Vitest

## Desarrollo

```bash
npm run typecheck
npm test
```
