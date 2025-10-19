"use client";

import { useState } from "react";
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

interface StoryblokOverlayProps {
  story: any;
  isOpen?: boolean;
  onClose?: () => void;
  accessToken?: string;
  locales?: string[];
  currentLocale?: string;
  onLocaleChange?: (locale: string) => void;
}

export function StoryblokOverlay({
                                   story,
                                   isOpen = false,
                                   onClose = () => {},
                                   accessToken = "",
                                   locales = ["default"],
                                   currentLocale = "default",
                                   onLocaleChange = () => {},
                                 }: StoryblokOverlayProps) {
  const [activeTab, setActiveTab] = useState("info");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const deliveryApiUrl = accessToken
      ? `https://api.storyblok.com/v2/cdn/stories/${story.story.full_slug}?token=${accessToken}`
      : "";
  const editorUrl = `https://app.storyblok.com/#!/me/spaces/${story.story.space_id}/stories/0/0/${story.story.id}`;

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
          <div className="flex items-center justify-between p-6 bg-slate-800 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <Code className="w-6 h-6 text-blue-400 animate-sb-pulse" />
              <div>
                <div className="text-lg font-bold text-white">
                  Storyblok DevTools
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {story.story.name}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* YouTube Button */}
              <a
                  href="https://www.youtube.com/@APIAnarchistProgrammersInc-f4i/videos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                  title="Visit API Anarchist Programmers Inc. on YouTube"
              >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                  <path d="M23.498 6.186a2.974 2.974 0 0 0-2.096-2.106C19.2 3.5 12 3.5 12 3.5s-7.2 0-9.402.58A2.974 2.974 0 0 0 .502 6.186 30.215 30.215 0 0 0 0 12a30.215 30.215 0 0 0 .502 5.814 2.974 2.974 0 0 0 2.096 2.106C4.8 20.5 12 20.5 12 20.5s7.2 0 9.402-.58a2.974 2.974 0 0 0 2.096-2.106A30.215 30.215 0 0 0 24 12a30.215 30.215 0 0 0-.502-5.814zM9.75 15.5v-7l6 3.5-6 3.5z" />
                </svg>
                <span className="text-sm font-semibold">
                API Anarchist Programmers Inc.
              </span>
              </a>

              {/* Locale Switcher */}
              {locales.length > 1 && (
                  <select
                      value={currentLocale}
                      onChange={(e) => onLocaleChange(e.target.value)}
                      className="px-3 py-2 text-sm rounded bg-slate-700 text-slate-200 text-xs border border-slate-600 hover:bg-slate-600"
                  >
                    {locales.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc === "default" ? "DEFAULT" : loc.toUpperCase()}
                        </option>
                    ))}
                  </select>
              )}

              {/* Close Button */}
              <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
                  aria-label="Close overlay"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

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
                          className={`
                      flex items-center gap-2
                      px-4 py-2 
                      rounded-lg
                      text-sm font-medium 
                      focus:outline-none focus:ring-2 focus:ring-cyan-500
                      ${
                              isActive
                                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow shadow-cyan-500 shadow-opacity-30"
                                  : "bg-slate-800 bg-opacity-40 text-slate-300 border border-slate-700 border-opacity-50 hover:bg-slate-700 hover:text-white"
                          }
                    `}
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
                    content={story.story.content}
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
          </div>
        </div>
      </>
  );
}
