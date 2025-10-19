"use client";

import { Copy, ExternalLink, Eye, Globe, Hash, Link2, Zap, Keyboard } from "lucide-react";
import {InfoCard} from "../components/InfoCards";

export function QuickActionsTab({ story, onCopy, copiedText, accessToken = '' }: any) {
  const token = accessToken;

  const quickCopyItems = [
    { id: "id", label: "Story ID", value: story.story.id.toString(), icon: Hash },
    { id: "uuid", label: "UUID", value: story.story.uuid, icon: Hash },
    { id: "slug", label: "Slug", value: story.story.slug, icon: Link2 },
    { id: "full_slug", label: "Full Slug", value: story.story.full_slug, icon: Globe },
    {
      id: "api_url",
      label: "API URL",
      value: `https://api.storyblok.com/v2/cdn/stories/${story.story.full_slug}?token=${token}`,
      icon: Zap
    },
    {
      id: "api_url_draft",
      label: "API URL (Draft)",
      value: `https://api.storyblok.com/v2/cdn/stories/${story.story.full_slug}?token=${token}&version=draft`,
      icon: Zap
    },
  ];

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
  const STAGING_URL = process.env.NEXT_PUBLIC_STAGING_URL;
  const LOCAL_URL = process.env.NEXT_PUBLIC_LOCAL_URL;
  const EDITOR_BASE = process.env.NEXT_PUBLIC_STORYBLOK_EDITOR_URL;
  const SPACE_ID = process.env.NEXT_PUBLIC_STORYBLOK_SPACE_ID;

  const previewLinks = [
    { label: "Production", url: `${SITE_URL}/${story.story.full_slug}`, color: "green" },
    { label: "Staging", url: `${STAGING_URL}/${story.story.full_slug}`, color: "blue" },
    { label: "Local", url: `${LOCAL_URL}/${story.story.full_slug}`, color: "purple" },
    { label: "Editor", url: `${EDITOR_BASE}/${SPACE_ID}/stories/0/0/${story.story.id}`, color: "cyan" },
  ];

  return (
      <div className="p-4 space-y-6">

        {/* Keyboard Shortcuts */}
        <div className="p-3 bg-slate-800 border border-slate-700 rounded-lg flex items-center gap-2">
          <Keyboard className="h-5 w-5 text-cyan-400" />
          <span className="text-xs text-slate-300">
          <strong>CTRL + SHIFT + D</strong> – Close Overlay
        </span>
        </div>

        {/* Quick Copy Grid */}
        <div>
          <h3 className="font-semibold text-slate-200 mb-3 text-sm">Quick Copy</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 sb-grid-gap">
            {quickCopyItems.map((item) => {
              const Icon = item.icon;
              return (
                  <div
                      key={item.id}
                      onClick={() => onCopy(item.value, item.id)}
                      className="cursor-pointer hover:border-cyan-500 transition-colors relative"
                  >
                    <InfoCard
                        icon={<Icon className="h-4 w-4" />}
                        label={item.label}
                        value={item.value}
                        mono
                    />
                    {copiedText === item.id && (
                        <span className="absolute top-2 right-2 text-[10px] font-semibold text-green-400">
              Copied!
            </span>
                    )}
                  </div>
              );
            })}
          </div>
        </div>


        {/* Preview Links Grid */}
        <div>
          <h3 className="font-semibold text-slate-200 mb-3 text-sm">Preview Links</h3>
          <div className="grid grid-cols-2 gap-2">
            {previewLinks.map((link, idx) => (
                <button
                    key={idx}
                    onClick={() => window.open(link.url, "_blank")}
                    disabled={!link.url || link.url.includes("undefined")}
                    className={`flex items-center justify-between gap-2 p-3 rounded-lg border transition-colors
    ${
                        !link.url || link.url.includes("undefined")
                            ? "bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed opacity-50"
                            : link.color === "green"
                                ? "bg-green-900 bg-opacity-30 border-green-700 hover:bg-green-800 hover:bg-opacity-40"
                                : link.color === "blue"
                                    ? "bg-blue-900 bg-opacity-30 border-blue-700 hover:bg-blue-800 hover:bg-opacity-40"
                                    : link.color === "purple"
                                        ? "bg-purple-900 bg-opacity-30 border-purple-700 hover:bg-purple-800 hover:bg-opacity-40"
                                        : "bg-cyan-900 bg-opacity-30 border-cyan-700 hover:bg-cyan-800 hover:bg-opacity-40"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-white" />
                    <span className="text-sm font-semibold text-slate-100">{link.label}</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </button>
            ))}
          </div>
        </div>

        {/* Pro Tip */}
        <div className="p-4 bg-slate-800 bg-opacity-90 border border-slate-700 rounded-lg mt-4 text-sm text-slate-300">
          <strong className="text-cyan-400">💡 Pro Tip:</strong>
          Set the following environment variables to make preview links work correctly:
          <code className="block mt-1 text-xs text-cyan-300 font-mono">
            NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_STAGING_URL, NEXT_PUBLIC_LOCAL_URL, NEXT_PUBLIC_STORYBLOK_EDITOR_URL, NEXT_PUBLIC_STORYBLOK_SPACE_ID
          </code>
        </div>
      </div>
  );
}
