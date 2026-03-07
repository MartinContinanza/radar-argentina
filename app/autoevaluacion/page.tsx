"use client";
import { useState, useEffect } from "react";
import { Shell } from "../../components/Shell";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Option { value: number; label: string; }
interface Question { id: number; category: string; question: string; options: Option[]; }
interface Program {
  id: string;
  name: string;
  description: string;
  icon: string;
  logo: string;
  reference: string;
  questions: Question[];
  accentColor: string;
  tagColor: string;
}

// ─── Program Data ─────────────────────────────────────────────────────────────
const programs: Program[] = [
  {
    id: "organico",
    name: "Orgánico Argentina",
    description: "Certificación de producción orgánica según normativa argentina",
    icon: "🌿",
    logo: "/logos/organico-logo.png",
    reference: "Versión: 2024",
    accentColor: "#4ade80",
    tagColor: "bg-emerald-900/60 text-emerald-300 border-emerald-700",
    questions: [
      { id: 1, category: "Documentación y Control", question: "¿Cuenta su establecimiento con la documentación completa requerida para iniciar el proceso de certificación orgánica (planos georreferenciados, historial de tratamientos de los últimos 3 años, plan de producción)?", options: [{ value: 3, label: "Sí, toda la documentación está completa y actualizada" }, { value: 2, label: "Tenemos la mayoría de documentos pero algunos están incompletos" }, { value: 1, label: "Tenemos documentación básica pero falta información importante" }, { value: 0, label: "No contamos con la documentación requerida" }] },
      { id: 2, category: "Período de Conversión", question: "¿Ha aplicado productos de síntesis química (agroquímicos, fertilizantes sintéticos) en sus lotes durante los últimos 3 años?", options: [{ value: 3, label: "No, no hemos usado productos de síntesis química en los últimos 3 años" }, { value: 2, label: "Usamos productos de síntesis química ocasionalmente hace más de 2 años" }, { value: 1, label: "Usamos productos de síntesis química hace menos de 2 años" }, { value: 0, label: "Actualmente usamos productos de síntesis química" }] },
      { id: 3, category: "Manejo de Suelos y Fertilidad", question: "¿Qué prácticas utiliza para mantener o incrementar la fertilidad del suelo?", options: [{ value: 3, label: "Rotación de cultivos, abonos verdes, compost orgánico y prácticas de conservación" }, { value: 2, label: "Aplicamos algunas prácticas orgánicas pero aún usamos fertilizantes sintéticos" }, { value: 1, label: "Principalmente usamos fertilizantes de síntesis química" }, { value: 0, label: "No tenemos un plan definido de manejo de fertilidad" }] },
      { id: 4, category: "Control de Plagas y Enfermedades", question: "¿Cómo maneja las plagas, enfermedades y malezas en su producción?", options: [{ value: 3, label: "Con métodos preventivos, biológicos, mecánicos y solo productos permitidos en orgánico" }, { value: 2, label: "Combinamos métodos biológicos con algunos agroquímicos de bajo impacto" }, { value: 1, label: "Principalmente con agroquímicos convencionales" }, { value: 0, label: "Uso intensivo de agroquímicos sintéticos" }] },
      { id: 5, category: "Semillas y Material Reproductivo", question: "¿Qué tipo de semillas o material de reproducción utiliza?", options: [{ value: 3, label: "Semillas y material de reproducción orgánico certificado" }, { value: 2, label: "Semillas convencionales sin tratamiento químico" }, { value: 1, label: "Semillas convencionales tratadas que podemos lavar" }, { value: 0, label: "Usamos semillas sin verificar su origen o tratamiento" }] },
      { id: 6, category: "Separación y Trazabilidad", question: "Si produce productos orgánicos y convencionales, ¿cómo los mantiene separados?", options: [{ value: 3, label: "Solo producimos orgánico o tenemos separación física clara con registros completos" }, { value: 2, label: "Tenemos producción mixta con buena separación y registros" }, { value: 1, label: "Tenemos producción mixta pero la separación no es clara" }, { value: 0, label: "No hay separación entre producción orgánica y convencional" }] },
      { id: 7, category: "Registros y Documentación", question: "¿Lleva registros actualizados de todas las operaciones (siembra, tratamientos, cosecha, ventas)?", options: [{ value: 3, label: "Sí, llevamos registros completos y actualizados de todas las operaciones" }, { value: 2, label: "Llevamos registros básicos pero no de todas las operaciones" }, { value: 1, label: "Tenemos algunos registros pero están incompletos" }, { value: 0, label: "No llevamos registros sistemáticos" }] },
      { id: 8, category: "Agua y Contaminación", question: "¿Ha identificado posibles fuentes de contaminación (vecinos con producción convencional, fuentes de agua, otros)?", options: [{ value: 3, label: "No hay fuentes de contaminación identificadas o tenemos zonas buffer adecuadas" }, { value: 2, label: "Hay fuentes de riesgo pero tenemos medidas de mitigación" }, { value: 1, label: "Hay fuentes de contaminación cercanas sin medidas claras" }, { value: 0, label: "Hay alto riesgo de contaminación cruzada" }] },
      { id: 9, category: "Almacenamiento y Procesamiento", question: "¿Cómo maneja el almacenamiento y procesamiento de sus productos?", options: [{ value: 3, label: "Instalaciones exclusivas para orgánico, limpias y con productos permitidos" }, { value: 2, label: "Instalaciones compartidas pero con separación clara en tiempo/espacio" }, { value: 1, label: "Instalaciones compartidas con riesgo de mezcla o contaminación" }, { value: 0, label: "No tenemos control sobre almacenamiento/procesamiento" }] },
      { id: 10, category: "Conocimiento de la Normativa", question: "¿Conoce los requisitos y principios de la producción orgánica según la normativa argentina?", options: [{ value: 3, label: "Sí, conocemos la normativa y aplicamos todos los principios orgánicos" }, { value: 2, label: "Conocemos los principios básicos y estamos en proceso de implementación" }, { value: 1, label: "Tenemos conocimiento limitado de la normativa orgánica" }, { value: 0, label: "No conocemos la normativa orgánica en detalle" }] },
    ],
  },
  {
    id: "rws",
    name: "RWS",
    description: "Responsible Wool Standard — Lana Responsable",
    icon: "🐑",
    logo: "/logos/rws-logo.png",
    reference: "Versión: 2023",
    accentColor: "#fb923c",
    tagColor: "bg-amber-900/60 text-amber-300 border-amber-700",
    questions: [
      { id: 1, category: "Bienestar Animal", question: "¿Cuenta con un plan de manejo animal documentado que incluya nutrición, salud y bienestar de las ovejas?", options: [{ value: 3, label: "Sí, completamente documentado y actualizado" }, { value: 2, label: "Parcialmente documentado" }, { value: 1, label: "En proceso de desarrollo" }, { value: 0, label: "No existe plan documentado" }] },
      { id: 2, category: "Mulesing", question: "¿Cuál es la situación respecto al mulesing en su establecimiento?", options: [{ value: 3, label: "No se practica mulesing (libre de mulesing)" }, { value: 2, label: "Se utiliza alivio del dolor certificado" }, { value: 1, label: "Se está eliminando gradualmente" }, { value: 0, label: "Se practica mulesing sin alivio del dolor" }] },
      { id: 3, category: "Nutrición y Agua", question: "¿Los animales tienen acceso continuo a agua limpia y alimentación adecuada según su edad y necesidades?", options: [{ value: 3, label: "Sí, con registros de monitoreo" }, { value: 2, label: "Sí, pero sin registros formales" }, { value: 1, label: "Acceso limitado en algunas épocas" }, { value: 0, label: "No se garantiza acceso continuo" }] },
      { id: 4, category: "Manejo de Tierra", question: "¿Cuenta con prácticas documentadas de conservación de suelos y manejo sostenible de pasturas?", options: [{ value: 3, label: "Sí, con plan de manejo de tierras implementado" }, { value: 2, label: "Algunas prácticas implementadas" }, { value: 1, label: "En proceso de implementación" }, { value: 0, label: "No hay prácticas de conservación" }] },
      { id: 5, category: "Biodiversidad", question: "¿Ha identificado y protege áreas de alto valor de conservación y biodiversidad en su establecimiento?", options: [{ value: 3, label: "Sí, identificadas y protegidas formalmente" }, { value: 2, label: "Identificadas pero sin protección formal" }, { value: 1, label: "En proceso de identificación" }, { value: 0, label: "No se han identificado" }] },
      { id: 6, category: "Bienestar Social", question: "¿Cumple con todas las leyes laborales aplicables y garantiza condiciones de trabajo seguras?", options: [{ value: 3, label: "Sí, con políticas documentadas y auditorías" }, { value: 2, label: "Sí, cumplimiento general" }, { value: 1, label: "Cumplimiento parcial" }, { value: 0, label: "No se puede demostrar cumplimiento" }] },
      { id: 7, category: "Trabajo Infantil/Forzado", question: "¿Tiene políticas y procedimientos para prevenir el trabajo infantil y el trabajo forzado?", options: [{ value: 3, label: "Sí, políticas documentadas y verificables" }, { value: 2, label: "Políticas informales establecidas" }, { value: 1, label: "En desarrollo" }, { value: 0, label: "No existen políticas" }] },
      { id: 8, category: "Trazabilidad", question: "¿Puede demostrar la trazabilidad de la lana desde la esquila hasta la venta?", options: [{ value: 3, label: "Sí, sistema completo de trazabilidad" }, { value: 2, label: "Trazabilidad parcial documentada" }, { value: 1, label: "Registros básicos solamente" }, { value: 0, label: "No hay sistema de trazabilidad" }] },
      { id: 9, category: "Transporte y Manejo", question: "¿Cuenta con procedimientos para el transporte y manejo humanitario de los animales?", options: [{ value: 3, label: "Sí, procedimientos documentados y capacitación" }, { value: 2, label: "Procedimientos básicos establecidos" }, { value: 1, label: "Prácticas informales" }, { value: 0, label: "Sin procedimientos establecidos" }] },
      { id: 10, category: "Sistema de Gestión", question: "¿Tiene un sistema de gestión que permita mantener registros y demostrar mejora continua?", options: [{ value: 3, label: "Sí, sistema completo implementado" }, { value: 2, label: "Sistema básico en funcionamiento" }, { value: 1, label: "En proceso de implementación" }, { value: 0, label: "No existe sistema de gestión" }] },
    ],
  },
  {
    id: "2bsvs",
    name: "2BSvs",
    description: "Biomass Biofuels Sustainability — Biocombustibles Sostenibles",
    icon: "⛽",
    logo: "/logos/2bsvs-logo.png",
    reference: "Versión: 2024",
    accentColor: "#a78bfa",
    tagColor: "bg-purple-900/60 text-purple-300 border-purple-700",
    questions: [
      { id: 1, category: "Trazabilidad", question: "¿Cuenta con un sistema de trazabilidad de la biomasa desde el origen hasta la entrega?", options: [{ value: 3, label: "Sí, sistema completo y documentado" }, { value: 2, label: "Sistema parcial implementado" }, { value: 1, label: "En desarrollo" }, { value: 0, label: "No existe sistema" }] },
      { id: 2, category: "Balance de Masa", question: "¿Implementa un sistema de balance de masa para materias primas sostenibles y no sostenibles?", options: [{ value: 3, label: "Sí, con registros completos y auditorías" }, { value: 2, label: "Parcialmente implementado" }, { value: 1, label: "En proceso de implementación" }, { value: 0, label: "No implementado" }] },
      { id: 3, category: "Criterios de Sostenibilidad", question: "¿Verifica que la biomasa cumpla con criterios de reducción de emisiones de GEI?", options: [{ value: 3, label: "Sí, con cálculos documentados y verificables" }, { value: 2, label: "Verificación básica" }, { value: 1, label: "En desarrollo" }, { value: 0, label: "No se verifica" }] },
      { id: 4, category: "Uso de la Tierra", question: "¿Puede demostrar que la biomasa no proviene de tierras con alto valor de biodiversidad o alto stock de carbono?", options: [{ value: 3, label: "Sí, con declaraciones y evidencia documentada" }, { value: 2, label: "Declaraciones parciales" }, { value: 1, label: "En proceso de verificación" }, { value: 0, label: "No se puede demostrar" }] },
      { id: 5, category: "Gestión Ambiental", question: "¿Implementa prácticas de gestión sostenible del suelo, agua y biodiversidad?", options: [{ value: 3, label: "Sí, plan completo implementado" }, { value: 2, label: "Algunas prácticas implementadas" }, { value: 1, label: "En desarrollo" }, { value: 0, label: "No implementadas" }] },
      { id: 6, category: "Derechos de Tierra", question: "¿Respeta los derechos de uso de la tierra y los derechos consuetudinarios?", options: [{ value: 3, label: "Sí, con evidencia y consentimiento documentado" }, { value: 2, label: "Respeto general de derechos" }, { value: 1, label: "Cumplimiento parcial" }, { value: 0, label: "No se puede demostrar" }] },
      { id: 7, category: "Condiciones Laborales", question: "¿Cumple con las leyes laborales y garantiza condiciones de trabajo dignas?", options: [{ value: 3, label: "Sí, cumplimiento completo y documentado" }, { value: 2, label: "Cumplimiento general" }, { value: 1, label: "Cumplimiento parcial" }, { value: 0, label: "No se puede demostrar" }] },
      { id: 8, category: "Cadena de Custodia", question: "¿Mantiene la segregación física o documental de materias primas certificadas?", options: [{ value: 3, label: "Sí, sistema robusto de segregación" }, { value: 2, label: "Segregación básica" }, { value: 1, label: "En implementación" }, { value: 0, label: "No existe segregación" }] },
      { id: 9, category: "Certificados de Sostenibilidad", question: "¿Emite y gestiona correctamente los Certificados de Sostenibilidad (PoS)?", options: [{ value: 3, label: "Sí, gestión completa y conforme" }, { value: 2, label: "Gestión básica" }, { value: 1, label: "En aprendizaje" }, { value: 0, label: "No se gestionan" }] },
      { id: 10, category: "Auditoría y Mejora", question: "¿Tiene un sistema de gestión que facilite auditorías y mejora continua?", options: [{ value: 3, label: "Sí, sistema completo implementado" }, { value: 2, label: "Sistema básico" }, { value: 1, label: "En desarrollo" }, { value: 0, label: "No existe sistema" }] },
    ],
  },
  {
    id: "rtrs",
    name: "RTRS",
    description: "Round Table on Responsible Soy — Soja Responsable",
    icon: "🌱",
    logo: "/logos/rtrs-logo.png",
    reference: "Versión: 2024",
    accentColor: "#38bdf8",
    tagColor: "bg-sky-900/60 text-sky-300 border-sky-700",
    questions: [
      { id: 1, category: "Cumplimiento Legal", question: "¿Cumple con todas las leyes y regulaciones nacionales e internacionales aplicables?", options: [{ value: 3, label: "Sí, cumplimiento completo documentado" }, { value: 2, label: "Cumplimiento general" }, { value: 1, label: "Cumplimiento parcial" }, { value: 0, label: "No se puede demostrar cumplimiento" }] },
      { id: 2, category: "Derechos de Tierra", question: "¿Puede demostrar derechos legales de uso de la tierra o consentimiento de titulares legítimos?", options: [{ value: 3, label: "Sí, con documentación completa" }, { value: 2, label: "Documentación parcial" }, { value: 1, label: "En proceso de formalización" }, { value: 0, label: "No se puede demostrar" }] },
      { id: 3, category: "Trabajo Infantil/Forzado", question: "¿Tiene políticas y medidas para prevenir trabajo infantil, forzado o trata de personas?", options: [{ value: 3, label: "Sí, políticas documentadas y verificables" }, { value: 2, label: "Políticas básicas" }, { value: 1, label: "En desarrollo" }, { value: 0, label: "No existen políticas" }] },
      { id: 4, category: "Condiciones Laborales", question: "¿Garantiza condiciones de trabajo seguras, salubres y equitativas?", options: [{ value: 3, label: "Sí, con programas documentados" }, { value: 2, label: "Condiciones básicas garantizadas" }, { value: 1, label: "Cumplimiento parcial" }, { value: 0, label: "No se puede demostrar" }] },
      { id: 5, category: "Consulta Comunitaria", question: "¿Implementa procesos de consulta y negociación con comunidades locales?", options: [{ value: 3, label: "Sí, proceso formal establecido" }, { value: 2, label: "Consultas informales" }, { value: 1, label: "Limitado" }, { value: 0, label: "No se realizan consultas" }] },
      { id: 6, category: "Áreas de Alto Valor", question: "¿Ha identificado y protege áreas de alto valor de conservación (HCV) y alto stock de carbono (HCS)?", options: [{ value: 3, label: "Sí, identificadas y protegidas" }, { value: 2, label: "Identificadas parcialmente" }, { value: 1, label: "En proceso" }, { value: 0, label: "No identificadas" }] },
      { id: 7, category: "Buenas Prácticas Agrícolas", question: "¿Implementa buenas prácticas agrícolas para manejo de suelo, agua y biodiversidad?", options: [{ value: 3, label: "Sí, plan completo implementado" }, { value: 2, label: "Algunas prácticas implementadas" }, { value: 1, label: "En desarrollo" }, { value: 0, label: "No implementadas" }] },
      { id: 8, category: "Gestión de Agroquímicos", question: "¿Maneja responsablemente agroquímicos según las mejores prácticas?", options: [{ value: 3, label: "Sí, con capacitación y equipamiento adecuado" }, { value: 2, label: "Manejo básico" }, { value: 1, label: "Necesita mejoras" }, { value: 0, label: "Sin control adecuado" }] },
      { id: 9, category: "Gestión de Residuos", question: "¿Implementa un plan de gestión de residuos y envases?", options: [{ value: 3, label: "Sí, plan documentado e implementado" }, { value: 2, label: "Plan básico" }, { value: 1, label: "En desarrollo" }, { value: 0, label: "No existe plan" }] },
      { id: 10, category: "Mejora Continua", question: "¿Monitorea y evalúa para asegurar mejora continua?", options: [{ value: 3, label: "Sí, sistema completo de monitoreo" }, { value: 2, label: "Monitoreo básico" }, { value: 1, label: "En implementación" }, { value: 0, label: "No hay monitoreo" }] },
    ],
  },
  {
    id: "fsa",
    name: "FSA – SAI",
    description: "Farm Sustainability Assessment — Evaluación de Sostenibilidad Agrícola",
    icon: "🌾",
    logo: "/logos/fsa-logo.png",
    reference: "Versión: 2023",
    accentColor: "#2dd4bf",
    tagColor: "bg-teal-900/60 text-teal-300 border-teal-700",
    questions: [
      { id: 1, category: "Sistema de Gestión FSA", question: "¿Ha implementado un sistema de gestión FSA que incluya políticas, procedimientos y responsabilidades definidas?", options: [{ value: 3, label: "Sí, sistema completo documentado e implementado" }, { value: 2, label: "Sistema parcial con documentación básica" }, { value: 1, label: "En proceso de desarrollo" }, { value: 0, label: "No existe sistema de gestión FSA" }] },
      { id: 2, category: "Autoevaluación FSA", question: "¿Ha completado el Cuestionario de Autoevaluación FSA y mantiene registros actualizados?", options: [{ value: 3, label: "Sí, completado anualmente con registros completos" }, { value: 2, label: "Completado pero con información incompleta" }, { value: 1, label: "Iniciado pero no completado" }, { value: 0, label: "No se ha realizado autoevaluación" }] },
      { id: 3, category: "Gestión de Suelos", question: "¿Implementa prácticas de conservación del suelo y mejora de la salud del suelo?", options: [{ value: 3, label: "Sí, con plan documentado y monitoreo regular" }, { value: 2, label: "Implementación parcial de prácticas" }, { value: 1, label: "Prácticas básicas sin documentación" }, { value: 0, label: "No se implementan prácticas de conservación" }] },
      { id: 4, category: "Gestión del Agua", question: "¿Cuenta con un plan de gestión del agua que incluya eficiencia en el uso y protección de fuentes?", options: [{ value: 3, label: "Sí, plan completo con medición y mejora continua" }, { value: 2, label: "Plan básico sin mediciones sistemáticas" }, { value: 1, label: "Prácticas informales sin plan" }, { value: 0, label: "No hay gestión del agua" }] },
      { id: 5, category: "Biodiversidad", question: "¿Ha identificado áreas de biodiversidad y toma medidas para protegerlas?", options: [{ value: 3, label: "Sí, identificadas y con plan de protección activo" }, { value: 2, label: "Identificadas parcialmente" }, { value: 1, label: "Consciente pero sin acciones concretas" }, { value: 0, label: "No se han identificado" }] },
      { id: 6, category: "Emisiones de GEI", question: "¿Monitorea y trabaja en la reducción de emisiones de gases de efecto invernadero?", options: [{ value: 3, label: "Sí, con mediciones y plan de reducción" }, { value: 2, label: "Monitoreo básico sin plan formal" }, { value: 1, label: "Consciente pero sin mediciones" }, { value: 0, label: "No se monitorean emisiones" }] },
      { id: 7, category: "Condiciones Laborales", question: "¿Garantiza condiciones de trabajo seguras, justas y dignas para todos los trabajadores?", options: [{ value: 3, label: "Sí, con políticas documentadas y verificables" }, { value: 2, label: "Cumplimiento básico de legislación" }, { value: 1, label: "Cumplimiento parcial" }, { value: 0, label: "No se puede demostrar cumplimiento" }] },
      { id: 8, category: "Plan de Mejora Continua", question: "¿Ha desarrollado un Plan de Mejora Continua (CIP) con metas específicas y medibles?", options: [{ value: 3, label: "Sí, plan completo con seguimiento regular" }, { value: 2, label: "Plan básico con algunas metas" }, { value: 1, label: "En desarrollo" }, { value: 0, label: "No existe plan de mejora" }] },
      { id: 9, category: "Capacitación", question: "¿Capacita regularmente al personal en prácticas sostenibles y requisitos FSA?", options: [{ value: 3, label: "Sí, programa formal de capacitación continua" }, { value: 2, label: "Capacitaciones ocasionales" }, { value: 1, label: "Capacitación informal" }, { value: 0, label: "No se realizan capacitaciones" }] },
      { id: 10, category: "Verificación Externa", question: "¿Está preparado para una auditoría de verificación FSA por un organismo aprobado?", options: [{ value: 3, label: "Sí, totalmente preparado con documentación completa" }, { value: 2, label: "Mayormente preparado, faltan algunos elementos" }, { value: 1, label: "En preparación, faltan varios elementos" }, { value: 0, label: "No está preparado para auditoría" }] },
    ],
  },
  {
    id: "globalgap",
    name: "GLOBALG.A.P.",
    description: "Buenas prácticas agrícolas globalmente certificadas",
    icon: "🌍",
    logo: "/logos/globalgap-logo.png",
    reference: "Versión: 2024",
    accentColor: "#3EB2ED",
    tagColor: "bg-blue-900/60 text-blue-300 border-blue-700",
    questions: [
      { id: 1, category: "Cumplimiento y Auditoría", question: "¿Conoce los requisitos y principios de GLOBALG.A.P.?", options: [{ value: 3, label: "Sí, conozco en detalle todos los requisitos y principios" }, { value: 2, label: "Conozco los requisitos generales" }, { value: 1, label: "Tengo conocimiento básico" }, { value: 0, label: "No conozco los requisitos" }] },
      { id: 2, category: "Trazabilidad", question: "¿Cuenta con un sistema de trazabilidad que permite rastrear el producto desde el origen hasta la venta?", options: [{ value: 3, label: "Sí, sistema completo con registros detallados" }, { value: 2, label: "Sistema básico con algunos registros" }, { value: 1, label: "Registros mínimos" }, { value: 0, label: "No hay sistema de trazabilidad" }] },
      { id: 3, category: "Historial y Gestión de Cultivos", question: "¿Mantiene registros completos del historial de los lotes (rotaciones, tratamientos, análisis de suelo)?", options: [{ value: 3, label: "Sí, registros completos y actualizados" }, { value: 2, label: "Registros parciales" }, { value: 1, label: "Registros básicos incompletos" }, { value: 0, label: "No se mantienen registros" }] },
      { id: 4, category: "Manejo Integrado de Plagas", question: "¿Implementa estrategias de Manejo Integrado de Plagas (MIP) con monitoreo y prevención?", options: [{ value: 3, label: "Sí, MIP completo con registros de monitoreo" }, { value: 2, label: "Algunas prácticas de MIP" }, { value: 1, label: "Uso principalmente de productos químicos" }, { value: 0, label: "No hay estrategia de MIP" }] },
      { id: 5, category: "Uso de Productos Fitosanitarios", question: "¿Utiliza solo productos autorizados y respeta los intervalos de seguridad?", options: [{ value: 3, label: "Sí, solo productos autorizados con registros completos" }, { value: 2, label: "Mayormente productos autorizados" }, { value: 1, label: "Control parcial de productos" }, { value: 0, label: "No se verifica autorización de productos" }] },
      { id: 6, category: "Análisis de Residuos", question: "¿Realiza análisis de residuos de productos fitosanitarios según los requisitos GLOBALG.A.P.?", options: [{ value: 3, label: "Sí, análisis regulares conforme a requisitos" }, { value: 2, label: "Análisis ocasionales" }, { value: 1, label: "Análisis muy esporádicos" }, { value: 0, label: "No se realizan análisis" }] },
      { id: 7, category: "Manejo del Agua", question: "¿Evalúa la calidad del agua de riego y toma medidas para prevenir contaminación?", options: [{ value: 3, label: "Sí, análisis regular con plan de gestión" }, { value: 2, label: "Evaluación básica del agua" }, { value: 1, label: "Consciente pero sin análisis" }, { value: 0, label: "No se evalúa calidad del agua" }] },
      { id: 8, category: "Higiene en Cosecha y Postcosecha", question: "¿Implementa protocolos de higiene durante la cosecha y manejo postcosecha?", options: [{ value: 3, label: "Sí, protocolos documentados y aplicados" }, { value: 2, label: "Prácticas básicas de higiene" }, { value: 1, label: "Prácticas informales" }, { value: 0, label: "No hay protocolos de higiene" }] },
      { id: 9, category: "Bienestar y Seguridad del Trabajador", question: "¿Garantiza la seguridad y salud ocupacional de los trabajadores con capacitaciones y EPP?", options: [{ value: 3, label: "Sí, programa completo con capacitaciones y EPP" }, { value: 2, label: "Provisión básica de EPP y capacitación" }, { value: 1, label: "Cumplimiento mínimo" }, { value: 0, label: "No se garantiza seguridad" }] },
      { id: 10, category: "Gestión de Residuos", question: "¿Tiene un plan de gestión de residuos agrícolas y envases de productos químicos?", options: [{ value: 3, label: "Sí, plan completo con disposición apropiada" }, { value: 2, label: "Gestión básica de residuos" }, { value: 1, label: "Gestión informal" }, { value: 0, label: "No hay gestión de residuos" }] },
    ],
  },
];

// ─── Power Automate Webhook (DO NOT MODIFY) ───────────────────────────────────
const WEBHOOK_URL =
  "https://default4fc2f3aa31c44dcbb719c6c16393e9.d3.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/fad40d171c7d4610902d643ea4281982/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=FFoxS_pam-UKoeNALltUyZ_oriQ2HAcDFlM0Zdbfj1Y";

async function sendToWebhook(data: {
  email: string; nombre: string; empresa: string; programa: string;
  puntaje: string; fecha: string; respuestas: string; contactPreference: string;
}) {
  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (e) {
    console.log("⚠️ Error al enviar a Power Automate:", e);
  }
}

// ─── Step types ────────────────────────────────────────────────────────────────
type Step = "landing" | "select" | "quiz" | "contact" | "analyzing" | "results";

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgramCard({ program, onSelect }: { program: Program; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="group bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 text-left hover:border-[#3EB2ED]/50 hover:bg-slate-800 transition-all duration-200 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="w-14 h-14 rounded-xl bg-slate-700/60 border border-slate-600/60 flex items-center justify-center overflow-hidden shrink-0">
          <img
            src={program.logo}
            alt={program.name}
            className="w-full h-full object-contain p-1.5"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = "none";
              const parent = img.parentElement!;
              parent.innerHTML = `<span class="text-2xl">${program.icon}</span>`;
            }}
          />
        </div>
        <span className="text-xs font-semibold text-slate-500 mt-1 text-right">{program.reference}</span>
      </div>
      <div>
        <h3 className="font-display text-base font-bold text-white group-hover:text-[#3EB2ED] transition-colors">
          {program.name}
        </h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{program.description}</p>
      </div>
      <div className="flex items-center gap-1.5 mt-auto">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${program.tagColor}`}>
          {program.questions.length} preguntas
        </span>
      </div>
    </button>
  );
}

function QuizQuestion({
  program, question, questionIndex, totalQuestions, selectedValue, onSelect, onBack,
}: {
  program: Program; question: Question; questionIndex: number; totalQuestions: number;
  selectedValue: number | undefined; onSelect: (v: number) => void; onBack: () => void;
}) {
  const progress = ((questionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-700/60 border border-slate-600/60 flex items-center justify-center overflow-hidden shrink-0">
          <img
            src={program.logo}
            alt={program.name}
            className="w-full h-full object-contain p-1"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = "none";
              if (img.parentElement) img.parentElement.innerHTML = `<span class="text-lg">${program.icon}</span>`;
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{program.name}</p>
          <p className="text-xs text-slate-600">Pregunta {questionIndex + 1} de {totalQuestions}</p>
        </div>
        <button onClick={onBack} className="text-xs text-slate-500 hover:text-[#3EB2ED] transition-colors">
          ← Cambiar programa
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: program.accentColor }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 mb-4">
        <span
          className="text-[10px] font-bold uppercase tracking-widest mb-3 block"
          style={{ color: program.accentColor }}
        >
          {question.category}
        </span>
        <h3 className="text-base font-semibold text-white leading-relaxed">{question.question}</h3>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {question.options.map((opt, i) => {
          const isSelected = selectedValue === opt.value;
          return (
            <button
              key={i}
              onClick={() => onSelect(opt.value)}
              className={`w-full text-left rounded-xl border px-4 py-3.5 transition-all duration-150 flex items-start gap-3 ${
                isSelected
                  ? "border-[#3EB2ED] bg-[#3EB2ED]/10 text-white"
                  : "border-slate-700/60 bg-slate-800/40 text-slate-300 hover:border-slate-500 hover:bg-slate-800"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  isSelected ? "border-[#3EB2ED] bg-[#3EB2ED]" : "border-slate-600"
                }`}
              >
                {isSelected && <span className="text-white text-[10px] font-bold">✓</span>}
              </div>
              <p className="text-sm leading-relaxed">{opt.label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ContactForm({
  onSubmit, onBack, programName, busy,
}: {
  onSubmit: (data: { email: string; name: string; company: string; contactPreference: string }) => void;
  onBack: () => void;
  programName: string;
  busy: boolean;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [contactPreference, setContactPreference] = useState("si");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!email || !email.includes("@")) { setError("Por favor ingresá un email válido."); return; }
    if (!name.trim()) { setError("Por favor ingresá tu nombre."); return; }
    if (!company.trim()) { setError("Por favor ingresá tu empresa."); return; }
    setError("");
    onSubmit({ email, name, company, contactPreference });
  }

  const inputClass =
    "w-full bg-slate-900/80 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#3EB2ED] transition";

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6">
        <div className="mb-5">
          <h3 className="font-display text-lg font-bold text-white mb-1">Antes de ver tus resultados</h3>
          <p className="text-sm text-slate-400">
            Dejanos tus datos para enviarte información relevante sobre certificación <span className="text-slate-200">{programName}</span>.
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5 text-sm text-red-400 flex items-center gap-2">
            <span>⚠</span> {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Email <span className="text-red-400">*</span>
            </label>
            <input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nombre</label>
            <input type="text" placeholder="Tu nombre" value={name} onChange={e => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Empresa / Razón Social</label>
            <input type="text" placeholder="Nombre de tu empresa" value={company} onChange={e => setCompany(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">¿Querés que te contactemos?</label>
            <div className="flex gap-4">
              {["si", "no"].map(v => (
                <label key={v} className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setContactPreference(v)}
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${contactPreference === v ? "border-[#3EB2ED] bg-[#3EB2ED]" : "border-slate-600"}`}
                  >
                    {contactPreference === v && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                  </div>
                  <span className="text-sm text-slate-300 capitalize">{v === "si" ? "Sí" : "No"}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={busy}
            className="w-full py-2.5 bg-[#3EB2ED] hover:bg-[#1a8fc7] disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {busy && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {busy ? "Procesando…" : "Ver mis resultados →"}
          </button>

          <button onClick={onBack} className="w-full text-xs text-slate-600 hover:text-slate-400 transition-colors py-1">
            ← Volver al quiz
          </button>
        </div>
      </div>
    </div>
  );
}

function Results({
  program, score, onRetake, onSelectOther,
}: {
  program: Program; score: number; onRetake: () => void; onSelectOther: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const rangeStart = Math.floor(score / 5) * 5;
  const rangeEnd = rangeStart + 5;

  let level: "ready" | "almost" | "needs-work";
  let levelConfig: { icon: string; title: string; message: string; borderColor: string; bgColor: string; barColor: string };

  if (score >= 85) {
    level = "ready";
    levelConfig = {
      icon: "✓",
      title: "Excelente — Estás preparado para la certificación",
      message: `Tu establecimiento demuestra un alto nivel de preparación para iniciar el proceso de certificación ${program.name}. Cumple con los requisitos principales y podés proceder con la solicitud de certificación inmediatamente.`,
      borderColor: "border-emerald-700/60",
      bgColor: "bg-emerald-900/20",
      barColor: "#4ade80",
    };
  } else if (score >= 65) {
    level = "almost";
    levelConfig = {
      icon: "⏱",
      title: "Buen camino — Algunos aspectos por fortalecer",
      message: `Tu establecimiento tiene una base sólida para la certificación ${program.name}. Identificamos algunas áreas que pueden fortalecerse para maximizar las posibilidades de éxito. Podés solicitar la certificación y trabajar en paralelo en los aspectos observados.`,
      borderColor: "border-amber-700/60",
      bgColor: "bg-amber-900/20",
      barColor: "#fb923c",
    };
  } else {
    level = "needs-work";
    levelConfig = {
      icon: "📋",
      title: "Oportunidad de mejora identificada",
      message: `Tu establecimiento presenta oportunidades de desarrollo en varios aspectos clave del estándar ${program.name}. Esta evaluación te permite conocer las áreas a trabajar. Igualmente podés solicitar la certificación cuando lo consideres conveniente — nuestro equipo está disponible para acompañarte.`,
      borderColor: "border-sky-700/60",
      bgColor: "bg-sky-900/20",
      barColor: "#3EB2ED",
    };
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 mb-4 overflow-hidden">
          <img
            src={program.logo}
            alt={program.name}
            className="w-full h-full object-contain p-2"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = "none";
              if (img.parentElement) img.parentElement.innerHTML = `<span class="text-2xl">${program.icon}</span>`;
            }}
          />
        </div>
        <h2 className="font-display text-2xl font-bold text-white mb-1">Resultados de tu evaluación</h2>
        <p className="text-sm text-slate-400">{program.name}</p>
      </div>

      {/* Score card */}
      <div className={`border ${levelConfig.borderColor} ${levelConfig.bgColor} rounded-2xl p-6 mb-4`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{levelConfig.icon}</span>
          <h3 className="font-display text-base font-bold text-white">{levelConfig.title}</h3>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-400">Nivel de preparación</span>
            <span className="text-sm font-bold text-white">{rangeStart}–{rangeEnd}%</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: visible ? `${score}%` : "0%", backgroundColor: levelConfig.barColor }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-600 mt-1">
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">{levelConfig.message}</p>
      </div>

      {/* Standard info */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl px-5 py-4 mb-6">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Información del estándar</p>
        <p className="text-sm text-slate-300 font-semibold">{program.name} · {program.reference}</p>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Para más información sobre los requisitos específicos de certificación, consultá la normativa vigente o contactá a Control Union.
        </p>
      </div>

      {/* CTAs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <a
          href="mailto:tpalacios@controlunion.com?subject=Consulta%20sobre%20Certificaci%C3%B3n"
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#3EB2ED] hover:bg-[#1a8fc7] text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <span>✉</span> Contactar por email
        </a>
        <a
          href="https://wa.me/5491176091484?text=Hola%2C%20quisiera%20informaci%C3%B3n%20sobre%20certificaci%C3%B3n"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <span>💬</span> Contactar por WhatsApp
        </a>
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={onRetake}
          className="flex-1 px-4 py-2.5 border border-slate-700 hover:border-[#3EB2ED] text-slate-400 hover:text-[#3EB2ED] text-sm font-medium rounded-xl transition-colors"
        >
          Repetir evaluación
        </button>
        <button
          onClick={onSelectOther}
          className="flex-1 px-4 py-2.5 border border-slate-700 hover:border-[#3EB2ED] text-slate-400 hover:text-[#3EB2ED] text-sm font-medium rounded-xl transition-colors"
        >
          Evaluar otro programa
        </button>
      </div>

      <p className="text-center text-[11px] text-slate-600 mt-5">
        Esta evaluación es orientativa y no constituye una auditoría oficial.
      </p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AutoEvaluacion() {
  const [step, setStep] = useState<Step>("landing");
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [contactBusy, setContactBusy] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  function startQuiz(program: Program) {
    setSelectedProgram(program);
    setAnswers({});
    setCurrentQuestion(0);
    setStep("quiz");
  }

  function handleAnswer(value: number) {
    const newAnswers = { ...answers, [currentQuestion]: value };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQuestion < (selectedProgram?.questions.length ?? 0) - 1) {
        setCurrentQuestion(q => q + 1);
      } else {
        setStep("contact");
      }
    }, 350);
  }

  async function handleContact(data: { email: string; name: string; company: string; contactPreference: string }) {
    setContactBusy(true);
    const program = selectedProgram!;
    const totalPossible = program.questions.length * 3;
    const totalScore = Object.values(answers).reduce((s, v) => s + v, 0);
    const score = Math.round((totalScore / totalPossible) * 100);
    setFinalScore(score);

    await sendToWebhook({
      email: data.email,
      nombre: data.name || "No proporcionado",
      empresa: data.company || "No proporcionada",
      programa: program.name,
      puntaje: score + "%",
      fecha: new Date().toLocaleString("es-AR"),
      respuestas: JSON.stringify(answers),
      contactPreference: data.contactPreference,
    });

    setContactBusy(false);
    setStep("analyzing");
    setTimeout(() => setStep("results"), 2000);
  }

  return (
    <Shell>
      {/* Landing */}
      {step === "landing" && (
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[#3EB2ED]">◈</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Auto-evaluación</span>
            </div>
            <h2 className="font-display text-3xl font-bold text-white mb-3 leading-tight">
              ¿Estás listo para tu próxima certificación?
            </h2>
            <p className="text-slate-400 text-base max-w-xl leading-relaxed">
              Descubrí tu nivel de preparación para obtener una certificación con{" "}
              <span className="text-slate-200 font-semibold">Control Union</span> respondiendo 10 preguntas clave.
              Al final, recibirás un resultado orientativo sobre qué aspectos fortalecer antes de la auditoría.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
            {[
              { n: "6", label: "Programas disponibles" },
              { n: "10", label: "Preguntas por evaluación" },
              { n: "~3 min", label: "Tiempo estimado" },
            ].map(stat => (
              <div key={stat.label} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-center">
                <p className="text-xl font-bold text-[#3EB2ED]">{stat.n}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep("select")}
            className="px-8 py-3 bg-[#3EB2ED] hover:bg-[#1a8fc7] text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Comenzar evaluación →
          </button>
        </div>
      )}

      {/* Select program */}
      {step === "select" && (
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="mb-8">
            <button onClick={() => setStep("landing")} className="text-xs text-slate-500 hover:text-[#3EB2ED] transition-colors mb-4 block">
              ← Volver
            </button>
            <h2 className="font-display text-2xl font-bold text-white mb-2">Seleccioná el programa</h2>
            <p className="text-slate-400 text-sm">Elegí la certificación para la cual querés evaluar tu nivel de preparación.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map(p => (
              <ProgramCard key={p.id} program={p} onSelect={() => startQuiz(p)} />
            ))}
          </div>
        </div>
      )}

      {/* Quiz */}
      {step === "quiz" && selectedProgram && (
        <QuizQuestion
          program={selectedProgram}
          question={selectedProgram.questions[currentQuestion]}
          questionIndex={currentQuestion}
          totalQuestions={selectedProgram.questions.length}
          selectedValue={answers[currentQuestion]}
          onSelect={handleAnswer}
          onBack={() => setStep("select")}
        />
      )}

      {/* Contact form */}
      {step === "contact" && selectedProgram && (
        <ContactForm
          programName={selectedProgram.name}
          onSubmit={handleContact}
          onBack={() => {
            setCurrentQuestion(selectedProgram.questions.length - 1);
            setStep("quiz");
          }}
          busy={contactBusy}
        />
      )}

      {/* Analyzing */}
      {step === "analyzing" && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-2 border-[#3EB2ED] border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-slate-300 text-base font-semibold">Analizando tus respuestas…</p>
          </div>
        </div>
      )}

      {/* Results */}
      {step === "results" && selectedProgram && (
        <Results
          program={selectedProgram}
          score={finalScore}
          onRetake={() => startQuiz(selectedProgram)}
          onSelectOther={() => setStep("select")}
        />
      )}
    </Shell>
  );
}
