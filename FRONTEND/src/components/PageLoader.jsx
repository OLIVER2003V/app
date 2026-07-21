import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

// El hosting (Koyeb, plan gratuito) "duerme" el backend tras un rato sin
// tráfico y tarda entre 10 y 15 segundos en despertar en la primera
// petición. Un spinner quieto y mudo durante todo ese tiempo hace pensar
// que la página se colgó. Este loader va cambiando el mensaje a medida que
// pasa el tiempo (y mueve una barra de progreso que nunca llega al 100%,
// solo para transmitir avance) para que la espera se sienta intencional.
const STAGES = [
  { after: 0, key: "loader.stage1" },
  { after: 2500, key: "loader.stage2" },
  { after: 6000, key: "loader.stage3" },
  { after: 11000, key: "loader.stage4" },
];
const FAKE_PROGRESS_DURATION = 15000;
const FAKE_PROGRESS_CAP = 92;

export default function PageLoader() {
  const { t } = useTranslation();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 300);
    return () => clearInterval(id);
  }, []);

  const stageKey = [...STAGES].reverse().find((s) => elapsed >= s.after)?.key ?? STAGES[0].key;
  const progress = Math.min(FAKE_PROGRESS_CAP, (elapsed / FAKE_PROGRESS_DURATION) * 100);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-cyan-950 via-teal-950 to-emerald-950 px-4 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="relative">
        <div className="absolute inset-0 animate-pulse rounded-2xl bg-cyan-400/25 blur-2xl" />
        <img
          src="/images/cascada.png"
          alt=""
          className="relative h-20 w-20 rounded-2xl object-cover shadow-2xl ring-2 ring-white/20"
        />
      </div>

      <div className="flex items-center gap-2.5">
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-cyan-400" />
        <p key={stageKey} className="animate-in fade-in text-sm font-semibold text-cyan-100 duration-500">
          {t(stageKey)}
        </p>
      </div>

      <div className="h-1 w-48 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-[width] duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
