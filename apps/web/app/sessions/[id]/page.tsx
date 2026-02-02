"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, TrainingSession, SessionType, SessionStatus, UnauthorizedError } from "@/lib/api";
import { isFeatureEnabled, FeatureFlags } from "@/lib/featureFlags";
import { useAuth } from "@/lib/auth";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("en-US", {
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

export default function SessionDetailPage() {
  const params = useParams();
  const { logout } = useAuth();
  const id = params.id as string;

  const [session, setSession] = useState<TrainingSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActioning, setIsActioning] = useState(false);

  const featureEnabled = isFeatureEnabled(FeatureFlags.TRAINING_SESSION_MANAGEMENT);

  useEffect(() => {
    if (!featureEnabled) return;

    async function loadSession() {
      try {
        const data = await api.getTrainingSession(id);
        setSession(data);
      } catch (err) {
        if (err instanceof UnauthorizedError) {
          logout();
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load session");
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();
  }, [id, featureEnabled, logout]);

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this session?")) return;

    setIsActioning(true);
    try {
      const updated = await api.cancelTrainingSession(id);
      setSession(updated);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        logout();
        return;
      }
      alert(err instanceof Error ? err.message : "Failed to cancel session");
    } finally {
      setIsActioning(false);
    }
  }

  async function handleComplete() {
    setIsActioning(true);
    try {
      const updated = await api.completeTrainingSession(id);
      setSession(updated);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        logout();
        return;
      }
      alert(err instanceof Error ? err.message : "Failed to complete session");
    } finally {
      setIsActioning(false);
    }
  }

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
          Loading session...
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error || "Session not found"}</p>
          <Link
            href="/sessions"
            className="mt-4 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Back to sessions
          </Link>
        </div>
      </div>
    );
  }

  const badge = getStatusBadge(session.status);
  const canEdit = session.status === SessionStatus.Scheduled;
  const canComplete = session.status === SessionStatus.Scheduled;
  const canCancel = session.status === SessionStatus.Scheduled;

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
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 p-6 dark:border-zinc-800">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  {getSessionTypeLabel(session.type)} Session
                </h1>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
                  {badge.label}
                </span>
              </div>
              <p className="mt-1 text-zinc-500 dark:text-zinc-400">
                {formatDate(session.scheduledAt)} at {formatTime(session.scheduledAt)}
              </p>
            </div>
            {canEdit && (
              <Link
                href={`/sessions/${session.id}/edit`}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Edit
              </Link>
            )}
          </div>
        </div>

        <div className="p-6">
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Duration</dt>
              <dd className="mt-1 text-zinc-900 dark:text-zinc-100">{session.durationMinutes} minutes</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Type</dt>
              <dd className="mt-1 text-zinc-900 dark:text-zinc-100">{getSessionTypeLabel(session.type)}</dd>
            </div>

            {session.notes && (
              <div>
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Notes</dt>
                <dd className="mt-1 whitespace-pre-wrap text-zinc-900 dark:text-zinc-100">{session.notes}</dd>
              </div>
            )}

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Created</dt>
              <dd className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                {new Date(session.createdAt).toLocaleString()}
              </dd>
            </div>

            {session.updatedAt && (
              <div>
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Last updated</dt>
                <dd className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  {new Date(session.updatedAt).toLocaleString()}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {(canComplete || canCancel) && (
          <div className="flex gap-3 border-t border-zinc-200 p-6 dark:border-zinc-800">
            {canComplete && (
              <button
                onClick={handleComplete}
                disabled={isActioning}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {isActioning ? "..." : "Mark Completed"}
              </button>
            )}
            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={isActioning}
                className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-900/20"
              >
                {isActioning ? "..." : "Cancel Session"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
