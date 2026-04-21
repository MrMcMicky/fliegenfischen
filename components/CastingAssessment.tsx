"use client";

import { useMemo, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/Button";
import {
  castingAssessmentQuestions,
  evaluateCastingAssessment,
  type CastingAssessmentLevel,
} from "@/lib/casting-assessment";
import { dispatchBrowserAnalyticsEvent } from "@/lib/browser-analytics";

type SubmitState = "idle" | "saving" | "saved" | "error";

type SavedResult = {
  score: number;
  level: CastingAssessmentLevel;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CastingAssessment() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [contact, setContact] = useState({ name: "", email: "", phone: "", company: "" });
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [savedResult, setSavedResult] = useState<SavedResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const totalQuestions = castingAssessmentQuestions.length;
  const currentQuestion = castingAssessmentQuestions[step] ?? null;
  const isResultStep = step >= totalQuestions;
  const progress = Math.min(((step + 1) / (totalQuestions + 1)) * 100, 100);
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalQuestions;

  const result = useMemo(() => {
    if (!allAnswered) return null;
    try {
      return evaluateCastingAssessment(answers);
    } catch {
      return null;
    }
  }, [allAnswered, answers]);

  const selectAnswer = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const nextStep = () => {
    if (!currentQuestion || !answers[currentQuestion.id]) return;
    setStep((value) => Math.min(value + 1, totalQuestions));
  };

  const previousStep = () => {
    setStep((value) => Math.max(value - 1, 0));
  };

  const submitAssessment = () => {
    if (!result) {
      setSubmitState("error");
      setMessage("Bitte alle Fragen beantworten.");
      return;
    }

    const name = contact.name.trim();
    const email = contact.email.trim();
    if (!name || !email) {
      setSubmitState("error");
      setMessage("Bitte Name und E-Mail ausfüllen.");
      return;
    }
    if (!emailRegex.test(email)) {
      setSubmitState("error");
      setMessage("Bitte eine gültige E-Mail eingeben.");
      return;
    }

    setSubmitState("saving");
    setMessage("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/casting-assessment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            phone: contact.phone.trim(),
            company: contact.company.trim(),
            answerOptionIds: answers,
          }),
        });
        const payload = (await response.json().catch(() => null)) as
          | { ok?: boolean; score?: number; level?: CastingAssessmentLevel; error?: string }
          | null;

        if (!response.ok || !payload?.ok || typeof payload.score !== "number" || !payload.level) {
          throw new Error(payload?.error || "save_failed");
        }

        setSavedResult({ score: payload.score, level: payload.level });
        setSubmitState("saved");
        setMessage("Danke. Deine Einschätzung ist gespeichert und kann für die Beratung genutzt werden.");
        dispatchBrowserAnalyticsEvent({
          eventType: "casting_assessment_success",
          label: payload.level.title,
          path: "/#standortbestimmung",
          metadata: { score: payload.score, level: payload.level.key },
        });
      } catch {
        setSubmitState("error");
        setMessage("Speichern derzeit nicht möglich. Bitte versuche es später nochmals oder melde dich direkt per Telefon.");
      }
    });
  };

  const effectiveResult = savedResult ?? (result ? { score: result.score, level: result.level } : null);

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
      <div className="rounded-3xl bg-[var(--color-forest)] p-7 text-white shadow-[0_24px_70px_rgba(15,50,49,0.20)] lg:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/68">
          Standortbestimmung
        </p>
        <h2 className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-4xl">
          Wo stehst du im Fliegenwerfen?
        </h2>
        <p className="mt-4 text-sm leading-7 text-white/78 sm:text-base">
          In wenigen Fragen entsteht eine erste Einschätzung: Grundlagen, Kontrolle, Praxis oder Feinschliff. Das ersetzt keinen Unterricht, bereitet aber ein gezieltes Gespräch vor.
        </p>
        <div className="mt-7 grid gap-3 text-sm text-white/82">
          {[
            "Selbsteinschätzung in rund 2 Minuten",
            "Empfehlung für Kurs oder Privatlektion",
            "Antworten im Admin für die Beratung einsehbar",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white" />
              <span>{item}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border border-white/15 bg-white/8 p-4 text-sm text-white/76">
          Fachlich orientiert an internationalen Casting-Skills: Schlaufenbild, Rollwurf, Genauigkeit, Präsentation und Praxistransfer.
        </div>
      </div>

      <div className="rounded-3xl border border-[var(--color-border)] bg-white p-5 shadow-[0_18px_50px_rgba(15,50,49,0.10)] sm:p-7">
        <div className="flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
          <span>{isResultStep ? "Ergebnis" : `Frage ${step + 1} von ${totalQuestions}`}</span>
          <span>{answeredCount}/{totalQuestions}</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-stone)]">
          <div
            className="h-full rounded-full bg-[var(--color-ember)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {!isResultStep && currentQuestion ? (
          <div className="mt-7">
            <h3 className="font-display text-2xl font-semibold text-[var(--color-text)]">
              {currentQuestion.title}
            </h3>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{currentQuestion.help}</p>
            <div className="mt-6 grid gap-3">
              {currentQuestion.options.map((option) => {
                const active = answers[currentQuestion.id] === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => selectAnswer(currentQuestion.id, option.id)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                      active
                        ? "border-[var(--color-ember)] bg-[var(--color-ember)]/10 text-[var(--color-text)] shadow-sm"
                        : "border-[var(--color-border)] bg-white text-[var(--color-muted)] hover:border-[var(--color-forest)]/35 hover:bg-[var(--color-stone)]"
                    }`}
                  >
                    <span className="font-semibold">{option.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-7 flex items-center justify-between gap-3">
              <Button type="button" variant="secondary" onClick={previousStep} disabled={step === 0}>
                <ArrowLeft className="h-4 w-4" /> Zurück
              </Button>
              <Button type="button" onClick={nextStep} disabled={!answers[currentQuestion.id]}>
                Weiter <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-7">
            {effectiveResult ? (
              <div className="rounded-2xl bg-[var(--color-river-mist)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-forest)]/62">
                  {effectiveResult.score} von 24 Punkten
                </p>
                <h3 className="mt-3 font-display text-2xl font-semibold text-[var(--color-text)]">
                  {effectiveResult.level.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  {effectiveResult.level.summary}
                </p>
                <p className="mt-4 text-sm font-semibold text-[var(--color-forest)]">
                  {effectiveResult.level.recommendation}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {effectiveResult.level.focus.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--color-forest)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {submitState !== "saved" ? (
              <div className="mt-6 grid gap-4">
                <div className="hidden">
                  <label htmlFor="casting-company">Firma</label>
                  <input
                    id="casting-company"
                    value={contact.company}
                    onChange={(event) => setContact((prev) => ({ ...prev, company: event.target.value }))}
                    tabIndex={-1}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-semibold text-[var(--color-text)]">
                    Name
                    <input
                      value={contact.name}
                      onChange={(event) => setContact((prev) => ({ ...prev, name: event.target.value }))}
                      className="form-input w-full"
                      placeholder="Vorname Nachname"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-semibold text-[var(--color-text)]">
                    E-Mail
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(event) => setContact((prev) => ({ ...prev, email: event.target.value }))}
                      className="form-input w-full"
                      placeholder="name@email.ch"
                    />
                  </label>
                </div>
                <label className="space-y-2 text-sm font-semibold text-[var(--color-text)]">
                  Telefon optional
                  <input
                    value={contact.phone}
                    onChange={(event) => setContact((prev) => ({ ...prev, phone: event.target.value }))}
                    className="form-input w-full"
                    placeholder="Für Rückfragen"
                  />
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <Button type="button" onClick={submitAssessment} disabled={isPending || submitState === "saving"}>
                    {submitState === "saving" ? "Speichern..." : "Einschätzung speichern"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={previousStep}>
                    Antworten prüfen
                  </Button>
                </div>
              </div>
            ) : null}

            {message ? (
              <p
                className={`mt-4 text-sm ${
                  submitState === "saved" ? "text-emerald-700" : "text-orange-700"
                }`}
                aria-live="polite"
              >
                {message}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
