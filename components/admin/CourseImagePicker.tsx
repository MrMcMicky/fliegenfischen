"use client";

import { useMemo, useState } from "react";

type CourseImagePickerProps = {
  availableImages: string[];
  initialSrc?: string | null;
};

export function CourseImagePicker({
  availableImages,
  initialSrc,
}: CourseImagePickerProps) {
  const [imageSrc, setImageSrc] = useState(initialSrc || "");
  const [images, setImages] = useState(availableImages);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const gridImages = useMemo(() => {
    if (!imageSrc) return images;
    return Array.from(new Set([imageSrc, ...images]));
  }, [imageSrc, images]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("files", file));
      const response = await fetch("/api/admin/course-images", {
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
      setImages((prev) =>
        Array.from(new Set([...payload.files!, ...prev]))
      );
      if (payload.files.length > 0) {
        setImageSrc(payload.files[0]);
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
    <div className="space-y-3">
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
          Kursbild
        </label>
        <input
          name="imageSrc"
          value={imageSrc}
          onChange={(event) => setImageSrc(event.target.value)}
          placeholder="/illustrations/course-einhand-v2.png"
          className="w-full form-input px-3 py-2"
        />
        {imageSrc ? (
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-3">
            <img
              src={imageSrc}
              alt="Vorschau Kursbild"
              className="h-40 w-full rounded-lg object-cover"
            />
          </div>
        ) : null}
      </div>

      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-stone)] px-4 py-3 text-sm"
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          handleUpload(event.dataTransfer.files);
        }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Bild hochladen
          </p>
          <p className="text-xs text-[var(--color-muted)]">
            Ziehe ein Bild hierher oder wähle eine Datei aus.
          </p>
        </div>
        <label
          className={`rounded-full bg-[var(--color-forest)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition ${
            uploading
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer hover:bg-[var(--color-forest)]/90 hover:shadow-sm"
          }`}
        >
          {uploading ? "Upload..." : "Datei wählen"}
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
      {uploadError ? (
        <p className="text-xs text-red-600">{uploadError}</p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {gridImages.map((src) => (
          <button
            type="button"
            key={src}
            onClick={() => setImageSrc(src)}
            className={`overflow-hidden rounded-xl border transition ${
              imageSrc === src
                ? "border-[var(--color-forest)] ring-2 ring-[var(--color-forest)]/30"
                : "border-[var(--color-border)] hover:border-[var(--color-forest)]"
            }`}
          >
            <img
              src={src}
              alt=""
              className="h-24 w-full object-cover"
            />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
        <button
          type="button"
          onClick={() => setImageSrc("")}
          className="rounded-full border border-[var(--color-border)] px-3 py-1"
        >
          Bild entfernen
        </button>
      </div>
    </div>
  );
}
