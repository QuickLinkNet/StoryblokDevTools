"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { useStoryRelations } from "../relations/useStoryRelations";
import type {
  RelationListProps,
  RelationsTabProps,
  StoryRelationEntry,
  StoryRelationOccurrence,
  SummaryCardProps,
} from "../types";

const FILTER_BUTTON_BASE =
  "px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors";

export function RelationsTab({ story, accessToken }: RelationsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    inbound: true,
    outbound: true,
  });

  const {
    inbound,
    outbound,
    loading,
    error,
    refresh,
    lastUpdated,
    datasetSize,
    analyzedStories,
    datasetFetchedAt,
  } = useStoryRelations({ story, accessToken });

  const outboundStats = useMemo(() => {
    const stories = outbound.length;
    const occurrences = outbound.reduce(
      (sum, entry) => sum + entry.occurrences.length,
      0
    );
    return { stories, occurrences };
  }, [outbound]);

  const inboundStats = useMemo(() => {
    const stories = inbound.length;
    const occurrences = inbound.reduce(
      (sum, entry) => sum + entry.occurrences.length,
      0
    );
    return { stories, occurrences };
  }, [inbound]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredInbound = useMemo(() => {
    if (!filters.inbound) {
      return [];
    }
    if (!normalizedQuery) {
      return inbound;
    }
    return inbound.filter((entry) =>
      matchesRelationEntry(entry, normalizedQuery)
    );
  }, [filters.inbound, inbound, normalizedQuery]);

  const filteredOutbound = useMemo(() => {
    if (!filters.outbound) {
      return [];
    }
    if (!normalizedQuery) {
      return outbound;
    }
    return outbound.filter((entry) =>
      matchesRelationEntry(entry, normalizedQuery)
    );
  }, [filters.outbound, outbound, normalizedQuery]);

  const totalMatches =
    filteredInbound.reduce(
      (sum, entry) => sum + entry.occurrences.length,
      0
    ) +
    filteredOutbound.reduce(
      (sum, entry) => sum + entry.occurrences.length,
      0
    );

  const hasResults =
    filteredInbound.length > 0 || filteredOutbound.length > 0;

  const formattedLastUpdated = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const formattedDatasetUpdated = datasetFetchedAt
    ? new Date(datasetFetchedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const handleToggleFilter = (type: "inbound" | "outbound") => {
    setFilters((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleRefresh = () => {
    refresh({ force: true });
  };

  const handleExport = () => {
    if (!hasResults) {
      return;
    }

    const payload = {
      generatedAt: new Date().toISOString(),
      story: {
        uuid: story?.story?.uuid || null,
        name: story?.story?.name || null,
        slug: story?.story?.full_slug || story?.story?.slug || null,
      },
      summary: {
        inboundStories: inbound.length,
        outboundStories: outbound.length,
        inboundOccurrences: inboundStats.occurrences,
        outboundOccurrences: outboundStats.occurrences,
        analyzedStories,
        datasetSize,
      },
      filters: {
        search: searchQuery,
        inbound: filters.inbound,
        outbound: filters.outbound,
      },
      inbound,
      outbound,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `story-relations-${story?.story?.slug || "story"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          title="Outbound Relations"
          value={outboundStats.stories}
          subtitle={`${outboundStats.occurrences} reference${
            outboundStats.occurrences === 1 ? "" : "s"
          }`}
          icon={<ArrowUpRight className="h-4 w-4" />}
          accentClass="from-cyan-500/25 via-transparent to-transparent"
          iconBgClass="bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/30 shadow shadow-cyan-500/10"
        />
        <SummaryCard
          title="Inbound Relations"
          value={inboundStats.stories}
          subtitle={`${inboundStats.occurrences} mention${
            inboundStats.occurrences === 1 ? "" : "s"
          }`}
          icon={<ArrowDownLeft className="h-4 w-4" />}
          accentClass="from-emerald-500/25 via-transparent to-transparent"
          iconBgClass="bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30 shadow shadow-emerald-500/10"
        />
        <SummaryCard
          title="Analyzed Stories"
          value={analyzedStories}
          subtitle={
            datasetSize
              ? `Dataset: ${datasetSize} stor${
                  datasetSize === 1 ? "y" : "ies"
                }`
              : "Dataset pending"
          }
          icon={<RefreshCw className="h-4 w-4" />}
          accentClass="from-blue-500/20 via-transparent to-transparent"
          iconBgClass="bg-slate-800 text-slate-200 ring-1 ring-slate-700/60 shadow shadow-slate-900/40"
        />
      </div>

      <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4 shadow-inner shadow-black/20">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search relations..."
                className="w-full rounded-xl border border-slate-700/70 bg-slate-950/70 py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleToggleFilter("outbound")}
                className={`${FILTER_BUTTON_BASE} ${
                  filters.outbound
                    ? "border-cyan-500/60 bg-cyan-500/10 text-cyan-200 shadow shadow-cyan-500/20"
                    : "border-slate-700/70 bg-slate-800/70 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                }`}
              >
                Outbound
              </button>
              <button
                type="button"
                onClick={() => handleToggleFilter("inbound")}
                className={`${FILTER_BUTTON_BASE} ${
                  filters.inbound
                    ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-200 shadow shadow-emerald-500/20"
                    : "border-slate-700/70 bg-slate-800/70 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                }`}
              >
                Inbound
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-500 hover:text-white disabled:opacity-60"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin text-cyan-400" : "text-cyan-300"}`}
              />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={!hasResults}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-500 hover:text-white disabled:opacity-60 disabled:hover:border-slate-700"
            >
              <Download className="h-4 w-4 text-cyan-300" />
              Export JSON
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-xl border border-slate-800/70 bg-slate-900/60 px-3 py-2 text-[11px] text-slate-400">
        {formattedLastUpdated && (
          <span>Last analysis: {formattedLastUpdated}</span>
        )}
        {formattedDatasetUpdated && (
          <span>Dataset fetched: {formattedDatasetUpdated}</span>
        )}
        <span>
          Visible matches: {totalMatches} ({filteredOutbound.length} outbound,{" "}
          {filteredInbound.length} inbound)
        </span>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200 shadow shadow-red-500/10">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/60 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.35)]" />
          <span>Analyzing story relations...</span>
        </div>
      )}

      {!loading && !error && !hasResults && (
        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/50 px-6 py-16 text-center text-sm text-slate-400 shadow-inner shadow-black/20">
          No relations found for this story with the current filters.
        </div>
      )}

      {!loading && hasResults && (
        <div className="space-y-6">
          {filters.outbound && filteredOutbound.length > 0 && (
            <RelationList
              title="Outbound Relations"
              entries={filteredOutbound}
              accentClass="text-cyan-300"
              badgeClass="bg-cyan-500/10 text-cyan-200 border border-cyan-500/20"
            />
          )}

          {filters.inbound && filteredInbound.length > 0 && (
            <RelationList
              title="Inbound Relations"
              entries={filteredInbound}
              accentClass="text-emerald-300"
              badgeClass="bg-emerald-500/10 text-emerald-200 border border-emerald-500/20"
            />
          )}
        </div>
      )}
    </div>
  );
}

function matchesRelationEntry(entry: StoryRelationEntry, query: string): boolean {
  const haystack = [
    entry.storyName,
    entry.storySlug,
    entry.storyUuid,
    ...entry.occurrences.map(
      (occ: StoryRelationOccurrence) => `${occ.path} ${occ.fieldKey || ""}`
    ),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  accentClass,
  iconBgClass,
}: SummaryCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/70 p-5 shadow-lg shadow-black/20">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accentClass}`}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
            {title}
          </span>
          <div className="text-3xl font-semibold text-white drop-shadow-sm">
            {value}
          </div>
          <div className="text-xs text-slate-400">{subtitle}</div>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBgClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function RelationList({
  title,
  entries,
  accentClass,
  badgeClass,
}: RelationListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/70 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between border-b border-slate-800/60 bg-slate-950/60 px-5 py-3">
        <h3 className={`text-sm font-semibold tracking-wide ${accentClass}`}>
          {title}
        </h3>
        <span className="text-xs text-slate-400">
          {entries.length} stor{entries.length === 1 ? "y" : "ies"}
        </span>
      </div>

      <ul className="divide-y divide-slate-800/60">
        {entries.map((entry) => (
          <li key={entry.storyUuid} className="p-5 transition hover:bg-slate-900/50">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
              <div>
                <div className="text-sm font-semibold text-white drop-shadow">
                  {entry.storyName}
                </div>
                {entry.storySlug && (
                  <div className="text-xs text-slate-400">{entry.storySlug}</div>
                )}
              </div>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium ${badgeClass}`}
              >
                {entry.occurrences.length} match
                {entry.occurrences.length === 1 ? "" : "es"}
              </span>
            </div>

            <ul className="mt-3 space-y-2">
              {entry.occurrences.map(
                (occ: StoryRelationOccurrence, index: number) => (
                  <li
                    key={`${entry.storyUuid}-${index}-${occ.path}`}
                    className="rounded-xl border border-slate-800/70 bg-slate-950/70 px-4 py-3 text-xs text-slate-300 shadow-inner shadow-black/20"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-slate-400">
                      {occ.fieldKey && (
                        <span className="rounded bg-slate-900/60 px-2 py-0.5">
                          {occ.fieldKey}
                        </span>
                      )}
                      {occ.component && (
                        <span className="rounded bg-slate-900/60 px-2 py-0.5">
                          {occ.component}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 font-mono text-[11px] text-cyan-300">
                      {occ.path}
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-slate-500">
                      {occ.snippet}
                    </div>
                  </li>
                )
              )}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
