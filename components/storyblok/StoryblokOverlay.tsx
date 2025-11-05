"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FileCode,
  Layers,
  Image,
  Activity,
  Code,
  TrendingUp,
  Zap,
  Globe,
  GitBranch,
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
import { RelationsTab } from "./tabs/RelationsTab";
import { StoryblokOverlayHeader } from "./StoryblokOverlayHeader";
import { StoryblokOverlayTabs } from "./StoryblokOverlayTabs";
import type {
  StoryblokOverlayAlertProps,
  StoryblokOverlayAlertVariant,
  StoryblokOverlayAlertsProps,
  StoryblokOverlayProps,
  StoryblokOverlayTab,
  StoryblokOverlayTabId,
  StorySelectorOption,
} from "./types";

const OVERLAY_TABS = [
  { id: "info", label: "Info", icon: FileCode },
  { id: "blocks", label: "Blocks", icon: Layers },
  { id: "assets", label: "Assets", icon: Image },
  { id: "performance", label: "Performance", icon: Activity },
  { id: "dev", label: "Dev Tools", icon: Code },
  { id: "fields", label: "Fields", icon: TrendingUp },
  { id: "actions", label: "Actions", icon: Zap },
  { id: "seo", label: "SEO", icon: Globe },
  { id: "relations", label: "Relations", icon: GitBranch },
  { id: "json", label: "JSON", icon: FileCode },
] as const satisfies ReadonlyArray<StoryblokOverlayTab>;

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
  const [activeTab, setActiveTab] =
    useState<StoryblokOverlayTabId>("info");
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
        className="fixed right-0 top-0 bottom-0 w-full bg-slate-900 shadow-2xl flex flex-col animate-sb-slide-in"
        style={{ zIndex: 999999 }}
      >
        <StoryblokOverlayHeader
          storyName={storyName}
          storyLoading={storyLoading}
          hasAccessToken={hasAccessToken}
          storyOptions={storyOptions}
          storySelectValue={storySelectValue}
          onSelectStory={onSelectStory}
          onInvalidateStoryCache={onInvalidateStoryCache}
          storiesLoading={storiesLoading}
          storiesFetchedAt={storiesFetchedAt}
          locales={locales}
          currentLocale={currentLocale}
          onLocaleChange={onLocaleChange}
          onClose={onClose}
        />

        <StoryblokOverlayAlerts
          storiesError={storiesError}
          storyError={storyError}
        />

        {/* Tabs */}
        <StoryblokOverlayTabs
          tabs={OVERLAY_TABS}
          activeTab={activeTab}
          onSelect={setActiveTab}
        />

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
              {activeTab === "relations" && (
                <RelationsTab story={story} accessToken={accessToken} />
              )}
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

function StoryblokOverlayAlerts({
  storiesError,
  storyError,
}: StoryblokOverlayAlertsProps) {
  if (!storiesError && !storyError) {
    return null;
  }

  return (
    <>
      {storiesError && (
        <StoryblokOverlayAlert variant="error" message={storiesError} />
      )}
      {storyError && (
        <StoryblokOverlayAlert variant="warning" message={storyError} />
      )}
    </>
  );
}

function StoryblokOverlayAlert({
  variant,
  message,
}: StoryblokOverlayAlertProps) {
  const baseClassName =
    "m-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs";
  const variantClassName =
    variant === "error"
      ? "border-red-500/30 bg-red-500/10 text-red-200"
      : "border-orange-500/30 bg-orange-500/10 text-orange-200";

  return (
    <div className={`${baseClassName} ${variantClassName}`}>
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
}
