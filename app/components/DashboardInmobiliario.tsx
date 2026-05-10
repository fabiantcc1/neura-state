"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import { InvestmentCard } from "./InvestmentCard";
import type { Project } from "@/app/lib/types";

const azuriaMock: Project = {
  proyecto: "Azuria",
  lat: 25.658477,
  lng: -100.455909,
  municipio: "Santa Catarina",
  zona: "Valle Poniente",
  zona_ciudad: "Poniente",
  tipo_de_proyecto: "Residencial",
  fecha_de_entrega: "2026",
  acepta_airbnb: false,
  precio_desde: 4.2,
  precio_hasta: 8.5,
  recamaras: [2, 3],
  amenidades: ["am_alberca", "am_gym", "am_cowork", "am_salon_de_usos_multiples", "am_asadores"],
  units: [
    { m2: 85, precio_total: 4500000, precio_m2: 52941, recamaras: 2, forma_de_entrega: "Obra Blanca" },
    { m2: 110, precio_total: 5800000, precio_m2: 52727, recamaras: 3, forma_de_entrega: "Obra Blanca" },
  ],
  investment_score: 88,
};

export default function DashboardInmobiliario() {
  useCopilotAction({
    name: "mostrarAnalisisInversion",
    description: "Muestra la tarjeta visual de inversión de un proyecto inmobiliario.",
    parameters: [
      { name: "proyecto", type: "string" },
      { name: "zona", type: "string" },
      { name: "investment_score", type: "number" },
    ],
    render: () => <InvestmentCard project={azuriaMock} status="complete" />,
    handler: async (args) => `Analizando proyecto: ${args.proyecto}`,
  });

  return (
    <div className="min-h-screen bg-slate-950 p-10 flex flex-col items-center gap-10">
      <div className="w-full max-w-2xl flex flex-col items-center">
        <div className="mb-8 text-center">
          <h2 className="text-indigo-400 font-black text-xs uppercase tracking-[0.3em] mb-2">
            Preview Mode
          </h2>
          <h1 className="text-white text-3xl font-bold">Investment Analysis Card</h1>
          <p className="text-slate-500 text-sm mt-2">
            Validando visualización de datos: {azuriaMock.proyecto} en {azuriaMock.zona}
          </p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          <InvestmentCard project={azuriaMock} status="complete" />
        </div>
      </div>

      <div className="w-full max-w-4xl h-[250px] bg-slate-900 rounded-[2rem] border border-slate-800 flex items-center justify-center relative overflow-hidden">
        <p className="text-slate-600 font-bold uppercase tracking-widest text-xs z-10">
          Mapbox Engine Placeholder
        </p>
      </div>
    </div>
  );
}
