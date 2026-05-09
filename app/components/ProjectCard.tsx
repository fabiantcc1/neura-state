"use client";

import type { Project } from "@/app/lib/types";

const AMENIDAD_LABEL: Record<string, string> = {
  am_alberca: "Alberca",
  am_cowork: "Cowork",
  am_gym: "Gimnasio",
  am_asadores: "Asadores",
  am_bar: "Bar",
  am_lobby: "Lobby",
  am_petpark: "Área mascotas",
  am_petfriendly: "Pet friendly",
  am_terraza: "Terraza",
  am_cine: "Cine",
  am_arcade: "Arcade",
  am_kids_park: "Área infantil",
  am_ludoteca: "Ludoteca",
  am_salon_de_eventos: "Salón eventos",
  am_salon_social: "Salón social",
  am_salon_culinario: "Salón culinario",
  am_salon_de_usos_multiples: "Salón usos múltiples",
  am_salon_de_entretenimiento: "Salón entretenimiento",
  am_areas_verdes: "Áreas verdes",
  am_fogatero: "Fogonero",
  am_rack_de_bicicletas: "Rack bicicletas",
  am_sala_lounge: "Sala lounge",
  am_cancha: "Cancha",
  am_paqueteria: "Paquetería",
  am_biblioteca: "Biblioteca",
  am_vitapista: "Vitapista",
  am_lavanderia: "Lavandería",
  am_cuarto_de_herramientas: "Herramientas",
  am_simulador_virtual: "Simulador virtual",
  am_seguridad: "Seguridad",
  am_ciclopista: "Ciclopista",
  am_sky_view: "Sky view",
  am_huerto: "Huerto",
  am_area_de_yoga: "Yoga",
  am_beer_garden: "Beer garden",
  am_cuartos_de_huespedes: "Cuartos huéspedes",
  am_suite_de_visitas: "Suite visitas",
};

interface Props {
  project: Project;
  onClose: () => void;
}

export default function ProjectCard({ project, onClose }: Props) {
  const formasDeEntrega = [
    ...new Set(project.units.map((u) => u.forma_de_entrega).filter(Boolean)),
  ];

  const recamaras =
    project.recamaras.length > 0
      ? project.recamaras.join(", ")
      : "No especificado";

  const precio =
    project.precio_desde !== null && project.precio_hasta !== null
      ? `$${project.precio_desde}M – $${project.precio_hasta}M MXN`
      : project.precio_desde !== null
        ? `Desde $${project.precio_desde}M MXN`
        : "Precio no disponible";

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 w-72 shadow-2xl text-white">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <h2 className="text-base font-semibold leading-tight">
          {project.proyecto}
        </h2>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white transition-colors shrink-0 mt-0.5"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3 text-sm">
        {/* Ubicación */}
        <Row
          label="Ubicación"
          value={[project.zona_ciudad, project.municipio]
            .filter(Boolean)
            .join(", ")}
        />

        {/* Tipo de entrega */}
        <Row
          label="Entrega"
          value={
            formasDeEntrega.length > 0
              ? formasDeEntrega.join(" / ")
              : "No especificado"
          }
        />

        {/* Airbnb */}
        <Row
          label="Airbnb"
          value={
            <span
              className={
                project.acepta_airbnb ? "text-emerald-400" : "text-rose-400"
              }
            >
              {project.acepta_airbnb ? "Permitido" : "No permitido"}
            </span>
          }
        />

        {/* Recámaras */}
        <Row label="Recámaras" value={recamaras} />

        {/* Valor de inversión */}
        <Row label="Inversión" value={precio} />

        {/* Amenidades */}
        {project.amenidades.length > 0 && (
          <div>
            <span className="text-zinc-400">Amenidades</span>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {project.amenidades.map((a) => (
                <span
                  key={a}
                  className="bg-zinc-800 border border-zinc-600 rounded-full px-2 py-0.5 text-xs text-zinc-300"
                >
                  {AMENIDAD_LABEL[a] ?? a}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-zinc-400 shrink-0">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
