"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Users, Monitor } from "lucide-react";

import type { PublicUser } from "@/lib/auth/users";

export const AdminUserMenu: React.FC<{ user: PublicUser }> = ({ user }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const signOut = async () => {
    setSigningOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  const initials = (user.name || user.email)
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-slate-100"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-[11px] font-black text-white">
          {initials}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1.5 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          <div className="border-b border-slate-100 px-3.5 py-2.5">
            <p className="truncate text-[13px] font-bold text-slate-800">{user.name}</p>
            <p className="truncate text-[11px] text-slate-400">{user.email}</p>
            <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {user.role}
            </span>
          </div>

          {user.role === "admin" && (
            <>
              <Link
                href="/admin/users"
                className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                <Users className="h-3.5 w-3.5" />
                Manage users
              </Link>
              <Link
                href="/admin/redirects"
                className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                <Monitor className="h-3.5 w-3.5" />
                Redirects
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <LogOut className="h-3.5 w-3.5" />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
};
