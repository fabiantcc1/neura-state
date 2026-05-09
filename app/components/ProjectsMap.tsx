"use client";

import { useRef, useState } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import { useCopilotAction } from "@copilotkit/react-core";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Project } from "@/app/lib/types";
import allProjects from "@/app/lib/data/projects.json";
import ProjectCard from "@/app/components/ProjectCard";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

const MONTERREY_CENTER = { longitude: -100.3161, latitude: 25.6866, zoom: 13 };

export default function ProjectsMap() {
  const mapRef = useRef(null);
  const [displayedProjects, setDisplayedProjects] = useState<Project[]>(
    allProjects as Project[],
  );
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // ── Tool: filter projects ──────────────────────────────────────────────────
  useCopilotAction({
    name: "filtrarProyectos",
    description:
      "Filtra proyectos inmobiliarios según criterios del usuario y actualiza los pines en el mapa. Úsala cuando el usuario pida proyectos, departamentos o propiedades con cualquier criterio.",
    parameters: [
      {
        name: "municipio",
        type: "string",
        description: "Municipio del proyecto, ej: 'Monterrey'",
        required: false,
      },
      {
        name: "zona_ciudad",
        type: "string",
        description: "Zona de la ciudad, ej: 'Centro'",
        required: false,
      },
      {
        name: "tipo_de_proyecto",
        type: "string",
        description: "Tipo de proyecto: 'Usos Mixtos', 'Departamentos', etc.",
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
        description: "Precio mínimo en millones de pesos (ej: 2.5)",
        required: false,
      },
      {
        name: "precio_max",
        type: "number",
        description: "Precio máximo en millones de pesos (ej: 5.0)",
        required: false,
      },
      {
        name: "recamaras",
        type: "number",
        description: "Número de recámaras requeridas (1, 2 o 3)",
        required: false,
      },
      {
        name: "amenidades",
        type: "string[]",
        description:
          "Lista de amenidades requeridas, ej: ['am_alberca', 'am_gym']",
        required: false,
      },
    ],
    handler: async ({
      municipio,
      zona_ciudad,
      tipo_de_proyecto,
      acepta_airbnb,
      precio_min,
      precio_max,
      recamaras,
      amenidades,
    }) => {
      const result = (allProjects as Project[]).filter((p) => {
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
          const hasAll = (amenidades as string[]).every((a) =>
            p.amenidades.includes(a),
          );
          if (!hasAll) return false;
        }
        return true;
      });

      setDisplayedProjects(result);
      setSelectedProject(null);
      return `${result.length} proyectos encontrados: ${result.map((p) => p.proyecto).join(", ")}`;
    },
    render: ({ status }) => {
      if (status === "executing") {
        return (
          <div className="text-sm text-zinc-400 italic">
            Buscando proyectos…
          </div>
        );
      }
      return (
        <div className="text-sm text-indigo-400">
          {displayedProjects.length} proyecto
          {displayedProjects.length !== 1 ? "s" : ""} en el mapa
        </div>
      );
    },
  });

  // ── Tool: show project details ─────────────────────────────────────────────
  useCopilotAction({
    name: "mostrarDetallesProyecto",
    description:
      "Muestra la ficha detallada de un proyecto específico. Úsala cuando el usuario pregunte por detalles, precio, amenidades o información de un proyecto en particular.",
    parameters: [
      {
        name: "nombre_proyecto",
        type: "string",
        description: "Nombre exacto del proyecto a mostrar",
        required: true,
      },
    ],
    handler: async ({ nombre_proyecto }) => {
      const match = (allProjects as Project[]).find(
        (p) =>
          p.proyecto.toLowerCase().includes(nombre_proyecto.toLowerCase()) ||
          nombre_proyecto.toLowerCase().includes(p.proyecto.toLowerCase()),
      );

      if (!match) return `Proyecto "${nombre_proyecto}" no encontrado.`;

      setSelectedProject(match);
      return `Mostrando detalles de ${match.proyecto}.`;
    },
    render: ({ status, args }) => {
      if (status === "executing") {
        return (
          <div className="text-sm text-zinc-400 italic">
            Cargando detalles…
          </div>
        );
      }

      const match = selectedProject ??
        (allProjects as Project[]).find((p) =>
          p.proyecto
            .toLowerCase()
            .includes((args.nombre_proyecto ?? "").toLowerCase()),
        );

      if (!match) {
        return (
          <div className="text-sm text-rose-400">
            Proyecto no encontrado.
          </div>
        );
      }

      return (
        <ProjectCard project={match} onClose={() => setSelectedProject(null)} />
      );
    },
  });

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={MONTERREY_CENTER}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
      >
        <NavigationControl position="top-right" />

        {displayedProjects.map((project) => (
          <Marker
            key={project.proyecto}
            longitude={project.lng}
            latitude={project.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedProject(project);
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background:
                  selectedProject?.proyecto === project.proyecto
                    ? "#a5b4fc"
                    : "#6366f1",
                border: "2px solid #fff",
                cursor: "pointer",
                transform:
                  selectedProject?.proyecto === project.proyecto
                    ? "scale(1.6)"
                    : "scale(1)",
                transition: "transform 0.15s, background 0.15s",
              }}
              title={project.proyecto}
            />
          </Marker>
        ))}
      </Map>

      {/* Card overlay */}
      {selectedProject && (
        <div className="absolute bottom-6 left-6 z-10">
          <ProjectCard
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        </div>
      )}
    </div>
  );
}
