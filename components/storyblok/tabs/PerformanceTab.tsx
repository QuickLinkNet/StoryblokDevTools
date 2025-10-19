"use client";

import {
  Activity,
  Layers,
  TrendingDown,
  TrendingUp,
  TriangleAlert as AlertTriangle,
  CircleCheck as CheckCircle,
  Clock,
  Hash,
  FileText,
  Globe,
  PieChart,
  Image as ImageIcon,
  Video,
  File,
  Info,
  Copy,
} from "lucide-react";
import { useMemo } from "react";

export function PerformanceTab({ story }: any) {
  const jsonString = JSON.stringify(story.story);
  const jsonSizeBytes = new Blob([jsonString]).size;
  const jsonSizeKB = (jsonSizeBytes / 1024).toFixed(2);

  // === Component + Field Analysis ===
  const countComponents = (obj: any, depth: number = 0, typeMap: Record<string, number> = {}): { count: number; maxDepth: number; typeMap: Record<string, number> } => {
    if (!obj || typeof obj !== "object") return { count: 0, maxDepth: depth, typeMap };
    let count = obj.component ? 1 : 0;
    let maxDepth = depth;
    if (obj.component) {
      typeMap[obj.component] = (typeMap[obj.component] || 0) + 1;
    }

    if (obj.body && Array.isArray(obj.body)) {
      obj.body.forEach((item: any) => {
        const result = countComponents(item, depth + 1, typeMap);
        count += result.count;
        maxDepth = Math.max(maxDepth, result.maxDepth);
      });
    }

    Object.entries(obj).forEach(([key, value]) => {
      if (key !== "body" && Array.isArray(value)) {
        value.forEach((item: any) => {
          if (item && typeof item === "object" && item.component) {
            const result = countComponents(item, depth + 1, typeMap);
            count += result.count;
            maxDepth = Math.max(maxDepth, result.maxDepth);
          }
        });
      }
    });

    return { count, maxDepth, typeMap };
  };

  const countFields = (obj: any): number => {
    if (!obj || typeof obj !== "object") return 0;
    let count = 0;
    Object.entries(obj).forEach(([key, value]) => {
      if (!["_uid", "component", "_editable"].includes(key)) {
        count++;
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          count += countFields(value);
        }
      }
    });
    return count;
  };

  // Asset Count
  const extractAssets = (obj: any, assets: any[] = []): any[] => {
    if (!obj || typeof obj !== "object") return assets;
    if (obj.filename && typeof obj.filename === "string") {
      assets.push(obj);
    }
    Object.values(obj).forEach((value) => {
      if (typeof value === "object") extractAssets(value, assets);
    });
    return assets;
  };
  const allAssets = extractAssets(story.story.content);

  const { count: componentCount, maxDepth: nestingDepth, typeMap } = countComponents(story.story.content);
  const fieldCount = countFields(story.story.content);

  const uniqueComponents = Object.keys(typeMap).length;
  const assetCount = allAssets.length;

  // === Performance Scoring ===
  const getPerformanceScore = (): { score: number; level: "excellent" | "good" | "warning" | "poor" } => {
    let score = 100;
    if (jsonSizeBytes > 500000) score -= 30;
    else if (jsonSizeBytes > 200000) score -= 15;
    else if (jsonSizeBytes > 100000) score -= 5;

    if (componentCount > 100) score -= 20;
    else if (componentCount > 50) score -= 10;
    else if (componentCount > 25) score -= 5;

    if (nestingDepth > 10) score -= 20;
    else if (nestingDepth > 6) score -= 10;
    else if (nestingDepth > 4) score -= 5;

    if (score >= 85) return { score, level: "excellent" };
    if (score >= 70) return { score, level: "good" };
    if (score >= 50) return { score, level: "warning" };
    return { score, level: "poor" };
  };

  const { score, level } = getPerformanceScore();

  const metrics = [
    { label: "JSON Size", value: `${jsonSizeKB} KB`, raw: jsonSizeBytes, threshold: 100000, icon: FileText, description: "Total content size" },
    { label: "Components", value: componentCount, raw: componentCount, threshold: 50, icon: Layers, description: "Total component count" },
    { label: "Nesting Depth", value: nestingDepth, raw: nestingDepth, threshold: 6, icon: TrendingUp, description: "Maximum component nesting" },
    { label: "Total Fields", value: fieldCount, raw: fieldCount, threshold: 100, icon: Activity, description: "All content fields" },
    { label: "Unique Components", value: uniqueComponents, raw: uniqueComponents, threshold: 20, icon: PieChart, description: "Distinct component types" },
    { label: "Assets", value: assetCount, raw: assetCount, threshold: 50, icon: ImageIcon, description: "Images, Videos, Files used" },
  ];

  const getStatusColor = (raw: number, threshold: number) => {
    if (raw < threshold * 0.5) return "bg-green-900 bg-opacity-30 text-green-300 border-green-600";
    if (raw < threshold) return "bg-blue-900 bg-opacity-30 text-blue-300 border-blue-600";
    if (raw < threshold * 1.5) return "bg-amber-900 bg-opacity-30 text-amber-300 border-amber-600";
    return "bg-red-900 bg-opacity-30 text-red-300 border-red-600";
  };

  const recommendations = [];
  if (jsonSizeBytes > 200000) recommendations.push("Consider splitting large content into multiple stories");
  if (componentCount > 50) recommendations.push("High component count may impact load times");
  if (nestingDepth > 6) recommendations.push("Deep nesting can make content hard to maintain");
  if (fieldCount > 100) recommendations.push("Consider restructuring to reduce field count");
  if (assetCount > 50) recommendations.push("Large number of assets may impact performance");

  const updatedAt = new Date(story.story.updated_at).toLocaleString();
  const createdAt = new Date(story.story.created_at).toLocaleString();

  const topComponents = useMemo(() =>
          Object.entries(typeMap)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5),
      [typeMap]
  );

  // === Legend
  const legend = [
    { color: "text-green-400", label: "Excellent (<50% threshold)" },
    { color: "text-blue-400", label: "Good (<100% threshold)" },
    { color: "text-amber-400", label: "Warning (<150% threshold)" },
    { color: "text-red-400", label: "Poor (>=150% threshold)" },
  ];

  return (
      <div className="p-4 space-y-6">
        {/* === Score Card === */}
        <div className={`p-6 rounded-lg border-2 shadow-lg ${
            level === "excellent" ? "bg-slate-800 border-green-600" :
                level === "good" ? "bg-slate-800 border-blue-600" :
                    level === "warning" ? "bg-slate-800 border-amber-600" :
                        "bg-slate-800 border-red-600"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className={`h-6 w-6 ${
                  level === "excellent" ? "text-green-400" :
                      level === "good" ? "text-blue-400" :
                          level === "warning" ? "text-amber-400" :
                              "text-red-400"
              }`} />
              <span className="text-lg font-bold text-slate-100">Performance Score</span>
            </div>
            <span className={`text-4xl font-extrabold ${
                level === "excellent" ? "text-green-400" :
                    level === "good" ? "text-blue-400" :
                        level === "warning" ? "text-amber-400" :
                            "text-red-400"
            }`}>
            {score}
          </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
                className={`h-full transition-all ${
                    level === "excellent" ? "bg-green-500" :
                        level === "good" ? "bg-blue-500" :
                            level === "warning" ? "bg-amber-500" :
                                "bg-red-500"
                }`}
                style={{ width: `${score}%` }}
            />
          </div>
          <div className="mt-2 text-sm font-medium capitalize text-slate-300">
            {level === "excellent" && "Excellent performance"}
            {level === "good" && "Good performance"}
            {level === "warning" && "Performance could be improved"}
            {level === "poor" && "Performance needs attention"}
          </div>
        </div>

        {/* === Legend === */}
        <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-slate-400" />
            <span className="font-semibold text-slate-200 text-sm">Legend (Threshold Evaluation)</span>
          </div>
          <ul className="text-xs space-y-1">
            {legend.map((l, i) => (
                <li key={i} className={l.color}>{l.label}</li>
            ))}
          </ul>
        </div>

        {/* === Metrics === */}
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            const statusColor = getStatusColor(metric.raw, metric.threshold);
            return (
                <div key={idx} className={`p-4 rounded-lg border ${statusColor}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wide">{metric.label}</span>
                  </div>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="text-xs opacity-75">{metric.description}</div>
                </div>
            );
          })}
        </div>

        {/* === Component Breakdown === */}
        <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="h-5 w-5 text-blue-400" />
            <span className="font-semibold text-slate-200">Top Components</span>
          </div>
          {topComponents.length === 0 ? (
              <div className="text-slate-400 text-sm">No components detected</div>
          ) : (
              <div className="flex flex-wrap gap-2">
                {topComponents.map(([type, count]) => (
                    <span key={type} className="px-3 py-1 bg-slate-700 rounded-lg text-slate-200 text-xs font-mono">
                {type}: {count}
              </span>
                ))}
              </div>
          )}
        </div>

        {/* === Story Meta === */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Clock className="h-4 w-4" /> Created: {createdAt}
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Clock className="h-4 w-4" /> Updated: {updatedAt}
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Hash className="h-4 w-4" /> ID: {story.story.id}
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Globe className="h-4 w-4" /> Lang: {story.story.lang}
          </div>
        </div>

        {/* === Recommendations === */}
        {recommendations.length > 0 ? (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold text-slate-100">Recommendations</h3>
              </div>
              <div className="space-y-2">
                {recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-amber-900 bg-opacity-30 border border-amber-600 rounded-lg">
                      <TrendingDown className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-amber-100">{rec}</span>
                    </div>
                ))}
              </div>
            </div>
        ) : (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 p-4 bg-green-900 bg-opacity-30 border border-green-600 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                <span className="text-sm text-green-100 font-medium">
              No performance issues detected. Great job!
            </span>
              </div>
            </div>
        )}
      </div>
  );
}
