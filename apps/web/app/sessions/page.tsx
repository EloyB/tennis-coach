"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, TrainingSession, SessionType, SessionStatus, UnauthorizedError } from "@/lib/api";
import { isFeatureEnabled, FeatureFlags } from "@/lib/featureFlags";
import { useAuth } from "@/lib/auth";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSessionTypeLabel(type: SessionType): string {
  return type === SessionType.Individual ? "Individual" : "Group";
}

function getStatusBadge(status: SessionStatus): { label: string; className: string } {
  switch (status) {
    case SessionStatus.Scheduled:
      return { label: "Scheduled", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" };
    case SessionStatus.Completed:
      return { label: "Completed", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" };
    case SessionStatus.Cancelled:
      return { label: "Cancelled", className: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200" };
  }
}

export default function SessionsPage() {
  const { logout } = useAuth();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const featureEnabled = isFeatureEnabled(FeatureFlags.TRAINING_SESSION_MANAGEMENT);

  useEffect(() => {
    if (!featureEnabled) return;

    async function loadSessions() {
      try {
        const data = await api.getTrainingSessions();
        setSessions(data);
      } catch (err) {
        if (err instanceof UnauthorizedError) {
          logout();
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load sessions");
      } finally {
        setIsLoading(false);
      }
    }

    loadSessions();
  }, [featureEnabled, logout]);

  if (!featureEnabled) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-zinc-500">This feature is not available.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-zinc-500">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading sessions...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Training Sessions
        </h1>
        <Link
          href="/sessions/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New Session
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <svg className="h-6 w-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-zinc-900 dark:text-zinc-100">
            No sessions yet
          </h3>
          <p className="mb-6 text-zinc-500 dark:text-zinc-400">
            Create your first training session to get started.
          </p>
          <Link
            href="/sessions/new"
            className="inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Create Session
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const badge = getStatusBadge(session.status);
            return (
              <Link
                key={session.id}
                href={`/sessions/${session.id}`}
                className="block rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {formatDate(session.scheduledAt)}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                      <span>{getSessionTypeLabel(session.type)} session</span>
                      <span>{session.durationMinutes} min</span>
                    </div>
                    {session.notes && (
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 line-clamp-1">
                        {session.notes}
                      </p>
                    )}
                  </div>
                  <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
