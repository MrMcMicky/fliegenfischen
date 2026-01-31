"use client";

import { useRef, useState } from "react";

type ReportEditorInitial = {
  title: string;
  slug: string;
  location: string;
  year: string;
  summary: string;
  body: string;
  highlights: string[];
};

type ReportEditorProps = {
  initial: ReportEditorInitial;
  action: (formData: FormData) => void | Promise<void>;
  deleteAction?: (formData: FormData) => void | Promise<void>;
  submitLabel?: string;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

export function ReportEditor({
  initial,
  action,
  deleteAction,
  submitLabel = "Speichern",
}: ReportEditorProps) {
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [location, setLocation] = useState(initial.location);
  const [year, setYear] = useState(initial.year);
  const [summary, setSummary] = useState(initial.summary);
  const [body, setBody] = useState(initial.body);
  const [highlights, setHighlights] = useState(
    initial.highlights.join("\n")
  );
  const [tab, setTab] = useState<"editor" | "preview">("editor");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<string[]>([]);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  const insertAtCursor = (snippet: string) => {
    const textarea = bodyRef.current;
    if (!textarea) {
      setBody((prev) => `${prev}\n${snippet}`.trim());
      return;
    }
    const start = textarea.selectionStart ?? body.length;
    const end = textarea.selectionEnd ?? body.length;
    const next = `${body.slice(0, start)}${snippet}${body.slice(end)}`;
    setBody(next);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + snippet.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const wrapSelection = (before: string, after: string) => {
    const textarea = bodyRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? body.length;
    const end = textarea.selectionEnd ?? body.length;
    const selected = body.slice(start, end) || "Text";
    const next = `${body.slice(0, start)}${before}${selected}${after}${body.slice(
      end
    )}`;
    setBody(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selected.length
      );
    });
  };

  const buildFigure = (src: string) =>
    `<figure class="report-figure"><img src="${src}" alt="" loading="lazy" /></figure>`;

  const buildGallery = (sources: string[]) =>
    `<div class="report-gallery">${sources
      .map(
        (src) => `<img src="${src}" alt="" loading="lazy" />`
      )
      .join("")}</div>`;

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const safeSlug = slugify(slug);
    if (!safeSlug) {
      setUploadError("Bitte zuerst einen gültigen Slug setzen.");
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("slug", safeSlug);
      Array.from(files).forEach((file) => formData.append("files", file));
      const response = await fetch("/api/admin/report-images", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        files?: string[];
        error?: string;
      };
      if (!response.ok || !payload.files) {
        throw new Error(payload.error || "upload_failed");
      }
      setUploaded(payload.files);
      if (payload.files.length === 1) {
        insertAtCursor(buildFigure(payload.files[0]));
      } else {
        insertAtCursor(buildGallery(payload.files));
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Upload fehlgeschlagen.";
      setUploadError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Blog Editor</h2>
        <p className="text-sm text-[var(--color-muted)]">
          Inhalte sind HTML. Nutze die Buttons oder lade Bilder hoch, um schnell
          einen Beitrag zu bauen.
        </p>
      </div>
      <form action={action} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <input
            name="title"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Titel"
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
          />
          <div className="flex gap-2">
            <input
              name="slug"
              required
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="slug"
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
            />
            <button
              type="button"
              onClick={() => setSlug(slugify(title))}
              className="rounded-lg border border-[var(--color-border)] px-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]"
            >
              Slug
            </button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <input
            name="location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Ort"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2"
          />
          <input
            name="year"
            value={year}
            onChange={(event) => setYear(event.target.value)}
            placeholder="Jahr"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2"
          />
        </div>
        <textarea
          name="summary"
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          placeholder="Summary"
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
          rows={3}
        />

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
            <button
              type="button"
              onClick={() => insertAtCursor("<h2>Zwischentitel</h2>")}
              className="rounded-full border border-[var(--color-border)] px-3 py-2"
            >
              Titel
            </button>
            <button
              type="button"
              onClick={() => insertAtCursor("<p>Neuer Absatz.</p>")}
              className="rounded-full border border-[var(--color-border)] px-3 py-2"
            >
              Absatz
            </button>
            <button
              type="button"
              onClick={() =>
                insertAtCursor(buildFigure(`/berichte/${slugify(slug)}/bild.jpg`))
              }
              className="rounded-full border border-[var(--color-border)] px-3 py-2"
            >
              Bild
            </button>
            <button
              type="button"
              onClick={() =>
                insertAtCursor(
                  buildGallery([
                    `/berichte/${slugify(slug)}/bild-1.jpg`,
                    `/berichte/${slugify(slug)}/bild-2.jpg`,
                  ])
                )
              }
              className="rounded-full border border-[var(--color-border)] px-3 py-2"
            >
              Galerie
            </button>
            <button
              type="button"
              onClick={() => insertAtCursor('<a href="https://">Link</a>')}
              className="rounded-full border border-[var(--color-border)] px-3 py-2"
            >
              Link
            </button>
            <button
              type="button"
              onClick={() => wrapSelection("<strong>", "</strong>")}
              className="rounded-full border border-[var(--color-border)] px-3 py-2"
            >
              Fett
            </button>
            <button
              type="button"
              onClick={() => wrapSelection("<em>", "</em>")}
              className="rounded-full border border-[var(--color-border)] px-3 py-2"
            >
              Kursiv
            </button>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-white">
            <div className="flex gap-2 border-b border-[var(--color-border)] p-2 text-xs font-semibold uppercase tracking-[0.2em]">
              <button
                type="button"
                onClick={() => setTab("editor")}
                className={`rounded-full px-3 py-1 ${
                  tab === "editor"
                    ? "bg-[var(--color-forest)] text-white"
                    : "text-[var(--color-muted)]"
                }`}
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => setTab("preview")}
                className={`rounded-full px-3 py-1 ${
                  tab === "preview"
                    ? "bg-[var(--color-forest)] text-white"
                    : "text-[var(--color-muted)]"
                }`}
              >
                Vorschau
              </button>
            </div>
            <div className="p-4">
              <textarea
                ref={bodyRef}
                name="body"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Inhalt"
                className={`w-full resize-y rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm ${
                  tab === "editor" ? "block" : "hidden"
                }`}
                rows={16}
              />
              {tab === "preview" ? (
                <div
                  className="report-content"
                  dangerouslySetInnerHTML={{ __html: body }}
                />
              ) : null}
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-stone)] p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  Bilder hochladen
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  Speichert unter /berichte/{slugify(slug) || "slug"}.
                </p>
              </div>
              <label className="rounded-full bg-[var(--color-forest)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                {uploading ? "Upload..." : "Dateien wählen"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploading}
                  onChange={(event) => {
                    handleUpload(event.target.files);
                    event.currentTarget.value = "";
                  }}
                  className="hidden"
                />
              </label>
            </div>
            {uploadError ? (
              <p className="text-xs text-red-600">{uploadError}</p>
            ) : null}
            {uploaded.length > 0 ? (
              <div className="text-xs text-[var(--color-muted)]">
                Hochgeladen: {uploaded.join(", ")}
              </div>
            ) : null}
          </div>
        </div>

        <textarea
          name="highlights"
          value={highlights}
          onChange={(event) => setHighlights(event.target.value)}
          placeholder="Highlights (eine Zeile pro Punkt)"
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
          rows={4}
        />
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full bg-[var(--color-forest)] px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
          >
            {submitLabel}
          </button>
          {deleteAction ? (
            <button
              formAction={deleteAction}
              className="rounded-full border border-red-300 px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-600"
            >
              Löschen
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
