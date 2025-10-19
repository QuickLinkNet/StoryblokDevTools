"use client";

import { CircleAlert as AlertCircle, Globe, Copy, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

export function SeoTab({ story, onCopy, copiedText }: any) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

  const seoFields = {
    title: story.story.content.title || story.story.name,
    description: story.story.content.description || story.story.content.meta_description,
    ogImage: story.story.content.og_image || story.story.content.image,
    ogTitle: story.story.content.og_title,
    ogDescription: story.story.content.og_description,
    metaRobots: story.story.content.meta_robots,
    canonicalUrl: story.story.content.canonical_url,
  };

  const missingFields = Object.entries(seoFields).filter(([_, value]) => !value);
  const score = Math.round(
      ((Object.keys(seoFields).length - missingFields.length) / Object.keys(seoFields).length) * 100
  );

  const getScoreColor = (s: number) => {
    if (s >= 70) return "text-green-400 bg-green-900 bg-opacity-20 border-green-700";
    if (s >= 40) return "text-amber-400 bg-amber-900 bg-opacity-20 border-amber-700";
    return "text-red-400 bg-red-900 bg-opacity-20 border-red-700";
  };

  // === Recommendations ===
  const recommendations: string[] = [];
  if (!seoFields.description) recommendations.push("Add a description for better CTR in search results");
  if (!seoFields.ogImage) recommendations.push("Add an OG image to improve social link previews");
  if (!seoFields.canonicalUrl) recommendations.push("Set a canonical URL to avoid duplicate content");
  if (!seoFields.metaRobots) recommendations.push("Define meta robots to control indexing");

  // === Helpers ===
  const trimText = (text: string, max: number) =>
      text && text.length > max ? text.substring(0, max) + "…" : text;

  const getLengthInfo = (text: string, max: number) =>
      `${text ? text.length : 0}/${max}`;

  return (
      <div className="p-4 space-y-4">
        {/* Score Card */}
        <div className={`p-4 rounded-lg border ${getScoreColor(score)}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-300">SEO Score</span>
            <span
                className={`text-2xl font-bold ${
                    score >= 70 ? "text-green-400" : score >= 40 ? "text-amber-400" : "text-red-400"
                }`}
            >
            {score}%
          </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
                className={`h-full transition-all ${
                    score >= 70 ? "bg-green-500" : score >= 40 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${score}%` }}
            />
          </div>
          {/* Legend */}
          <div className="mt-2 flex gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-sm" /> 70–100% Strong
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-amber-500 rounded-sm" /> 40–69% Needs Improvement
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-sm" /> 0–39% Critical
            </div>
          </div>
        </div>

        {/* Missing Fields */}
        {missingFields.length > 0 && (
            <div className="flex gap-3 p-4 bg-slate-800 border border-slate-700 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-sm text-slate-300">
                <strong className="text-slate-100">Missing fields ({missingFields.length}):</strong>
                <div className="mt-1 space-y-1">
                  {missingFields.map(([key]) => (
                      <div key={key} className="font-mono text-xs text-slate-400">
                        • {key}
                      </div>
                  ))}
                </div>
              </div>
            </div>
        )}

        {/* Field Values */}
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(seoFields).map(([key, value]) => (
              <div
                  key={key}
                  className={`p-3 rounded-lg border relative ${
                      value ? "bg-slate-800 border-slate-700" : "bg-red-900 bg-opacity-20 border-red-700"
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  <button
                      onClick={() => onCopy(value || "Not set", `seo-${key}`)}
                      className="p-1 hover:bg-slate-700 rounded"
                      disabled={!value}
                  >
                    {copiedText === `seo-${key}` ? (
                        <span className="text-[10px] font-semibold text-green-400">Copied!</span>
                    ) : (
                        <Copy className={`h-3 w-3 ${value ? "text-slate-400 hover:text-cyan-400" : "text-slate-600"}`} />
                    )}
                  </button>
                </div>

                {key === "ogImage" && value ? (
                    <div className="flex items-center gap-2">
                      <img src={value} alt="OG Preview" className="h-12 w-12 object-cover rounded border border-slate-600" />
                      <p className="text-xs text-slate-300 truncate">{value}</p>
                    </div>
                ) : (
                    <p className={`text-sm ${value ? "text-slate-200" : "text-red-400 font-medium"}`}>
                      {value ? String(value) : "Not set"}
                    </p>
                )}

                {/* Length Counter */}
                {(key === "title" || key === "description") && (
                    <div className="mt-1 text-[10px] text-slate-500">
                      {getLengthInfo(value || "", key === "title" ? 60 : 160)}
                    </div>
                )}
              </div>
          ))}
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
            <div className="p-4 bg-amber-900 bg-opacity-30 border border-amber-700 rounded-lg">
              <h3 className="text-sm font-semibold text-amber-300 mb-2">Recommendations</h3>
              <ul className="list-disc list-inside text-xs text-amber-200 space-y-1">
                {recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
        )}

        {/* Google Search Preview */}
        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
          <h3 className="font-semibold text-slate-200 mb-3 text-sm">Google Search Preview</h3>
          <div className="space-y-1">
            <div className="text-blue-400 text-lg hover:underline cursor-pointer">
              {trimText(seoFields.title || "No title", 60)}
            </div>
            <div className="text-green-500 text-xs flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {SITE_URL
                  ? `${SITE_URL}/${story.story.full_slug}`
                  : "⚠ NEXT_PUBLIC_SITE_URL not configured"}
            </div>
            <div className="text-slate-400 text-sm">
              {trimText(seoFields.description || "No description available", 160)}
            </div>
          </div>
        </div>
      </div>
  );
}
