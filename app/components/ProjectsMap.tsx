"use client";

import { useRef, useState } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Project } from "@/app/lib/types";
import allProjects from "@/app/lib/data/projects.json";
import { InvestmentCard } from "./InvestmentCard";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
const MONTERREY_CENTER = { longitude: -100.3161, latitude: 25.6866, zoom: 13 };

// Mapping: every term the AI might say → the exact key in the JSON
const AMENIDAD_MAP: Record<string, string> = {
  alberca: "am_alberca", piscina: "am_alberca", pool: "am_alberca",
  gym: "am_gym", gimnasio: "am_gym",
  cowork: "am_cowork", "co-work": "am_cowork", coworking: "am_cowork", oficina: "am_cowork",
  asadores: "am_asadores", asador: "am_asadores", parrilla: "am_asadores",
  bar: "am_bar",
  lobby: "am_lobby",
  petpark: "am_petpark", mascotas: "am_petpark", perros: "am_petpark",
  petfriendly: "am_petfriendly", "pet-friendly": "am_petfriendly",
  salon: "am_salon_de_usos_multiples", "salon de eventos": "am_salon_de_eventos",
  "salon de usos multiples": "am_salon_de_usos_multiples",
  terraza: "am_terraza",
  cine: "am_cine",
  arcade: "am_arcade",
  kids: "am_kids_park", "kids park": "am_kids_park", infantil: "am_kids_park",
  ludoteca: "am_ludoteca",
  areas_verdes: "am_areas_verdes", "areas verdes": "am_areas_verdes", jardin: "am_areas_verdes",
  fogatero: "am_fogatero", fogata: "am_fogatero",
  yoga: "am_area_de_yoga",
  huerto: "am_huerto",
  cancha: "am_cancha",
  ciclopista: "am_ciclopista", bicicletas: "am_rack_de_bicicletas",
  seguridad: "am_seguridad", vigilancia: "am_seguridad",
  biblioteca: "am_biblioteca",
  terraza_sky: "am_sky_view", "sky view": "am_sky_view",
  sala_lounge: "am_sala_lounge", lounge: "am_sala_lounge",
};

function resolveAmenidad(input: string): string {
  const lower = input.toLowerCase().trim();
  // Exact key match (AI passed am_alberca correctly)
  if (lower.startsWith("am_")) return lower;
  // Try the mapping
  if (AMENIDAD_MAP[lower]) return AMENIDAD_MAP[lower];
  // Partial match against the map keys
  const found = Object.keys(AMENIDAD_MAP).find((k) => lower.includes(k) || k.includes(lower));
  if (found) return AMENIDAD_MAP[found];
  // Return as-is (best effort)
  return input;
}

export default function ProjectsMap() {
  const mapRef = useRef(null);
  const [displayedProjects, setDisplayedProjects] = useState<Project[]>(
    allProjects as Project[],
  );
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useCopilotReadable({
    description: "Catálogo completo de proyectos inmobiliarios en Nuevo León disponibles en el mapa",
    value: {
      totalProyectos: allProjects.length,
      proyectosVisibles: displayedProjects.length,
      zonas: {
        Centro: "Monterrey Centro — 39 proyectos",
        Oriente: "San Pedro / Valle Oriente — 4 proyectos",
        Poniente: "Santa Catarina / Huasteca / García — proyectos occidentales",
      },
      amenidadesEnEspañol: {
        alberca: "Alberca o piscina",
        gym: "Gimnasio",
        cowork: "Espacio de coworking / oficina",
        asadores: "Área de asadores / parrilla",
        bar: "Bar",
        petpark: "Área para mascotas",
        terraza: "Terraza",
        cine: "Sala de cine",
        salon: "Salón de eventos o usos múltiples",
        kids_park: "Área infantil / kids park",
        areas_verdes: "Áreas verdes / jardín",
      },
      filtrosDisponibles: [
        "zona_ciudad (Centro | Oriente | Poniente)",
        "acepta_airbnb (true/false)",
        "precio_min y precio_max (millones de pesos MXN)",
        "recamaras (1, 2 o 3)",
        "amenidades (describe en español, ej: alberca, gym, cowork)",
      ],
    },
  });

  useCopilotAction({
    name: "limpiarFiltros",
    description: "Elimina todos los filtros activos y muestra los 59 proyectos en el mapa.",
    parameters: [],
    handler: async () => {
      setDisplayedProjects(allProjects as Project[]);
      setSelectedProject(null);
      return `Filtros eliminados. Mostrando los ${allProjects.length} proyectos disponibles.`;
    },
    render: ({ status }) => {
      if (status === "executing") return <div className="text-sm text-gray-400 italic">Limpiando filtros…</div>;
      return <div className="text-sm text-indigo-400">Mostrando todos los proyectos</div>;
    },
  });

  useCopilotAction({
    name: "filtrarProyectos",
    description:
      "Filtra proyectos inmobiliarios según criterios del usuario y actualiza los pines en el mapa.",
    parameters: [
      {
        name: "zona_ciudad",
        type: "string",
        description: "Zona de la ciudad: 'Centro', 'Oriente' o 'Poniente'",
        required: false,
      },
      {
        name: "acepta_airbnb",
        type: "boolean",
        description: "Si el proyecto permite renta en Airbnb",
        required: false,
      },
      {
        name: "precio_min",
        type: "number",
        description: "Precio mínimo en millones de pesos MXN (ej: 2.5)",
        required: false,
      },
      {
        name: "precio_max",
        type: "number",
        description: "Precio máximo en millones de pesos MXN (ej: 5.0)",
        required: false,
      },
      {
        name: "recamaras",
        type: "number",
        description: "Número de recámaras requeridas: 1, 2 o 3",
        required: false,
      },
      {
        name: "amenidades",
        type: "string[]",
        description:
          "Amenidades requeridas en español (ej: 'alberca', 'gym', 'cowork', 'terraza'). NO uses claves am_*.",
        required: false,
      },
    ],
    handler: async ({
      zona_ciudad,
      acepta_airbnb,
      precio_min,
      precio_max,
      recamaras,
      amenidades,
    }) => {
      const result = (allProjects as Project[]).filter((p) => {
        if (zona_ciudad && p.zona_ciudad?.toLowerCase() !== zona_ciudad.toLowerCase())
          return false;

        if (acepta_airbnb !== undefined && p.acepta_airbnb !== acepta_airbnb)
          return false;

        if (precio_min !== undefined && (p.precio_hasta === null || p.precio_hasta < precio_min))
          return false;

        if (precio_max !== undefined && (p.precio_desde === null || p.precio_desde > precio_max))
          return false;

        if (recamaras !== undefined && !p.recamaras.includes(recamaras))
          return false;

        if (amenidades?.length) {
          const resolvedKeys = amenidades.map(resolveAmenidad);
          const hasAll = resolvedKeys.every((key) => p.amenidades.includes(key));
          if (!hasAll) return false;
        }

        return true;
      });

      setDisplayedProjects(result);
      return `${result.length} proyectos encontrados: ${result.map((p) => p.proyecto).join(", ")}`;
    },
    render: ({ status }) => {
      if (status === "executing") {
        return <div className="text-sm text-gray-400 italic">Buscando proyectos…</div>;
      }
      return (
        <div className="text-sm text-indigo-400">
          {displayedProjects.length} proyecto{displayedProjects.length !== 1 ? "s" : ""} en el mapa
        </div>
      );
    },
  });

  const isFiltered = displayedProjects.length < allProjects.length;

  function clearFilters() {
    setDisplayedProjects(allProjects as Project[]);
    setSelectedProject(null);
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {isFiltered && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-xl px-3 py-2 shadow-lg">
          <span className="text-xs text-indigo-300 font-medium">
            {displayedProjects.length} de {allProjects.length} proyectos
          </span>
          <button
            onClick={clearFilters}
            className="text-xs text-slate-400 hover:text-white border border-slate-600 hover:border-slate-400 rounded-lg px-2 py-1 transition-colors"
          >
            Limpiar filtros ×
          </button>
        </div>
      )}
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={MONTERREY_CENTER}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        onClick={() => setSelectedProject(null)}
      >
        <NavigationControl position="top-right" />

        {displayedProjects.map((project) => (
          <Marker
            key={project.proyecto}
            longitude={project.lng}
            latitude={project.lat}
            anchor="bottom"
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProject(project);
              }}
              className="group relative cursor-pointer"
            >
              <div className="absolute -inset-2 bg-indigo-500 rounded-full opacity-20 group-hover:opacity-40 animate-pulse" />
              <div className="relative w-4 h-4 bg-indigo-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(99,102,241,0.6)] group-hover:scale-125 transition-transform" />
            </div>
          </Marker>
        ))}
      </Map>

      {selectedProject && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-4">
          <InvestmentCard project={selectedProject} status="complete" />
        </div>
      )}
    </div>
  );
}
