"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, SessionType, CreateTrainingSessionRequest, UnauthorizedError } from "@/lib/api";
import { isFeatureEnabled, FeatureFlags } from "@/lib/featureFlags";
import { useAuth } from "@/lib/auth";

export default function NewSessionPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const featureEnabled = isFeatureEnabled(FeatureFlags.TRAINING_SESSION_MANAGEMENT);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;

    const request: CreateTrainingSessionRequest = {
      scheduledAt: new Date(`${date}T${time}`).toISOString(),
      durationMinutes: parseInt(formData.get("duration") as string, 10),
      type: parseInt(formData.get("type") as string, 10) as SessionType,
      notes: (formData.get("notes") as string) || null,
    };

    try {
      await api.createTrainingSession(request);
      router.push("/sessions");
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        logout();
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to create session");
      setIsSubmitting(false);
    }
  }

  if (!featureEnabled) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-zinc-500">This feature is not available.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <Link
          href="/sessions"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to sessions
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          New Training Session
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Time
              </label>
              <input
                type="time"
                id="time"
                name="time"
                required
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Duration (minutes)
              </label>
              <select
                id="duration"
                name="duration"
                defaultValue="60"
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
                <option value="120">120 minutes</option>
              </select>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Session Type
              </label>
              <select
                id="type"
                name="type"
                defaultValue="0"
                className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="0">Individual</option>
                <option value="1">Group</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="notes" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Focus areas, equipment needed, etc."
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/sessions"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isSubmitting ? "Creating..." : "Create Session"}
          </button>
        </div>
      </form>
    </div>
  );
}
