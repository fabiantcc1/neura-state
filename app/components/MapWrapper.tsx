"use client";

import dynamic from "next/dynamic";

const ProjectsMap = dynamic(
  () => import("@/app/components/ProjectsMap"),
  { ssr: false }
);

export default function MapWrapper() {
  return (
    <div className="absolute inset-0">
      <ProjectsMap />
    </div>
  );
}
