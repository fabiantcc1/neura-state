"use client";

import { useRef } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Project } from "@/app/lib/types";
import projects from "@/app/lib/data/projects.json";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

const MONTERREY_CENTER = { longitude: -100.3161, latitude: 25.6866, zoom: 13 };

export default function ProjectsMap() {
  const mapRef = useRef(null);

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

        {(projects as Project[]).map((project) => (
          <Marker
            key={project.proyecto}
            longitude={project.lng}
            latitude={project.lat}
            anchor="bottom"
          >
            {/* Pin visual — reemplazar con tu diseño cuando estés listo */}
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
