export type CastingAssessmentOption = {
  id: string;
  label: string;
  score: number;
};

export type CastingAssessmentQuestion = {
  id: string;
  title: string;
  help: string;
  options: CastingAssessmentOption[];
};

export type CastingAssessmentAnswer = {
  questionId: string;
  question: string;
  optionId: string;
  answer: string;
  score: number;
};

export type CastingAssessmentLevel = {
  key: string;
  title: string;
  min: number;
  max: number;
  summary: string;
  recommendation: string;
  focus: string[];
};

export const castingAssessmentQuestions: CastingAssessmentQuestion[] = [
  {
    id: "experience",
    title: "Wie oft hast du bisher mit der Fliegenrute geworfen?",
    help: "Es geht um reale Wurfpraxis, nicht um Fischerfahrung allgemein.",
    options: [
      { id: "none", label: "Noch nie oder nur sehr kurz", score: 0 },
      { id: "some", label: "Einige Male, aber ohne Routine", score: 1 },
      { id: "regular", label: "Regelmässig in Kursen oder am Wasser", score: 2 },
      { id: "trained", label: "Seit mehreren Saisons bewusst trainiert", score: 3 },
    ],
  },
  {
    id: "overhead",
    title: "Wie sicher ist dein Überkopfwurf auf 8-12 Meter?",
    help: "Achte auf Schlaufenbild, Timing und ob das Vorfach sauber streckt.",
    options: [
      { id: "unknown", label: "Noch unsicher oder nicht bekannt", score: 0 },
      { id: "unstable", label: "Schnur liegt oft unruhig oder fällt zusammen", score: 1 },
      { id: "mostly", label: "Meist kontrolliert, aber nicht immer gestreckt", score: 2 },
      { id: "repeatable", label: "Wiederholbar mit gestrecktem Vorfach", score: 3 },
    ],
  },
  {
    id: "roll_cast",
    title: "Wie gut funktioniert dein Rollwurf?",
    help: "Der Rollwurf zeigt gut, ob D-Loop, Ankerpunkt und Beschleunigung zusammenpassen.",
    options: [
      { id: "not_practiced", label: "Noch nicht geübt", score: 0 },
      { id: "sometimes", label: "Geht nur gelegentlich", score: 1 },
      { id: "short", label: "Funktioniert auf kurze Distanz", score: 2 },
      { id: "controlled", label: "Kontrolliert mit sauberem D-Loop und Zielrichtung", score: 3 },
    ],
  },
  {
    id: "accuracy",
    title: "Wie genau triffst du Ziele auf 8-12 Meter?",
    help: "Gemeint ist wiederholbare Genauigkeit, nicht ein einzelner Glückstreffer.",
    options: [
      { id: "rarely", label: "Zufällig oder selten", score: 0 },
      { id: "direction", label: "Ungefähr in die Richtung", score: 1 },
      { id: "near", label: "Mehrere Würfe landen in der Nähe", score: 2 },
      { id: "tight", label: "Wiederholbar in einem engen Zielbereich", score: 3 },
    ],
  },
  {
    id: "conditions",
    title: "Wie gehst du mit Wind oder beengtem Ufer um?",
    help: "Praxis am Wasser verlangt oft Anpassungen bei Winkel, Wurfebene oder Technik.",
    options: [
      { id: "stop", label: "Ich breche meist ab", score: 0 },
      { id: "lose_control", label: "Ich versuche es, verliere aber Kontrolle", score: 1 },
      { id: "some_adjustments", label: "Ich kenne einzelne Anpassungen", score: 2 },
      { id: "adaptive", label: "Ich kann Wurfebene, Winkel oder Technik bewusst anpassen", score: 3 },
    ],
  },
  {
    id: "diagnostics",
    title: "Kannst du typische Fehler selbst erkennen?",
    help: "Zum Beispiel zu frühe Kraft, offene Schlaufen, Tailing Loops oder schlechtes Timing.",
    options: [
      { id: "no", label: "Nein, ich merke nur dass es nicht klappt", score: 0 },
      { id: "partly", label: "Teilweise, aber ohne klare Korrektur", score: 1 },
      { id: "often", label: "Ich erkenne Timing- oder Schlaufenprobleme oft", score: 2 },
      { id: "correct", label: "Ich kann Ursache und Korrektur meist benennen", score: 3 },
    ],
  },
  {
    id: "goal",
    title: "Was ist aktuell dein Hauptziel?",
    help: "Die Antwort hilft, die Empfehlung stärker auf Kurs oder Coaching auszurichten.",
    options: [
      { id: "basics", label: "Grundlagen sauber lernen", score: 0 },
      { id: "control", label: "Mehr Kontrolle und weniger Kraftaufwand", score: 1 },
      { id: "presentation", label: "Genauigkeit, Präsentation und Praxis verbessern", score: 2 },
      { id: "advanced", label: "Feinschliff, Distanz, Spezialwürfe oder Prüfungsvorbereitung", score: 3 },
    ],
  },
  {
    id: "pace",
    title: "Wie schnell möchtest du Fortschritt sehen?",
    help: "Das beeinflusst, ob ein Kurs, ein Standorttermin oder ein Trainingsplan besser passt.",
    options: [
      { id: "orientation", label: "Erst einmal unverbindlich einschätzen", score: 0 },
      { id: "weeks", label: "In den nächsten Wochen gezielt üben", score: 1 },
      { id: "plan", label: "Ich möchte einen klaren Trainingsplan", score: 2 },
      { id: "intensive", label: "Ich will intensiv und mit direktem Feedback arbeiten", score: 3 },
    ],
  },
];

export const castingAssessmentLevels: CastingAssessmentLevel[] = [
  {
    key: "basics",
    title: "Grundlagen aufbauen",
    min: 0,
    max: 6,
    summary: "Du profitierst am meisten von sauberem Aufbau statt Einzelkorrekturen.",
    recommendation:
      "Einsteigerkurs oder Schnupperstunde. Fokus auf Sicherheit, Material, Grundwurf und erste kontrollierte Präsentation.",
    focus: ["Grundwurf", "Materialgefühl", "Timing", "erste Präsentation"],
  },
  {
    key: "control",
    title: "Kontrolle stabilisieren",
    min: 7,
    max: 13,
    summary: "Die Basis ist da, aber Timing, Schlaufenbild und Wiederholbarkeit brauchen Struktur.",
    recommendation:
      "Standortbestimmung oder Privatlektion mit Direktfeedback. Fokus auf Timing, Schlaufenbild, Rollwurf und Genauigkeit.",
    focus: ["Schlaufenbild", "Rollwurf", "Genauigkeit", "Fehlerkorrektur"],
  },
  {
    key: "practice",
    title: "Praxis gezielt verbessern",
    min: 14,
    max: 19,
    summary: "Du kannst werfen, willst die Technik aber robuster ans Wasser bringen.",
    recommendation:
      "2-3 Stunden Privatlektion oder Kleingruppen-Coaching. Fokus auf Präsentation, Wind, Mending und wechselnde Distanzen.",
    focus: ["Präsentation", "Wind", "Mending", "Gewässersituationen"],
  },
  {
    key: "advanced",
    title: "Feinschliff & Spezialthemen",
    min: 20,
    max: 24,
    summary: "Du suchst gezielte Diagnostik und Feinarbeit an konkreten Situationen.",
    recommendation:
      "Individuelles Coaching. Fokus auf Diagnostik, Spezialwürfe, Distanzkontrolle oder Prüfungs-/Instruktorvorbereitung.",
    focus: ["Spezialwürfe", "Distanzkontrolle", "Diagnostik", "Prüfungsvorbereitung"],
  },
];

export const getCastingAssessmentLevel = (score: number) =>
  castingAssessmentLevels.find((level) => score >= level.min && score <= level.max) ??
  castingAssessmentLevels[0];

export const evaluateCastingAssessment = (
  answerOptionIds: Record<string, string>
) => {
  const answers = castingAssessmentQuestions.map((question) => {
    const optionId = answerOptionIds[question.id];
    const option = question.options.find((item) => item.id === optionId);

    if (!option) {
      throw new Error(`missing_answer:${question.id}`);
    }

    return {
      questionId: question.id,
      question: question.title,
      optionId: option.id,
      answer: option.label,
      score: option.score,
    } satisfies CastingAssessmentAnswer;
  });

  const score = answers.reduce((sum, answer) => sum + answer.score, 0);
  const level = getCastingAssessmentLevel(score);

  return { answers, score, level };
};
