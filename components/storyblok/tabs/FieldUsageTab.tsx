"use client";

import {
  CircleCheck as CheckCircle,
  CircleAlert as AlertCircle,
  Circle as XCircle,
  TrendingUp,
  Copy,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import { useState } from "react";
import type { FieldAnalysis } from "../types";

export function FieldUsageTab({ story, onCopy, copiedText }: any) {
  const [showEmpty, setShowEmpty] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const analyzeFields = (
      obj: any,
      currentPath: string = "content",
      fields: FieldAnalysis[] = []
  ): FieldAnalysis[] => {
    if (!obj || typeof obj !== "object") return fields;

    Object.entries(obj).forEach(([key, value]) => {
      if (!["_uid", "component", "_editable"].includes(key)) {
        const path = currentPath ? `${currentPath}.${key}` : key;
        const isEmpty =
            value === null ||
            value === undefined ||
            value === "" ||
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === "object" && value !== null && Object.keys(value).length === 0);

        const type = Array.isArray(value)
            ? "array"
            : value === null
                ? "null"
                : typeof value;

        fields.push({
          path,
          value,
          isEmpty,
          type,
        });

        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          analyzeFields(value, path, fields);
        } else if (Array.isArray(value)) {
          value.forEach((item, idx) => {
            if (item && typeof item === "object") {
              analyzeFields(item, `${path}[${idx}]`, fields);
            }
          });
        }
      }
    });

    return fields;
  };

  const allFields = analyzeFields(story.story.content);
  const emptyFields = allFields.filter((f) => f.isEmpty);
  const filledFields = allFields.filter((f) => !f.isEmpty);
  const fillRate = allFields.length > 0
      ? Math.round((filledFields.length / allFields.length) * 100)
      : 100;
  const filteredEmptyFields = emptyFields.filter((f) =>
      f.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (rate: number) => {
    if (rate >= 80) return "text-green-400 bg-green-900 bg-opacity-40 border-green-600";
    if (rate >= 60) return "text-blue-400 bg-blue-900 bg-opacity-40 border-blue-600";
    if (rate >= 40) return "text-amber-400 bg-amber-900 bg-opacity-40 border-amber-600";
    return "text-red-400 bg-red-900 bg-opacity-40 border-red-600"
  };

  const typeStats = allFields.reduce((acc, field) => {
    acc[field.type] = (acc[field.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const emptyTypeStats = emptyFields.reduce((acc, field) => {
    acc[field.type] = (acc[field.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const groupByComponent = (fields: FieldAnalysis[]) => {
    return fields.reduce((acc, f) => {
      const comp = f.path.split(".")[1] || "root";
      acc[comp] = acc[comp] || [];
      acc[comp].push(f);
      return acc;
    }, {} as Record<string, FieldAnalysis[]>);
  };

  const groupedEmpty = groupByComponent(filteredEmptyFields);

  return (
      <div className="p-4 space-y-6">
        {/* Fill Rate */}
        <div className={`p-6 rounded-lg border-2 ${getStatusColor(fillRate)}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              <span className="text-lg font-bold">Field Fill Rate</span>
            </div>
            <span className="text-4xl font-bold">{fillRate}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
                className={`h-full transition-all ${
                    fillRate >= 80
                        ? "bg-green-500"
                        : fillRate >= 60
                            ? "bg-blue-500"
                            : fillRate >= 40
                                ? "bg-amber-500"
                                : "bg-red-500"
                }`}
                style={{ width: `${fillRate}%` }}
            />
          </div>
          <div className="mt-3 text-sm text-slate-300">
            {filledFields.length} of {allFields.length} fields have content
          </div>
        </div>

        {/* Legende */}
        <div className="mt-2 flex gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-sm" /> 80–100%
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-sm" /> 60–79%
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-amber-500 rounded-sm" /> 40–59%
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-sm" /> 0–39%
          </div>
        </div>

        {/* Counters */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 bg-green-900 bg-opacity-30 border border-green-700 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-xs font-semibold text-green-300 uppercase">Filled</span>
            </div>
            <div className="text-2xl font-bold text-green-300">{filledFields.length}</div>
          </div>

          <div className="p-4 bg-red-900 bg-opacity-30 border border-red-700 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-5 w-5 text-red-400" />
              <span className="text-xs font-semibold text-red-300 uppercase">Empty</span>
            </div>
            <div className="text-2xl font-bold text-red-300">{emptyFields.length}</div>
          </div>

          <div className="p-4 bg-slate-800 border border-slate-600 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-300 uppercase">Total</span>
            </div>
            <div className="text-2xl font-bold text-slate-300">{allFields.length}</div>
          </div>
        </div>

        {/* Field Types */}
        <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
          <h3 className="font-semibold text-slate-200 mb-3 text-sm">Field Types Distribution</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(typeStats).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-2 bg-slate-900 rounded border border-slate-700">
                  <span className="text-xs font-mono text-slate-400">{type}</span>
                  <span className="text-sm font-bold text-slate-200">{count}</span>
                </div>
            ))}
          </div>

          {/* Empty Types Chart */}
          {Object.keys(emptyTypeStats).length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-semibold text-slate-400 mb-2">Empty by Type</h4>
                <div className="space-y-2">
                  {Object.entries(emptyTypeStats).map(([type, count]) => (
                      <div key={type}>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>{type}</span>
                          <span>{count}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded">
                          <div
                              className="h-2 bg-red-500 rounded"
                              style={{ width: `${(count / emptyFields.length) * 100}%` }}
                          />
                        </div>
                      </div>
                  ))}
                </div>
              </div>
          )}
        </div>

        {/* Search Input */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
                type="text"
                placeholder="Search fields..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
          w-full pl-10 pr-3 h-10
          border border-slate-300
          rounded-lg
          focus:outline-none focus:ring-2 focus:ring-cyan-500
          text-sm bg-slate-800 text-slate-200 placeholder-slate-400 border-slate-600
        "
            />
          </div>

          {searchQuery && (
              <button
                  onClick={() => setSearchQuery("")}
                  className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Clear
              </button>
          )}
        </div>


        {/* Empty Fields */}
        {emptyFields.length > 0 && (
            <div className="border-t border-slate-700 pt-4">
              <button
                  onClick={() => setShowEmpty(!showEmpty)}
                  className="flex items-center gap-2 mb-3 text-slate-300 hover:text-slate-100 transition-colors"
              >
                {showEmpty ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <h3 className="font-semibold">Empty Fields ({emptyFields.length})</h3>
              </button>
              {showEmpty && (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {Object.entries(groupedEmpty).map(([comp, fields]) => (
                        <div key={comp}>
                          <h4 className="text-sm font-semibold text-slate-200 mb-2">{comp}</h4>
                          <div className="space-y-2">
                            {fields.map((field, idx) => (
                                <div key={idx} className="p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded-lg flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <code className="text-xs font-mono text-red-300 break-all">{field.path}</code>
                                    <div className="mt-1 text-xs text-red-400">
                                      Type: <span className="font-semibold">{field.type}</span>
                                    </div>
                                  </div>
                                  <button
                                      onClick={() => onCopy(field.path, `field-${idx}`)}
                                      className="p-1 hover:bg-slate-700 rounded"
                                      title="Copy path"
                                  >
                                    {copiedText === `field-${idx}` ? (
                                        <span className="text-[10px] font-semibold text-green-400">Copied!</span>
                                    ) : (
                                        <Copy className="h-4 w-4 text-slate-400 hover:text-cyan-400" />
                                    )}
                                  </button>
                                </div>
                            ))}
                          </div>
                        </div>
                    ))}
                  </div>
              )}
            </div>
        )}

        {/* All Good */}
        {emptyFields.length === 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 p-4 bg-green-900 bg-opacity-30 border border-green-700 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                <span className="text-sm text-green-300 font-medium">
              All fields have content. Excellent work!
            </span>
              </div>
            </div>
        )}

        {/* Tip */}
        {emptyFields.length > 0 && emptyFields.length < allFields.length * 0.3 && (
            <div className="p-4 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg">
              <div className="text-sm text-blue-300">
                <strong>💡 Tip:</strong> Only {emptyFields.length} fields need attention. Add content to improve completeness.
              </div>
            </div>
        )}
      </div>
  );
}
