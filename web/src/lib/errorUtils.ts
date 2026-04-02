import { AxiosError } from "axios";

type ApiErrorBody = { error?: string; errors?: string[] };

/**
 * Extracts the most useful human-readable message from an API error.
 * Handles: AxiosError with Rails error/errors body, network errors, and unknowns.
 */
export function extractErrorMessage(err: unknown, fallback = "Something went wrong."): string {
  const axErr = err as AxiosError<ApiErrorBody>;
  const data = axErr?.response?.data;
  if (data?.errors?.length) return data.errors.join(", ");
  if (data?.error) return data.error;
  if (axErr?.message && axErr.message !== "Network Error") return axErr.message;
  if (axErr?.message === "Network Error") return "Unable to reach the server. Check your connection.";
  return fallback;
}

/**
 * Returns the HTTP status code from an axios error, or undefined.
 */
export function errorStatus(err: unknown): number | undefined {
  return (err as AxiosError)?.response?.status;
}
