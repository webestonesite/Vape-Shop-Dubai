"use client";

import React, { useState } from "react";
import { Trash2, Plus, ArrowRight, Save, Loader2, Link as LinkIcon } from "lucide-react";
import type { Redirect } from "@/lib/redirects/store";

interface Props {
  initialRedirects: Redirect[];
}

export const RedirectsManager: React.FC<Props> = ({ initialRedirects }) => {
  const [redirects, setRedirects] = useState<Redirect[]>(initialRedirects);
  const [isSaving, setIsSaving] = useState(false);
  const [newSource, setNewSource] = useState("");
  const [newDestination, setNewDestination] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newSource.trim() || !newDestination.trim()) {
      setError("Both Source and Destination paths are required.");
      return;
    }
    
    // Auto-prefix with / if missing (unless it's an absolute URL)
    let source = newSource.trim();
    if (!source.startsWith("/") && !source.startsWith("http")) source = "/" + source;
    
    let dest = newDestination.trim();
    if (!dest.startsWith("/") && !dest.startsWith("http")) dest = "/" + dest;

    setRedirects([
      ...redirects,
      {
        id: crypto.randomUUID(),
        source,
        destination: dest,
      },
    ]);
    setNewSource("");
    setNewDestination("");
    setError(null);
  };

  const handleDelete = (id: string) => {
    setRedirects(redirects.filter((r) => r.id !== id));
    setError(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/redirects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redirects }),
      });
      if (!res.ok) throw new Error("Failed to save redirects.");
      
      setSuccess("Redirects saved successfully.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Add New Redirect</h2>
        
        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        {success && <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-600">{success}</div>}
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-semibold text-slate-700">Old Path (Source)</label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                placeholder="/old-page"
                className="w-full rounded-lg border-slate-200 pl-10 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
          </div>
          
          <div className="hidden sm:flex mb-2 items-center justify-center">
            <ArrowRight className="h-5 w-5 text-slate-300" />
          </div>

          <div className="flex-1 space-y-2">
            <label className="text-sm font-semibold text-slate-700">New Path (Destination)</label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={newDestination}
                onChange={(e) => setNewDestination(e.target.value)}
                placeholder="/new-page"
                className="w-full rounded-lg border-slate-200 pl-10 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 font-bold text-white transition-colors hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-800">Active Redirects</h2>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 font-bold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {redirects.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No redirects active. Add one above.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {redirects.map((r) => (
              <li key={r.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                <div className="flex flex-1 items-center gap-4">
                  <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center">
                    <code className="rounded bg-slate-100 px-2 py-1 text-sm text-slate-700">{r.source}</code>
                    <ArrowRight className="hidden h-4 w-4 text-slate-300 sm:block" />
                    <code className="rounded bg-emerald-50 px-2 py-1 text-sm text-emerald-700">{r.destination}</code>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="ml-4 rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  title="Remove Redirect"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
