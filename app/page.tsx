import { CopilotSidebar } from "@copilotkit/react-core/v2";
import MapWrapper from "@/app/components/MapWrapper";

export default function Home() {
  return (
    <main className="relative flex-1">
      <MapWrapper />
      <CopilotSidebar
        defaultOpen={true}
        labels={{
          welcomeMessageText: "¿En qué zona de NL buscas invertir?",
        }}
      />
    </main>
  );
}
