import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { BuiltInAgent, defineTool } from "@copilotkit/runtime/v2";
import { NextRequest } from "next/server";
import { z } from "zod";
import projects from "@/app/lib/data/projects.json";
import type { Project } from "@/app/lib/types";

const filtrarProyectosTool = defineTool({
  name: "filtrarProyectos",
  description:
    "Filtra proyectos inmobiliarios según criterios del usuario. Devuelve un arreglo JSON con los proyectos que cumplen los filtros. Usa esta herramienta cuando el usuario pregunte por proyectos, departamentos, precios, amenidades, recámaras o cualquier característica de los inmuebles.",
  parameters: z.object({
    municipio: z
      .string()
      .optional()
      .describe("Municipio del proyecto, ej: 'Monterrey'"),
    zona_ciudad: z
      .string()
      .optional()
      .describe("Zona de la ciudad, ej: 'Centro'"),
    tipo_de_proyecto: z
      .string()
      .optional()
      .describe("Tipo de proyecto: 'Usos Mixtos', 'Departamentos', etc."),
    acepta_airbnb: z
      .boolean()
      .optional()
      .describe("Si el proyecto permite renta en Airbnb"),
    precio_min: z
      .number()
      .optional()
      .describe("Precio mínimo en millones de pesos (ej: 2.5)"),
    precio_max: z
      .number()
      .optional()
      .describe("Precio máximo en millones de pesos (ej: 5.0)"),
    recamaras: z
      .number()
      .optional()
      .describe("Número de recámaras requeridas (1, 2 o 3)"),
    amenidades: z
      .array(z.string())
      .optional()
      .describe("Lista de amenidades requeridas, ej: ['am_alberca', 'am_gym']"),
  }),
  execute: async ({
    municipio,
    zona_ciudad,
    tipo_de_proyecto,
    acepta_airbnb,
    precio_min,
    precio_max,
    recamaras,
    amenidades,
  }) => {
    const result = (projects as Project[]).filter((p) => {
      if (municipio && p.municipio?.toLowerCase() !== municipio.toLowerCase())
        return false;

      if (
        zona_ciudad &&
        p.zona_ciudad?.toLowerCase() !== zona_ciudad.toLowerCase()
      )
        return false;

      if (
        tipo_de_proyecto &&
        p.tipo_de_proyecto?.toLowerCase() !== tipo_de_proyecto.toLowerCase()
      )
        return false;

      if (acepta_airbnb !== undefined && p.acepta_airbnb !== acepta_airbnb)
        return false;

      if (
        precio_min !== undefined &&
        (p.precio_hasta === null || p.precio_hasta < precio_min)
      )
        return false;

      if (
        precio_max !== undefined &&
        (p.precio_desde === null || p.precio_desde > precio_max)
      )
        return false;

      if (recamaras !== undefined && !p.recamaras.includes(recamaras))
        return false;

      if (amenidades?.length) {
        const hasAll = amenidades.every((a) => p.amenidades.includes(a));
        if (!hasAll) return false;
      }

      return true;
    });

    console.log("[filtrarProyectos] Projects found:", result);
    return result;
  },
});

const builtInAgent = new BuiltInAgent({
  model: "google:gemini-2.5-flash",
  tools: [filtrarProyectosTool],
  maxSteps: 5,
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
