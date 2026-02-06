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
    setStatus("saving");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        await saveField(path, value);
        savedRef.current = value;
        setStatus("saved");
      } catch (error) {
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
