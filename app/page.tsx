"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type LinkType = {
  id: number;
  code: string;
  url: string;
  click_count: number;
  last_clicked: string | null;
  created_at: string;
};

export default function DashboardPage() {
  const [links, setLinks] = useState<LinkType[]>([]);
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  async function load() {
    try {
      setInitialLoading(true);
      const res = await fetch("/api/links");
      if (!res.ok) throw new Error("Failed to load links");
      const data = await res.json();
      setLinks(data.links);
    } catch (err: any) {
      setError(err.message ?? "Failed to load links");
    } finally {
      setInitialLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function isValidUrl(input: string) {
    try {
      new URL(input);
      return true;
    } catch {
      return false;
    }
  }

  async function createLink() {
    setError(null);
    setSuccess(null);

    if (!url.trim()) {
      setError("Please enter a URL.");
      return;
    }
    if (!isValidUrl(url.trim())) {
      setError("Please enter a valid URL (including https://).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim(), code: code.trim() || undefined }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error creating link");
        return;
      }

      setUrl("");
      setCode("");
      setSuccess("Link created successfully!");
      await load();
    } catch (err: any) {
      setError(err.message ?? "Error creating link");
    } finally {
      setLoading(false);
    }
  }

  async function deleteLink(c: string) {
    if (!confirm(`Delete link with code "${c}"?`)) return;

    try {
      const res = await fetch(`/api/links/${c}`, { method: "DELETE" });
      // Treat 204 (deleted) and 404 (already missing) as OK
      if (!res.ok && res.status !== 404 && res.status !== 204) {
        alert("Failed to delete link");
        return;
      }
      setLinks(prev => prev.filter(l => l.code !== c));
    } catch {
      alert("Error deleting link");
    }
  }

  async function copyShortUrl(code: string) {
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const shortUrl = `${origin}/${code}`;
      await navigator.clipboard.writeText(shortUrl);
      setSuccess("Short URL copied to clipboard!");
      setTimeout(() => setSuccess(null), 1500);
    } catch {
      setError("Failed to copy URL");
    }
  }

  const filteredLinks = links.filter((l) => {
    const q = filter.toLowerCase();
    return (
      l.code.toLowerCase().includes(q) ||
      l.url.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            URL Shortener
          </h1>
          <p className="text-sm text-slate-400">
            Create short links, track clicks, and view stats.
          </p>
        </header>

        {/* Create form card */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-100">
            Create a new short link
          </h2>
          <div className="grid gap-3 sm:grid-cols-[2fr,1fr,auto]">
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs text-slate-400">Long URL</label>
              <input
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400"
                value={url}
                placeholder="https://example.com/my/very/long/url"
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">
                Custom code (optional)
              </label>
              <input
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400"
                value={code}
                placeholder="A–Z, a–z, 0–9 (6–8 chars)"
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={createLink}
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:bg-indigo-900 text-sm font-medium transition-colors"
              >
                {loading ? "Creating…" : "Create"}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 mt-1">{error}</p>
          )}
          {success && (
            <p className="text-xs text-emerald-400 mt-1">{success}</p>
          )}
        </section>

        {/* Links table card */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 border-b border-slate-800">
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-slate-100">
                All links
              </h2>
              <p className="text-xs text-slate-500">
                {links.length === 0
                  ? "No links created yet."
                  : `${links.length} ${links.length === 1 ? "link" : "links"} total`}
              </p>
            </div>
            <div className="w-full sm:w-64">
              <input
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-400"
                placeholder="Filter by code or URL…"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>

          {initialLoading ? (
            <div className="px-4 py-6 text-sm text-slate-400">
              Loading links…
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-500">
              No links match your filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-slate-400 bg-slate-900 border-b border-slate-800">
                    <th className="px-4 py-2 text-left w-[160px]">
                      Short
                    </th>
                    <th className="px-4 py-2 text-left">
                      Target URL
                    </th>
                    <th className="px-4 py-2 text-right w-24">
                      Clicks
                    </th>
                    <th className="px-4 py-2 text-right w-40">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLinks.map((l) => (
                    <tr
                      key={l.id}
                      className="border-b border-slate-800 last:border-b-0 hover:bg-slate-900/70 transition-colors"
                    >
                      <td className="px-4 py-2 align-middle">
                        <div className="flex flex-col gap-1">
                          <Link
                            href={`/code/${l.code}`}
                            className="inline-flex items-center gap-1 font-mono text-xs text-indigo-300 hover:text-indigo-200"
                          >
                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/40">
                              {l.code}
                            </span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => copyShortUrl(l.code)}
                            className="self-start text-[10px] text-slate-400 hover:text-slate-200"
                          >
                            Copy short URL
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-2 align-middle max-w-xs">
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-xs text-slate-200 truncate"
                          title={l.url}
                        >
                          {l.url}
                        </a>
                      </td>
                      <td className="px-4 py-2 align-middle text-right">
                        <span className="inline-flex items-center justify-end font-mono text-xs px-2 py-1 rounded-full bg-slate-950 border border-slate-700">
                          {l.click_count}
                        </span>
                      </td>
                      <td className="px-4 py-2 align-middle text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/code/${l.code}`}
                            className="text-xs px-2 py-1 rounded-lg border border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-900"
                          >
                            Stats
                          </Link>
                          <button
                            type="button"
                            onClick={() => deleteLink(l.code)}
                            className="text-xs px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/60 text-red-300 hover:bg-red-500/20"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
