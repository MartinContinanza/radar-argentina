"use client";
import { useState } from "react";
import { Shell } from "../../components/Shell";

// ─── Certifications DB ────────────────────────────────────────────────────────
interface Cert {
  id: string; name: string; subtitle: string; desc: string; cat: string;
}

const certsDB: Record<string, Cert> = {
  RTRS:       { id: "RTRS",       name: "RTRS",              subtitle: "Round Table on Responsible Soy",       desc: "Certificación de producción y cadena de custodia enfocada en la soja responsable.",                                               cat: "Agricultura" },
  CRS:        { id: "CRS",        name: "CRS",               subtitle: "Certified Responsible Soya",           desc: "Estándar para la producción responsable de soja.",                                                                               cat: "Agricultura" },
  ARA:        { id: "ARA",        name: "ARA",               subtitle: "Algodón Responsable Argentino",        desc: "Sello específico para la producción sostenible de algodón en Argentina.",                                                        cat: "Agricultura" },
  Bonsucro:   { id: "Bonsucro",   name: "Bonsucro",          subtitle: "Sustentabilidad en Caña",              desc: "El estándar global para la producción sostenible de caña de azúcar.",                                                            cat: "Agricultura" },
  GLOBALGAP:  { id: "GLOBALGAP",  name: "GLOBALG.A.P.",      subtitle: "Buenas Prácticas Agrícolas",           desc: "Garantiza la inocuidad alimentaria y sustentabilidad en la producción primaria.",                                               cat: "Agricultura" },
  Rainforest: { id: "Rainforest", name: "Rainforest Alliance",subtitle: "Agricultura Sustentable",             desc: "Protección de bosques, clima, derechos humanos y medios de vida en el agro.",                                                   cat: "Agricultura" },
  FSSC22000:  { id: "FSSC22000",  name: "FSSC 22000",        subtitle: "Food Safety System Certification",     desc: "Sistemas rigurosos para garantizar la seguridad de los alimentos en plantas de procesamiento.",                                   cat: "Inocuidad Alimentaria" },
  HACCP:      { id: "HACCP",      name: "HACCP",             subtitle: "Hazard Analysis and Critical Control Points", desc: "Sistema de gestión de inocuidad alimentaria preventivo.",                                                                cat: "Inocuidad Alimentaria" },
  BRCGS:      { id: "BRCGS",      name: "BRCGS",             subtitle: "Global Standard for Food Safety",      desc: "Estándar global fundamental para la seguridad y calidad alimentaria.",                                                          cat: "Inocuidad Alimentaria" },
  Org_USDA:   { id: "Org_USDA",   name: "USDA Organic",      subtitle: "National Organic Program",             desc: "Certificación oficial para el mercado orgánico de Estados Unidos.",                                                             cat: "Orgánico" },
  Org_AR:     { id: "Org_AR",     name: "Orgánico Argentina", subtitle: "SENASA",                              desc: "Cumplimiento con la normativa argentina de producción orgánica (Res. 374/2016).",                                               cat: "Orgánico" },
  Org_EU:     { id: "Org_EU",     name: "EU Organic",        subtitle: "Regulación EEC No. 2018/848",          desc: "Acceso al mercado orgánico de la Unión Europea.",                                                                               cat: "Orgánico" },
  Org_JAS:    { id: "Org_JAS",    name: "JAS",               subtitle: "Japanese Agricultural Standard",       desc: "Estándar para la exportación de productos orgánicos a Japón/Asia.",                                                           cat: "Orgánico" },
  Org_COR:    { id: "Org_COR",    name: "COR",               subtitle: "Régimen Orgánico de Canadá",           desc: "Certificación requerida para comercializar productos orgánicos en Canadá.",                                                     cat: "Orgánico" },
  Org_SAG:    { id: "Org_SAG",    name: "SAG",               subtitle: "Certificación Orgánica Chile",         desc: "Sistema Nacional de Certificación de Productos Orgánicos Agrícolas de Chile.",                                                  cat: "Orgánico" },
  Reciclado:  { id: "Reciclado",  name: "GRS / RCS",         subtitle: "Global Recycled Standard",             desc: "Verificación de contenido reciclado y prácticas sociales/ambientales.",                                                        cat: "Textil" },
  GOTS:       { id: "GOTS",       name: "GOTS",              subtitle: "Global Organic Textile Standard",      desc: "Asegura la condición orgánica de los textiles, incluyendo criterios ecológicos y sociales.",                                    cat: "Textil" },
  OCS:        { id: "OCS",        name: "OCS",               subtitle: "Organic Content Standard",             desc: "Verifica la presencia y cantidad de material orgánico en un producto final.",                                                  cat: "Textil" },
  RWS:        { id: "RWS",        name: "RWS",               subtitle: "Responsible Wool Standard",            desc: "Bienestar animal y gestión responsable de la tierra en la producción de lana.",                                                 cat: "Textil" },
  ISCC_EU:    { id: "ISCC_EU",    name: "ISCC EU",           subtitle: "Biocombustibles Europa / Global",      desc: "Cumplimiento con la Directiva de Energías Renovables de la UE.",                                                               cat: "Biomasa y Biocombustible" },
  _2BSvs:     { id: "_2BSvs",     name: "2BSvs",             subtitle: "Biomass Biofuel Sustainability",       desc: "Esquema voluntario de sustentabilidad para biomasa y biocombustibles.",                                                        cat: "Biomasa y Biocombustible" },
  RFS2:       { id: "RFS2",       name: "RFS2",              subtitle: "Renewable Fuel Standard 2",            desc: "Estándar de combustibles limpios para Estados Unidos.",                                                                        cat: "Biomasa y Biocombustible" },
  CFR:        { id: "CFR",        name: "CFR",               subtitle: "Clean Fuel Regulation",                desc: "Estándar de combustibles limpios para Canadá.",                                                                                cat: "Biomasa y Biocombustible" },
  ISCC_Corsia:{ id: "ISCC_Corsia",name: "ISCC Corsia",       subtitle: "Aviación Internacional",               desc: "Sustentabilidad para el esquema de reducción de carbono en la aviación.",                                                     cat: "Biomasa y Biocombustible" },
  SMETA:      { id: "SMETA",      name: "SMETA",             subtitle: "Sedex Members Ethical Trade Audit",    desc: "Auditoría de cumplimiento social, condiciones laborales y ética empresarial.",                                                  cat: "Cumplimiento Social" },
  FairTrade:  { id: "FairTrade",  name: "Fair Trade USA",    subtitle: "Comercio Justo",                       desc: "Garantiza precios justos, protección ambiental y condiciones de trabajo seguras.",                                             cat: "Cumplimiento Social" },
  PPRS:       { id: "PPRS",       name: "PPRS",              subtitle: "Plastic Pollution Reduction",          desc: "Estándar para la reducción de la contaminación por plásticos.",                                                               cat: "Medioambiente" },
  ISCC_Plus:  { id: "ISCC_Plus",  name: "ISCC Plus",         subtitle: "Sustentabilidad y Carbono",            desc: "Certificación global de sustentabilidad, trazabilidad y reducción de huella de carbono para diversas industrias.",             cat: "Medioambiente" },
};

// ─── Cat accent colors ────────────────────────────────────────────────────────
const CAT_STYLES: Record<string, string> = {
  "Agricultura":            "bg-emerald-900/60 text-emerald-300 border-emerald-700",
  "Inocuidad Alimentaria":  "bg-amber-900/60 text-amber-300 border-amber-700",
  "Orgánico":               "bg-teal-900/60 text-teal-300 border-teal-700",
  "Textil":                 "bg-purple-900/60 text-purple-300 border-purple-700",
  "Biomasa y Biocombustible":"bg-orange-900/60 text-orange-300 border-orange-700",
  "Cumplimiento Social":    "bg-sky-900/60 text-sky-300 border-sky-700",
  "Medioambiente":          "bg-cyan-900/60 text-cyan-300 border-cyan-700",
};

// ─── Questions ────────────────────────────────────────────────────────────────
interface QuestionDef {
  id: string;
  text: string;
  options: { value: string; label: string }[];
  showIf: (answers: Record<string, string[]>) => boolean;
}

const questions: QuestionDef[] = [
  {
    id: "sector",
    text: "¿Cuál es el sector o industria principal de su empresa?",
    options: [
      { value: "agricultura",     label: "Agricultura y Cultivos" },
      { value: "alimentos",       label: "Procesamiento de Alimentos" },
      { value: "textil",          label: "Industria Textil / Indumentaria" },
      { value: "biocombustibles", label: "Biomasa y Biocombustibles" },
      { value: "nada",            label: "Otro / Servicios" },
    ],
    showIf: () => true,
  },
  {
    id: "rol_cadena",
    text: "¿Cuál es su rol en la cadena de suministro?",
    options: [
      { value: "produccion",    label: "Producción Primaria (Campo / Cosecha)" },
      { value: "procesamiento", label: "Procesamiento / Manufactura / Empaque" },
      { value: "nada",          label: "No aplica / No me interesa especificar" },
    ],
    showIf: () => true,
  },
  {
    id: "mercado",
    text: "¿A qué mercado principal exporta o desea acceder?",
    options: [
      { value: "europa",       label: "Europa (UE)" },
      { value: "norteamerica", label: "Norteamérica (USA / Canadá)" },
      { value: "asia",         label: "Asia (Japón, etc.)" },
      { value: "latam",        label: "Mercado Local / Latinoamérica" },
      { value: "global",       label: "Múltiples destinos / Global" },
      { value: "nada",         label: "Aún no definido / No aplica" },
    ],
    showIf: () => true,
  },
  {
    id: "cultivo_tipo",
    text: "En agricultura, ¿qué tipo de producción realizan?",
    options: [
      { value: "soja",    label: "Cereales y Oleaginosas" },
      { value: "algodon", label: "Algodón" },
      { value: "cana",    label: "Caña de Azúcar" },
      { value: "general", label: "Frutas y Hortalizas" },
      { value: "otros",   label: "Otros cultivos" },
      { value: "nada",    label: "No me interesa certificar el cultivo" },
    ],
    showIf: (a) => !!(a.sector?.includes("agricultura")),
  },
  {
    id: "alimentos_enfoque",
    text: "En su producción de alimentos, ¿qué atributo desea garantizar?",
    options: [
      { value: "inocuidad", label: "Inocuidad y Seguridad" },
      { value: "organico",  label: "Condición Orgánica (Sin químicos)" },
      { value: "nada",      label: "No me interesa certificar estos atributos" },
    ],
    showIf: (a) => !!(a.sector?.includes("alimentos")),
  },
  {
    id: "textil_material",
    text: "En sus productos textiles, ¿qué material predomina?",
    options: [
      { value: "reciclado", label: "Materiales Reciclados (PET, etc.)" },
      { value: "organico",  label: "Fibras Orgánicas (Algodón, etc.)" },
      { value: "lana",      label: "Lana de oveja" },
      { value: "nada",      label: "Otro / No busco certificar el material" },
    ],
    showIf: (a) => !!(a.sector?.includes("textil")),
  },
  {
    id: "social",
    text: "¿Sus clientes le exigen demostrar prácticas de Responsabilidad Social y Comercio Ético?",
    options: [
      { value: "si",   label: "Sí, nos interesa certificar" },
      { value: "nada", label: "No es prioridad por ahora" },
    ],
    showIf: () => true,
  },
  {
    id: "plastico",
    text: "¿Tienen políticas o interés en certificar la reducción del uso de plásticos?",
    options: [
      { value: "si",   label: "Sí, queremos medirlo y certificarlo" },
      { value: "nada", label: "Por el momento no nos interesa" },
    ],
    showIf: () => true,
  },
  {
    id: "carbono",
    text: "¿Les interesa medir o certificar su Huella de Carbono y Reducción de Emisiones?",
    options: [
      { value: "si",   label: "Sí, buscamos certificar nuestra gestión ambiental" },
      { value: "nada", label: "Aún no es una prioridad" },
    ],
    showIf: () => true,
  },
];

// ─── Results logic ────────────────────────────────────────────────────────────
function calculateResults(answers: Record<string, string[]>, currentCerts: string[]): Cert[] {
  const has = (qId: string, val: string) => answers[qId]?.includes(val);
  const results: Cert[] = [];

  if (has("sector", "agricultura")) {
    if (has("cultivo_tipo", "soja")) results.push(certsDB.RTRS, certsDB.CRS);
    if (has("cultivo_tipo", "algodon")) results.push(certsDB.ARA);
    if (has("cultivo_tipo", "cana")) results.push(certsDB.Bonsucro);
    if (!has("cultivo_tipo", "nada") && answers.cultivo_tipo?.length) {
      results.push(certsDB.Rainforest);
      if (has("rol_cadena", "produccion")) results.push(certsDB.GLOBALGAP);
    }
  }
  if (has("sector", "alimentos")) {
    if (has("alimentos_enfoque", "inocuidad") && has("rol_cadena", "procesamiento"))
      results.push(certsDB.FSSC22000, certsDB.HACCP, certsDB.BRCGS);
    if (has("alimentos_enfoque", "organico")) {
      if (has("mercado", "europa"))       results.push(certsDB.Org_EU);
      if (has("mercado", "norteamerica")) results.push(certsDB.Org_USDA, certsDB.Org_COR);
      if (has("mercado", "asia"))         results.push(certsDB.Org_JAS);
      if (has("mercado", "latam"))        results.push(certsDB.Org_AR, certsDB.Org_SAG);
      if (has("mercado", "global"))       results.push(certsDB.Org_USDA, certsDB.Org_EU, certsDB.Org_JAS);
    }
  }
  if (has("sector", "textil")) {
    if (has("textil_material", "reciclado")) results.push(certsDB.Reciclado);
    if (has("textil_material", "organico"))  results.push(certsDB.GOTS, certsDB.OCS);
    if (has("textil_material", "lana"))      results.push(certsDB.RWS);
  }
  if (has("sector", "biocombustibles")) {
    if (has("mercado", "europa"))       results.push(certsDB.ISCC_EU, certsDB._2BSvs);
    if (has("mercado", "norteamerica")) results.push(certsDB.RFS2, certsDB.CFR);
    if (has("mercado", "global"))       results.push(certsDB.ISCC_Corsia, certsDB.ISCC_EU, certsDB._2BSvs);
    if (!answers.mercado?.length || has("mercado", "nada")) results.push(certsDB.ISCC_EU, certsDB._2BSvs);
  }
  if (has("social", "si"))   results.push(certsDB.SMETA, certsDB.FairTrade);
  if (has("plastico", "si")) results.push(certsDB.PPRS);
  if (has("carbono", "si"))  results.push(certsDB.ISCC_Plus);

  // Deduplicate and remove certs user already has
  const seen = new Set<string>();
  return results.filter(c => c && !seen.has(c.id) && seen.add(c.id) && !currentCerts.includes(c.id));
}

// ─── Cat grouping of all certs ────────────────────────────────────────────────
const certsByCategory: Record<string, Cert[]> = {};
Object.values(certsDB).forEach(c => {
  if (!certsByCategory[c.cat]) certsByCategory[c.cat] = [];
  certsByCategory[c.cat].push(c);
});

// ─── Step types ───────────────────────────────────────────────────────────────
type Step = "landing" | "current-certs" | "quiz" | "analyzing" | "results";

// ─── Main component ───────────────────────────────────────────────────────────
export default function Escala() {
  const [step, setStep]               = useState<Step>("landing");
  const [currentCerts, setCurrentCerts] = useState<string[]>([]);
  const [answers, setAnswers]         = useState<Record<string, string[]>>({});
  const [qIndex, setQIndex]           = useState(0);
  const [results, setResults]         = useState<Cert[]>([]);

  // Compute visible questions based on current answers
  const visibleQs = questions.filter(q => q.showIf(answers));
  const currentQ  = visibleQs[qIndex];
  const progress  = visibleQs.length > 0 ? (qIndex / visibleQs.length) * 100 : 0;

  function toggleCurrentCert(id: string) {
    setCurrentCerts(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  }

  function startQuiz() {
    setAnswers({});
    setQIndex(0);
    setStep("quiz");
  }

  function handleSelect(qId: string, value: string) {
    setAnswers(prev => {
      const cur = prev[qId] ?? [];
      let next: string[];
      if (value === "nada") {
        next = cur.includes("nada") ? [] : ["nada"];
      } else {
        const without = cur.filter(v => v !== "nada");
        next = without.includes(value) ? without.filter(v => v !== value) : [...without, value];
      }
      return { ...prev, [qId]: next };
    });
  }

  function handleNext() {
    if (!answers[currentQ.id]?.length) return;
    // Recompute visible questions with updated answers to determine length
    const updatedVisible = questions.filter(q => q.showIf({ ...answers }));
    if (qIndex < updatedVisible.length - 1) {
      setQIndex(i => i + 1);
    } else {
      const res = calculateResults(answers, currentCerts);
      setResults(res);
      setStep("analyzing");
      setTimeout(() => setStep("results"), 1800);
    }
  }

  function handleBack() {
    if (qIndex > 0) {
      setQIndex(i => i - 1);
    } else {
      setStep("current-certs");
    }
  }

  function restart() {
    setCurrentCerts([]);
    setAnswers({});
    setQIndex(0);
    setStep("landing");
  }

  return (
    <Shell>
      {/* ── Landing ── */}
      {step === "landing" && (
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[#3EB2ED]">◈</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Escalá</span>
            </div>
            <h2 className="font-display text-3xl font-bold text-white mb-3 leading-tight">
              Descubrí tu próxima certificación estratégica
            </h2>
            <p className="text-slate-400 text-base max-w-2xl leading-relaxed">
              Completá este árbol de decisión en menos de 2 minutos. Analizamos tu industria, tus prácticas actuales
              y te recomendamos qué certificaciones pueden abrirte nuevos mercados y agregar valor a tu empresa.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
            {[
              { n: "26+", label: "Certificaciones en base de datos" },
              { n: "9",   label: "Preguntas del análisis" },
              { n: "~2 min", label: "Tiempo estimado" },
            ].map(stat => (
              <div key={stat.label} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-center">
                <p className="text-xl font-bold text-[#3EB2ED]">{stat.n}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep("current-certs")}
            className="px-8 py-3 bg-[#3EB2ED] hover:bg-[#1a8fc7] text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Comenzar análisis →
          </button>
        </div>
      )}

      {/* ── Current certs ── */}
      {step === "current-certs" && (
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="mb-8">
            <button onClick={() => setStep("landing")} className="text-xs text-slate-500 hover:text-[#3EB2ED] transition-colors mb-4 block">
              ← Volver
            </button>
            <h2 className="font-display text-2xl font-bold text-white mb-2">
              ¿Con qué certificaciones contás actualmente?
            </h2>
            <p className="text-slate-400 text-sm">
              Seleccioná las que ya tenés. Si no tenés ninguna aún, simplemente continuá.
            </p>
          </div>

          <div className="space-y-7 mb-8">
            {Object.entries(certsByCategory).map(([cat, certs]) => (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border ${CAT_STYLES[cat] ?? "bg-slate-700 text-slate-300 border-slate-600"}`}>
                    {cat}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {certs.map(cert => {
                    const sel = currentCerts.includes(cert.id);
                    return (
                      <button
                        key={cert.id}
                        onClick={() => toggleCurrentCert(cert.id)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all ${
                          sel
                            ? "border-[#3EB2ED] bg-[#3EB2ED]/10 text-white"
                            : "border-slate-700/60 bg-slate-800/40 text-slate-400 hover:border-slate-500 hover:bg-slate-800"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                          sel ? "border-[#3EB2ED] bg-[#3EB2ED]" : "border-slate-600"
                        }`}>
                          {sel && <span className="text-white text-[9px] font-bold leading-none">✓</span>}
                        </div>
                        <span className="text-sm font-semibold leading-tight">{cert.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-700/40">
            {currentCerts.length > 0 ? (
              <span className="text-xs text-slate-500">{currentCerts.length} certificación{currentCerts.length !== 1 ? "es" : ""} seleccionada{currentCerts.length !== 1 ? "s" : ""}</span>
            ) : (
              <span className="text-xs text-slate-600">Ninguna seleccionada</span>
            )}
            <button
              onClick={startQuiz}
              className="px-6 py-2.5 bg-[#3EB2ED] hover:bg-[#1a8fc7] text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Continuar →
            </button>
          </div>
        </div>
      )}

      {/* ── Quiz ── */}
      {step === "quiz" && currentQ && (
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Paso {qIndex + 1} de {visibleQs.length}</span>
              <span>{Math.round(progress)}% completado</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3EB2ED] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question card */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 mb-4">
            <p className="text-[10px] font-bold text-[#3EB2ED] uppercase tracking-widest mb-3">
              Pregunta {qIndex + 1}
            </p>
            <h3 className="text-base font-semibold text-white leading-relaxed">{currentQ.text}</h3>
            {currentQ.options.length > 2 && (
              <p className="text-xs text-slate-500 mt-2">Podés elegir más de una opción</p>
            )}
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
            {currentQ.options.map(opt => {
              const sel = answers[currentQ.id]?.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(currentQ.id, opt.value)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${
                    sel
                      ? "border-[#3EB2ED] bg-[#3EB2ED]/10 text-white"
                      : "border-slate-700/60 bg-slate-800/40 text-slate-300 hover:border-slate-500 hover:bg-slate-800"
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                    sel ? "border-[#3EB2ED] bg-[#3EB2ED]" : "border-slate-600"
                  }`}>
                    {sel && <span className="text-white text-[10px] font-bold">✓</span>}
                  </div>
                  <span className="text-sm font-medium leading-snug">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button onClick={handleBack} className="text-xs text-slate-500 hover:text-[#3EB2ED] transition-colors">
              ← Atrás
            </button>
            <button
              onClick={handleNext}
              disabled={!answers[currentQ.id]?.length}
              className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                answers[currentQ.id]?.length
                  ? "bg-[#3EB2ED] hover:bg-[#1a8fc7] text-white"
                  : "bg-slate-700 text-slate-500 cursor-not-allowed"
              }`}
            >
              {qIndex === visibleQs.length - 1 ? "Ver resultados →" : "Siguiente →"}
            </button>
          </div>
        </div>
      )}

      {/* ── Analyzing ── */}
      {step === "analyzing" && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-2 border-[#3EB2ED] border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-slate-300 text-base font-semibold">Analizando tu perfil…</p>
            <p className="text-slate-500 text-sm mt-1">Calculando el valor agregado de tus procesos.</p>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {step === "results" && (
        <div className="max-w-4xl mx-auto px-4 py-10">
          {/* Current certs section */}
          {currentCerts.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-emerald-400 text-lg">✓</span>
                <h3 className="font-display text-lg font-bold text-white">Tus certificaciones actuales</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                {currentCerts.map(id => {
                  const c = certsDB[id];
                  if (!c) return null;
                  return (
                    <div key={id} className="bg-emerald-900/20 border border-emerald-700/40 rounded-xl p-3 text-center">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${CAT_STYLES[c.cat] ?? ""} block mb-1.5 mx-auto w-fit`}>
                        {c.cat}
                      </span>
                      <p className="text-sm font-bold text-white">{c.name}</p>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-slate-700/40" />
            </div>
          )}

          {/* Recommendations */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#3EB2ED]/15 border border-[#3EB2ED]/30 flex items-center justify-center text-[#3EB2ED] shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-white leading-tight">
                  Potenciá tu valor con estas certificaciones
                </h2>
                <p className="text-slate-400 text-sm mt-0.5">
                  Basado en tus respuestas, integrar estas normativas te abrirá nuevos mercados.
                </p>
              </div>
            </div>
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {results.map(cert => (
                <div
                  key={cert.id}
                  className="group bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 hover:border-[#3EB2ED]/50 hover:bg-slate-800 transition-all duration-200 flex flex-col gap-2"
                >
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border w-fit ${CAT_STYLES[cert.cat] ?? "bg-slate-700 text-slate-300 border-slate-600"}`}>
                    {cert.cat}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-[#3EB2ED] transition-colors">
                      {cert.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">{cert.subtitle}</p>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed mt-auto">{cert.desc}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-emerald-900/20 border border-emerald-700/40 rounded-2xl p-8 text-center mb-10">
              <p className="text-xl font-bold text-white mb-2">¡Perfil integral!</p>
              <p className="text-slate-300 text-sm max-w-md mx-auto">
                Ya contás con las certificaciones que consideramos ideales para tu perfil. Contactanos para explorar auditorías personalizadas o de segunda parte.
              </p>
            </div>
          )}

          {/* CTA block */}
          <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-6">
            <div>
              <h3 className="font-display text-lg font-bold text-white mb-1">¿Listo para dar el siguiente paso?</h3>
              <p className="text-slate-400 text-sm">Nuestros expertos están listos para guiarte en el proceso de certificación.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href="mailto:tpalacios@controlunion.com?subject=Consulta%20sobre%20Certificaci%C3%B3n"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#3EB2ED] hover:bg-[#1a8fc7] text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <span>✉</span> Enviar correo
              </a>
              <a
                href="https://wa.me/5491176091484"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <span>💬</span> WhatsApp
              </a>
            </div>
          </div>

          <button onClick={restart} className="text-xs text-slate-500 hover:text-[#3EB2ED] transition-colors underline">
            Volver a realizar el análisis
          </button>
        </div>
      )}
    </Shell>
  );
}
