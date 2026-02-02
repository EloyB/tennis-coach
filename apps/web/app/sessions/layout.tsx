"use client";

import { RequireAuth, useAuth } from "@/lib/auth";
import Link from "next/link";

function Header() {
  const { coach, logout } = useAuth();

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/sessions" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Tennis Coach
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {coach?.name}
          </span>
          <button
            onClick={logout}
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}

export default function SessionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Header />
        {children}
      </div>
    </RequireAuth>
  );
}
