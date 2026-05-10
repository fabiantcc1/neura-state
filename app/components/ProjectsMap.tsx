"use client";

import { useRef, useState } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import { useCopilotAction } from "@copilotkit/react-core";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Project } from "@/app/lib/types";
import allProjects from "@/app/lib/data/projects.json";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

const MONTERREY_CENTER = { longitude: -100.3161, latitude: 25.6866, zoom: 13 };

export default function ProjectsMap() {
  const mapRef = useRef(null);
  const [displayedProjects, setDisplayedProjects] = useState<Project[]>(
    allProjects as Project[],
  );

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
      return `${result.length} proyectos encontrados: ${result.map((p) => p.proyecto).join(", ")}`;
    },
    render: ({ status }) => {
      if (status === "executing") {
        return (
          <div className="text-sm text-gray-400 italic">
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

  return (
    <div style={{ width: "100%", height: "100%" }}>
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
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#6366f1",
                border: "2px solid #fff",
                cursor: "pointer",
              }}
              title={project.proyecto}
            />
          </Marker>
        ))}
      </Map>
    </div>
  );
}
