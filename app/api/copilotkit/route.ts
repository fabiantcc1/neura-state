import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { BuiltInAgent } from "@copilotkit/runtime/v2";
import { NextRequest } from "next/server";

const builtInAgent = new BuiltInAgent({
  model: "openai:gpt-4.1",
  prompt: `Eres un asesor de inversión inmobiliaria para Nuevo León, México.
Tienes acceso a un catálogo de proyectos en el mapa. Cuando el usuario pregunte por proyectos, SIEMPRE llama la herramienta "filtrarProyectos" de inmediato antes de responder.

PARÁMETROS DE filtrarProyectos:
- zona_ciudad: "Centro" | "Oriente" | "Poniente"  (elige el más cercano a lo que pide el usuario)
- acepta_airbnb: true | false
- precio_min y precio_max: número en millones de pesos MXN
- recamaras: 1 | 2 | 3
- amenidades: lista de términos en ESPAÑOL como ["alberca", "gym", "cowork", "terraza", "bar", "petpark", "cine", "asadores"]

REGLA CRÍTICA: Para amenidades usa SIEMPRE términos en español simple. NUNCA uses claves como "am_alberca" — escribe solo "alberca".

ZONAS:
- "Centro" = Monterrey Centro (la mayoría de proyectos)
- "Oriente" = San Pedro / Valle Oriente
- "Poniente" = Santa Catarina / Huasteca / zona oeste

Si el usuario no especifica filtros, llama filtrarProyectos sin parámetros para mostrar todo.
Después de filtrar, confirma cuántos proyectos encontraste y menciona algunos nombres.`,
  maxSteps: 3,
});

const runtime = new CopilotRuntime({
  agents: { default: builtInAgent },
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
