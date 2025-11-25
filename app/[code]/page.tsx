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

export default function CodeStatsPage({ params }: { params: { code: string } }) {
  const { code } = params;

  const [link, setLink] = useState<LinkType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/links/${code}`);
      if (!res.ok) return setLink(null);
      const data = await res.json();
      setLink(data.link);
      setLoading(false);
    }
    load();
  }, [code]);

  if (loading) return <p className="p-4">Loading…</p>;
  if (!link) return <p className="p-4 text-red-400">Not found</p>;

  return (
    <div className="p-4 space-y-4">
      <Link href="/" className="text-sm text-slate-300 underline">
        ← Back
      </Link>

      <h1 className="text-xl font-semibold">Stats for {link.code}</h1>

      <div className="space-y-2 text-sm">
        <div><b>Short URL:</b> {typeof window !== "undefined" ? `${window.location.origin}/${link.code}` : ""}</div>
        <div><b>Target URL:</b> {link.url}</div>
        <div><b>Total Clicks:</b> {link.click_count}</div>
        <div><b>Last Clicked:</b> {link.last_clicked ? new Date(link.last_clicked).toLocaleString() : "Never"}</div>
        <div><b>Created:</b> {new Date(link.created_at).toLocaleString()}</div>
      </div>
    </div>
  );
}
