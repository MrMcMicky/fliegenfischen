"use client";

import type { ElementType, FormEvent, KeyboardEvent, MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";

const saveField = async (path: string, value: string) => {
  const response = await fetch("/api/admin/landing-wysiwyg", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, value }),
  });
  if (!response.ok) {
    throw new Error("save_failed");
  }
};

const useAutosave = (path: string, value: string) => {
  const savedRef = useRef(value);
  const [status, setStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (value === savedRef.current) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus("saving");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        await saveField(path, value);
        savedRef.current = value;
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, 800);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [path, value]);

  useEffect(() => {
    if (status !== "saved") return;
    const timer = setTimeout(() => setStatus("idle"), 1500);
    return () => clearTimeout(timer);
  }, [status]);

  return status;
};

type EditableTextProps = {
  path: string;
  value: string;
  as?: ElementType;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
};

export function EditableText({
  path,
  value,
  as = "span",
  className = "",
  placeholder,
  multiline = false,
}: EditableTextProps) {
  const [text, setText] = useState(value || "");
  const status = useAutosave(path, text);
  const Tag = as;
  const multilineClass = multiline ? "whitespace-pre-line" : "";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setText(value || "");
  }, [value]);

  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      data-status={status}
      onInput={(event: FormEvent<HTMLElement>) => {
        setText(event.currentTarget.innerText);
      }}
      onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
        if (!multiline && event.key === "Enter") {
          event.preventDefault();
        }
      }}
      onClick={(event: MouseEvent<HTMLElement>) => {
        event.stopPropagation();
      }}
      className={`wysiwyg-editable ${multilineClass} ${className}`}
    >
      {text}
    </Tag>
  );
}

type EditableInputProps = {
  path: string;
  value: string;
  className?: string;
  placeholder?: string;
  type?: string;
};

export function EditableInput({
  path,
  value,
  className = "",
  placeholder,
  type = "text",
}: EditableInputProps) {
  const [text, setText] = useState(value || "");
  const status = useAutosave(path, text);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setText(value || "");
  }, [value]);

  return (
    <input
      type={type}
      value={text}
      onChange={(event) => setText(event.target.value)}
      placeholder={placeholder}
      data-status={status}
      className={`wysiwyg-input ${className}`}
    />
  );
}

type EditableImageProps = {
  path: string;
  value: string;
  label?: string;
  placeholder?: string;
};

export function EditableImage({
  path,
  value,
  label = "Bild",
  placeholder,
}: EditableImageProps) {
  const [src, setSrc] = useState(value || "");
  const status = useAutosave(path, src);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSrc(value || "");
  }, [value]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("files", file));
      const response = await fetch("/api/admin/landing-images", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        files?: string[];
        error?: string;
      };
      if (!response.ok || !payload.files?.length) {
        throw new Error(payload.error || "upload_failed");
      }
      setSrc(payload.files[0]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Upload fehlgeschlagen.";
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
          {label}
        </p>
        <span className="text-[10px] text-[var(--color-muted)]">
          {status === "saving"
            ? "Speichert…"
            : status === "saved"
              ? "Gespeichert"
              : status === "error"
                ? "Fehler"
                : "Bereit"}
        </span>
      </div>
      <p className="text-xs text-[var(--color-muted)]">
        Aktuelles Bild: {src || placeholder || "—"}
      </p>
      {src ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-3">
          <img
            src={src}
            alt="Vorschau"
            className="h-40 w-full rounded-lg object-cover"
          />
        </div>
      ) : null}
      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-stone)] px-4 py-3 text-xs"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          handleUpload(event.dataTransfer.files);
        }}
      >
        <span className="text-[var(--color-muted)]">
          Bild hierher ziehen oder Datei wählen.
        </span>
        <label
          className={`rounded-full bg-[var(--color-forest)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition ${
            uploading
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer hover:bg-[var(--color-forest)]/90 hover:shadow-sm"
          }`}
        >
          {uploading ? "Upload…" : "Datei wählen"}
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(event) => {
              handleUpload(event.target.files);
              event.currentTarget.value = "";
            }}
            className="hidden"
          />
        </label>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
