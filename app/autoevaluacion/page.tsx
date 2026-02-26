"use client";
import { Shell } from "../../components/Shell";

export default function AutoEvaluacion() {
  return (
    <Shell>
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 mb-6">
          <span className="text-4xl">📋</span>
        </div>
        <h2 className="font-display text-2xl font-bold text-white mb-3">Auto-evaluación</h2>
        <p className="text-slate-400 text-base max-w-md mx-auto leading-relaxed mb-6">
          Esta sección está en desarrollo. Próximamente vas a poder evaluar el nivel de cumplimiento y preparación de tu empresa ante los principales estándares y regulaciones internacionales.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Próximamente
        </div>
      </div>
    </Shell>
  );
}
