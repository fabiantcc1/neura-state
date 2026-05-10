"use client";

import React from "react";
import {
  MapPin,
  Calendar,
  Home,
  CheckCircle2,
  XCircle,
  Zap,
  ListChecks,
} from "lucide-react";
import type { Project } from "@/app/lib/types";

interface InvestmentCardProps {
  project: Project;
  status: string;
}

export const InvestmentCard: React.FC<InvestmentCardProps> = ({
  project,
  status,
}) => {
  const calculateInvestmentScore = (): number => {
    let score = 0;

    if (project.acepta_airbnb) score += 30;

    const currentYear = new Date().getFullYear();
    const deliveryYear = parseInt(project.fecha_de_entrega || "0");
    const isImmediate =
      project.fecha_de_entrega?.toLowerCase().includes("inmediata") ||
      (deliveryYear > 0 && deliveryYear <= currentYear);

    if (isImmediate) {
      score += 30;
    } else if (deliveryYear === currentYear + 1) {
      score += 20;
    } else {
      score += 10;
    }

    const zonasPremium = [
      "Valle Poniente",
      "San Pedro",
      "Santa Catarina",
      "Huasteca",
      "Contry",
    ];
    score += zonasPremium.includes(project.zona || "") ? 40 : 25;

    return score;
  };

  const finalScore = project.investment_score ?? calculateInvestmentScore();
  const isImmediate =
    project.fecha_de_entrega?.toLowerCase().includes("inmediata") ||
    parseInt(project.fecha_de_entrega || "0") <= new Date().getFullYear();

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-[2.5rem] p-7 shadow-2xl w-full max-w-md text-white animate-in fade-in zoom-in duration-500">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-white leading-tight">
            {project.proyecto}
          </h3>
          <div className="flex items-center text-slate-400 text-sm mt-1.5 font-medium">
            <MapPin size={14} className="mr-1.5 text-indigo-400" />
            <span>
              {project.zona} •{" "}
              <span className="text-slate-500">{project.zona_ciudad}</span>
            </span>
          </div>
        </div>
        <div
          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
            status === "complete"
              ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]"
              : "bg-slate-800 text-slate-400 animate-pulse"
          }`}
        >
          {status === "complete" ? "Análisis Woznics" : "Calculando"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div
          className={`flex items-center gap-3 p-4 rounded-2xl border transition-colors ${
            isImmediate
              ? "border-emerald-500/40 bg-emerald-500/5"
              : "border-slate-800 bg-slate-800/30"
          }`}
        >
          <Calendar
            size={18}
            className={isImmediate ? "text-emerald-400" : "text-slate-500"}
          />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase text-slate-500 font-bold tracking-tighter">
              Entrega
            </span>
            <span
              className={`text-[13px] font-black ${isImmediate ? "text-emerald-400" : "text-white"}`}
            >
              {isImmediate ? "Inmediata" : project.fecha_de_entrega}
            </span>
          </div>
        </div>

        <div
          className={`flex items-center gap-3 p-4 rounded-2xl border transition-colors ${
            project.acepta_airbnb
              ? "border-emerald-500/40 bg-emerald-500/5"
              : "border-rose-500/40 bg-rose-500/5"
          }`}
        >
          {project.acepta_airbnb ? (
            <CheckCircle2 size={18} className="text-emerald-400" />
          ) : (
            <XCircle size={18} className="text-rose-400" />
          )}
          <div className="flex flex-col">
            <span className="text-[9px] uppercase text-slate-500 font-bold tracking-tighter">
              Airbnb
            </span>
            <span
              className={`text-[13px] font-black ${project.acepta_airbnb ? "text-emerald-400" : "text-rose-400"}`}
            >
              {project.acepta_airbnb ? "Permitido" : "No permitido"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-8 bg-slate-800/20 p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/15 p-2 rounded-xl">
            <Home size={18} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">
              Configuración
            </p>
            <p className="text-sm font-semibold text-slate-200">
              {project.recamaras.join(", ")} Recámaras
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="bg-indigo-500/15 p-2 rounded-xl mt-1">
            <ListChecks size={18} className="text-indigo-400" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">
              Amenidades destacadas
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {project.amenidades.length > 0 ? (
                project.amenidades.slice(0, 4).map((am, i) => (
                  <span
                    key={i}
                    className="text-[9px] bg-slate-800 text-slate-300 px-2 py-1 rounded-md border border-slate-700 font-medium"
                  >
                    {am}
                  </span>
                ))
              ) : (
                <span className="text-[10px] text-slate-600">No listadas</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[1.8rem] p-6 relative overflow-hidden shadow-lg">
        <Zap
          className="absolute -right-6 -bottom-6 text-white/10"
          size={120}
        />
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-indigo-200 text-[10px] uppercase font-black tracking-widest mb-1">
                Valor de Inversión
              </p>
              <div className="flex items-baseline gap-1">
                <h4 className="text-4xl font-black text-white leading-none">
                  {finalScore}
                </h4>
                <span className="text-indigo-300/60 font-bold text-lg">
                  /100
                </span>
              </div>
            </div>
            <span className="text-[9px] bg-white/10 backdrop-blur-md px-2 py-1 rounded-lg font-black text-white border border-white/10 italic">
              SISTEMA WOZNICS v1
            </span>
          </div>
          <div className="w-full bg-black/30 h-3.5 rounded-full p-1 border border-white/5">
            <div
              className="bg-white h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(255,255,255,0.4)]"
              style={{ width: `${finalScore}%` }}
            />
          </div>
          <p className="text-[9px] text-indigo-100/70 mt-4 font-semibold leading-tight">
            *Análisis basado en plusvalía de {project.zona}, flexibilidad
            operativa y tiempo de recuperación de capital.
          </p>
        </div>
      </div>
    </div>
  );
};
