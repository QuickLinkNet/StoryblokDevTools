"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  FileCode,
  Layers,
  Image,
  Activity,
  Code,
  TrendingUp,
  Zap,
  Globe,
  RotateCcw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { StoryInfoTab } from "./tabs/StoryInfoTab";
import { BlocksTab } from "./tabs/BlocksTab";
import { AssetsTab } from "./tabs/AssetsTab";
import { PerformanceTab } from "./tabs/PerformanceTab";
import { DeveloperToolsTab } from "./tabs/DeveloperToolsTab";
import { FieldUsageTab } from "./tabs/FieldUsageTab";
import { QuickActionsTab } from "./tabs/QuickActionsTab";
import { SeoTab } from "./tabs/SeoTab";
import { JsonTab } from "./tabs/JsonTab";
import {
  StorySelector,
  StorySelectorOption,
} from "./StorySelector";

interface StoryblokOverlayProps {
  story: any | null;
  isOpen?: boolean;
  onClose?: () => void;
  accessToken?: string;
  locales?: string[];
  currentLocale?: string;
  onLocaleChange?: (locale: string) => void;
  stories?: StorySelectorOption[];
  storiesLoading?: boolean;
  storiesError?: string | null;
  selectedStorySlug?: string;
  onSelectStory?: (slug: string) => void;
  onInvalidateStoryCache?: () => void;
  storyLoading?: boolean;
  storyError?: string | null;
  storiesFetchedAt?: number | null;
}

export function StoryblokOverlay({
  story,
  isOpen = false,
  onClose = () => {},
  accessToken = "",
  locales = ["default"],
  currentLocale = "default",
  onLocaleChange = () => {},
  stories = [],
  storiesLoading = false,
  storiesError = null,
  selectedStorySlug = "",
  onSelectStory = () => {},
  onInvalidateStoryCache = () => {},
  storyLoading = false,
  storyError = null,
  storiesFetchedAt = null,
}: StoryblokOverlayProps) {
  const [activeTab, setActiveTab] = useState("info");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSearchQuery("");
  }, [isOpen, story?.story?.id]);

  const storyRecord = story?.story;
  const storyName = storyRecord?.name || "Story";
  const storySlug =
    selectedStorySlug || storyRecord?.full_slug || storyRecord?.slug || "";
  const storySpaceId = storyRecord?.space_id;
  const storyId = storyRecord?.id;
  const hasAccessToken = Boolean(accessToken);

  const storyOptions = useMemo<StorySelectorOption[]>(() => {
    if (stories.length > 0) {
      return stories;
    }
    if (!storySlug) {
      return [];
    }
    return [
      {
        id: storyId ?? 0,
        name: storyName,
        uuid: storyRecord?.uuid || "",
        fullSlug: storySlug,
      },
    ];
  }, [stories, storySlug, storyId, storyName, storyRecord?.uuid]);

  const storySelectValue = useMemo(() => {
    if (!storySlug) {
      return "";
    }
    return storyOptions.some((option) => option.fullSlug === storySlug)
      ? storySlug
      : storyOptions[0]?.fullSlug ?? "";
  }, [storyOptions, storySlug]);

  const formattedStoriesUpdatedAt = useMemo(() => {
    if (!storiesFetchedAt) return null;
    return new Date(storiesFetchedAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [storiesFetchedAt]);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const deliveryApiUrl =
    accessToken && storySlug
      ? `https://api.storyblok.com/v2/cdn/stories/${storySlug}?token=${accessToken}`
      : "";
  const editorUrl =
    storySpaceId && storyId
      ? `https://app.storyblok.com/#!/me/spaces/${storySpaceId}/stories/0/0/${storyId}`
      : "";

  const tabs = [
    { id: "info", label: "Info", icon: FileCode },
    { id: "blocks", label: "Blocks", icon: Layers },
    { id: "assets", label: "Assets", icon: Image },
    { id: "performance", label: "Performance", icon: Activity },
    { id: "dev", label: "Dev Tools", icon: Code },
    { id: "fields", label: "Fields", icon: TrendingUp },
    { id: "actions", label: "Actions", icon: Zap },
    { id: "seo", label: "SEO", icon: Globe },
    { id: "json", label: "JSON", icon: FileCode },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm cursor-pointer animate-sb-fade-in"
        style={{ zIndex: 999998 }}
        onClick={onClose}
      />

      {/* Overlay */}
      <div
        className="fixed right-0 top-0 bottom-0 w-full max-w-[700px] bg-slate-900 shadow-2xl flex flex-col animate-sb-slide-in"
        style={{ zIndex: 999999 }}
      >
        {/* Header */}
        <div className="sticky top-0 z-50 bg-slate-800/95 backdrop-blur-md border-b border-slate-700 px-4 py-3 sm:px-6 flex items-center justify-between flex-wrap gap-3">
          {/* Left: Title */}
          <div className="flex items-center gap-3 min-w-0">
            <Code className="w-6 h-6 text-blue-400 animate-sb-pulse" />
            <div className="min-w-0">
              <div className="text-lg font-bold text-white">
                Storyblok DevTools
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span
                  className="truncate max-w-[220px] sm:max-w-[260px] lg:max-w-[280px]"
                  title={storyName}
                >
                  {storyName}
                </span>
                {storyLoading && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                )}
              </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3 ml-auto text-sm">
            <StorySelector
              options={storyOptions}
              selectedSlug={storySelectValue}
              onSelect={onSelectStory}
              disabled={!hasAccessToken || storyOptions.length === 0}
              loading={storiesLoading}
              updatedAt={storiesFetchedAt}
            />

            <button
              type="button"
              onClick={onInvalidateStoryCache}
              disabled={storiesLoading || !hasAccessToken}
              className="p-2 rounded-lg bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              aria-label="Refresh story list"
              title="Refresh story list"
            >
              {storiesLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
            </button>

            {locales.length > 1 && (
              <div className="flex items-center gap-2">
                <label
                  htmlFor="sb-locale-select"
                  className="text-[11px] uppercase tracking-wide text-slate-400 cursor-pointer"
                >
                  Locale
                </label>
                <select
                  id="sb-locale-select"
                  value={currentLocale}
                  onChange={(e) => onLocaleChange(e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg bg-slate-700 text-slate-200 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {locales.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc === "default" ? "Default" : loc.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <a
              href="https://www.youtube.com/@APIAnarchistProgrammersInc-f4i/videos"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-all text-xs sm:text-sm shadow-sm"
              title="Visit API Anarchist Programmers Inc. on YouTube"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23.498 6.186a2.974 2.974 0 0 0-2.096-2.106C19.2 3.5 12 3.5 12 3.5s-7.2 0-9.402.58A2.974 2.974 0 0 0 .502 6.186 30.215 30.215 0 0 0 0 12a30.215 30.215 0 0 0 .502 5.814 2.974 2.974 0 0 0 2.096 2.106C4.8 20.5 12 20.5 12 20.5s7.2 0 9.402-.58a2.974 2.974 0 0 0 2.096-2.106A30.215 30.215 0 0 0 24 12a30.215 30.215 0 0 0-.502-5.814zM9.75 15.5v-7l6 3.5-6 3.5z" />
              </svg>
              <span className="font-semibold whitespace-nowrap">
                API Anarchist Programmers Inc.
              </span>
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
              aria-label="Close overlay"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!hasAccessToken && (
            <div className="w-full text-right text-[11px] text-amber-300">
              Add a Storyblok Developer Token to enable story switching.
            </div>
          )}
        </div>

        {/* Alerts */}
        {storiesError && (
          <div className="flex items-center gap-2 text-xs text-red-200 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 m-3">
            <AlertCircle className="w-4 h-4" />
            <span>{storiesError}</span>
          </div>
        )}
        {storyError && (
          <div className="flex items-center gap-2 text-xs text-orange-200 bg-orange-500/10 border border-orange-500/30 rounded-lg px-3 py-2 m-3">
            <AlertCircle className="w-4 h-4" />
            <span>{storyError}</span>
          </div>
        )}

        {/* Tabs */}
        <nav
          className="px-4 py-3 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-700 border-opacity-50"
          role="tablist"
        >
          <ul className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    aria-selected={isActive}
                    role="tab"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow shadow-cyan-500/30"
                        : "bg-slate-800/40 text-slate-300 border border-slate-700/50 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sb-scrollbar animate-sb-fade-in">
          {storyLoading && (
            <div className="flex flex-col items-center justify-center gap-3 text-slate-300 text-sm h-full">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              <span>Loading story…</span>
            </div>
          )}

          {!storyLoading && story && (
            <>
              {activeTab === "info" && (
                <StoryInfoTab
                  story={story}
                  deliveryApiUrl={deliveryApiUrl}
                  editorUrl={editorUrl}
                  onCopy={handleCopy}
                  copiedText={copiedText}
                />
              )}
              {activeTab === "blocks" && (
                <BlocksTab
                  content={story.story?.content}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              )}
              {activeTab === "assets" && (
                <AssetsTab
                  story={story}
                  onCopy={handleCopy}
                  copiedText={copiedText}
                />
              )}
              {activeTab === "performance" && <PerformanceTab story={story} />}
              {activeTab === "dev" && (
                <DeveloperToolsTab
                  story={story}
                  onCopy={handleCopy}
                  copiedText={copiedText}
                />
              )}
              {activeTab === "fields" && <FieldUsageTab story={story} />}
              {activeTab === "actions" && (
                <QuickActionsTab
                  story={story}
                  onCopy={handleCopy}
                  copiedText={copiedText}
                  accessToken={accessToken}
                />
              )}
              {activeTab === "seo" && <SeoTab story={story} />}
              {activeTab === "json" && (
                <JsonTab
                  story={story}
                  onCopy={handleCopy}
                  copiedText={copiedText}
                />
              )}
            </>
          )}

          {!storyLoading && !story && (
            <div className="flex flex-col items-center justify-center gap-3 text-slate-300 text-sm h-full text-center">
              <AlertCircle className="w-6 h-6 text-orange-400" />
              <span>
                {storyError || "Select a story to get started."}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
