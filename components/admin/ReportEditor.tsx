"use client";

import { useMemo, useState } from "react";
import { Node } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";

type ReportEditorInitial = {
  title: string;
  slug: string;
  location: string;
  year: string;
  summary: string;
  coverImage?: string | null;
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

const ReportFigure = Node.create({
  name: "reportFigure",
  group: "block",
  content: "image",
  defining: true,
  parseHTML() {
    return [{ tag: "figure.report-figure" }];
  },
  renderHTML() {
    return ["figure", { class: "report-figure" }, 0];
  },
});

const ReportGallery = Node.create({
  name: "reportGallery",
  group: "block",
  content: "image+",
  defining: true,
  parseHTML() {
    return [{ tag: "div.report-gallery" }];
  },
  renderHTML() {
    return ["div", { class: "report-gallery" }, 0];
  },
});

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
  const [coverImage, setCoverImage] = useState(initial.coverImage || "");
  const [body, setBody] = useState(initial.body);
  const [highlights, setHighlights] = useState(
    initial.highlights.join("\n")
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<string[]>([]);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({
        placeholder: "Schreibe deinen Bericht...",
      }),
      ReportFigure,
      ReportGallery,
    ],
    content: body,
    editorProps: {
      attributes: {
        class: "report-editor__content",
      },
    },
    onUpdate({ editor }) {
      setBody(editor.getHTML());
    },
  });

  const toolbarButtonClass = (active?: boolean) =>
    `rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition ${
      active
        ? "bg-[var(--color-forest)] text-white"
        : "text-[var(--color-muted)] hover:border-[var(--color-forest)]"
    }`;

  const safeSlug = useMemo(() => slugify(slug), [slug]);

  const buildFigure = (src: string) =>
    `<figure class="report-figure"><img src="${src}" alt="" loading="lazy" /></figure>`;

  const buildGallery = (sources: string[]) =>
    `<div class="report-gallery">${sources
      .map((src) => `<img src="${src}" alt="" loading="lazy" />`)
      .join("")}</div>`;

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
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
      if (editor) {
        if (payload.files.length === 1) {
          editor.commands.insertContent(buildFigure(payload.files[0]));
        } else {
          editor.commands.insertContent(buildGallery(payload.files));
        }
        editor.commands.focus();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Upload fehlgeschlagen.";
      setUploadError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleCoverUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!safeSlug) {
      setCoverError("Bitte zuerst einen gültigen Slug setzen.");
      return;
    }
    setCoverUploading(true);
    setCoverError(null);
    try {
      const formData = new FormData();
      formData.append("slug", safeSlug);
      Array.from(files).forEach((file) => formData.append("files", file));
      const response = await fetch("/api/admin/report-cover", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        file?: string;
        error?: string;
      };
      if (!response.ok || !payload.file) {
        throw new Error(payload.error || "upload_failed");
      }
      setCoverImage(payload.file);
      setUploaded((prev) => Array.from(new Set([payload.file!, ...prev])));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Upload fehlgeschlagen.";
      setCoverError(message);
    } finally {
      setCoverUploading(false);
    }
  };

  const handleLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Blog Editor</h2>
        <p className="text-sm text-[var(--color-muted)]">
          Nutze den Editor wie in Word: Tippen, markieren, formatieren.
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
            className="w-full form-input px-3 py-2"
          />
          <div className="flex gap-2">
            <input
              name="slug"
              required
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="slug"
              className="w-full form-input px-3 py-2"
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
            className="form-input px-3 py-2"
          />
          <input
            name="year"
            value={year}
            onChange={(event) => setYear(event.target.value)}
            placeholder="Jahr"
            className="form-input px-3 py-2"
          />
        </div>
        <textarea
          name="summary"
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          placeholder="Summary"
          className="w-full form-input px-3 py-2"
          rows={3}
        />

        <div className="space-y-3 rounded-xl border border-[var(--color-border)] bg-white p-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
              Kartenbild (Cover)
            </label>
            <input
              name="coverImage"
              value={coverImage}
              onChange={(event) => setCoverImage(event.target.value)}
              placeholder="/berichte/slug/cover.jpg"
              className="mt-2 w-full form-input px-3 py-2"
            />
          </div>
          {coverImage ? (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-stone)] p-3">
              <img
                src={coverImage}
                alt="Cover Vorschau"
                className="h-40 w-full rounded-lg object-cover"
              />
            </div>
          ) : null}
          <div
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-stone)] px-4 py-3 text-sm"
            onDragOver={(event) => {
              event.preventDefault();
            }}
            onDrop={(event) => {
              event.preventDefault();
              handleCoverUpload(event.dataTransfer.files);
            }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Cover hochladen
              </p>
              <p className="text-xs text-[var(--color-muted)]">
                Speichert unter /berichte/{safeSlug || "slug"}.
              </p>
            </div>
            <label className="rounded-full bg-[var(--color-forest)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              {coverUploading ? "Upload..." : "Datei wählen"}
              <input
                type="file"
                accept="image/*"
                disabled={coverUploading}
                onChange={(event) => {
                  handleCoverUpload(event.target.files);
                  event.currentTarget.value = "";
                }}
                className="hidden"
              />
            </label>
          </div>
          {coverError ? <p className="text-xs text-red-600">{coverError}</p> : null}
          {uploaded.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {uploaded.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setCoverImage(src)}
                  className={`overflow-hidden rounded-lg border ${
                    coverImage === src
                      ? "border-[var(--color-forest)] ring-2 ring-[var(--color-forest)]/30"
                      : "border-[var(--color-border)]"
                  }`}
                >
                  <img src={src} alt="" className="h-20 w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <input type="hidden" name="body" value={body} />

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={toolbarButtonClass(editor?.isActive("bold"))}
            >
              Fett
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={toolbarButtonClass(editor?.isActive("italic"))}
            >
              Kursiv
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              className={toolbarButtonClass(
                editor?.isActive("heading", { level: 2 })
              )}
            >
              Titel
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              className={toolbarButtonClass(
                editor?.isActive("heading", { level: 3 })
              )}
            >
              Untertitel
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={toolbarButtonClass(editor?.isActive("bulletList"))}
            >
              Liste
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={toolbarButtonClass(editor?.isActive("orderedList"))}
            >
              Nummeriert
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              className={toolbarButtonClass(editor?.isActive("blockquote"))}
            >
              Zitat
            </button>
            <button
              type="button"
              onClick={handleLink}
              className={toolbarButtonClass(editor?.isActive("link"))}
            >
              Link
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().unsetLink().run()}
              className={toolbarButtonClass()}
            >
              Link lösen
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().undo().run()}
              className={toolbarButtonClass()}
            >
              Rückgängig
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().redo().run()}
              className={toolbarButtonClass()}
            >
              Wiederholen
            </button>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-white p-3">
            <EditorContent editor={editor} className="report-editor" />
          </div>

          <div className="space-y-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-stone)] p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  Bilder hochladen
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  Speichert unter /berichte/{safeSlug || "slug"}.
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
                Eingefügt: {uploaded.join(", ")}
              </div>
            ) : null}
          </div>
        </div>

        <textarea
          name="highlights"
          value={highlights}
          onChange={(event) => setHighlights(event.target.value)}
          placeholder="Highlights (eine Zeile pro Punkt)"
          className="w-full form-input px-3 py-2"
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
