import type { FieldErrors, FieldValues } from "react-hook-form";
import { useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@monorepo/ui/components/alert";

interface FormErrorSummaryProps<TValues extends FieldValues> {
  errors: FieldErrors<TValues>;
  /** Only shown once at least this many fields are invalid (spec #153 §3.5, ux#109). */
  minErrors?: number;
}

/**
 * A focusable summary of every current field error, for a "form dài" — a
 * single wrong field still just shows its own inline `FieldError`.
 */
export function FormErrorSummary<TValues extends FieldValues>({
  errors,
  minErrors = 2,
}: FormErrorSummaryProps<TValues>) {
  const entries = Object.entries(errors)
    .map(([name, error]) =>
      error && typeof error.message === "string"
        ? { name, message: error.message }
        : undefined,
    )
    .filter((entry): entry is { name: string; message: string } => !!entry);
  const messages = entries.map((entry) => entry.message);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length >= minErrors) ref.current?.focus();
  }, [messages.length, minErrors]);

  if (messages.length < minErrors) return null;

  return (
    <Alert variant="destructive" ref={ref} tabIndex={-1} className="mb-7">
      <AlertCircle />
      <AlertTitle>Vui lòng kiểm tra lại {messages.length} lỗi</AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-4">
          {entries.map((entry) => (
            <li key={entry.name}>{entry.message}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
