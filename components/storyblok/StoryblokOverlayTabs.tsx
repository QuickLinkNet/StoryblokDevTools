"use client";

import type {
  StoryblokOverlayTabId,
  StoryblokOverlayTab,
  StoryblokOverlayTabsProps,
} from "./types";

export type { StoryblokOverlayTabId, StoryblokOverlayTab } from "./types";

export function StoryblokOverlayTabs({
  tabs,
  activeTab,
  onSelect,
}: StoryblokOverlayTabsProps) {
  return (
    <nav
      className="border-b border-slate-700 border-opacity-50 bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-3"
      role="tablist"
    >
      <ul className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <li key={tab.id}>
              <button
                type="button"
                onClick={() => onSelect(tab.id)}
                aria-selected={isActive}
                role="tab"
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow shadow-cyan-500/30"
                    : "border border-slate-700/50 bg-slate-800/40 text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
