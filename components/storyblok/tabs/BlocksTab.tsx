"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { ComponentTree } from "../components/BlockComponents";

export function BlocksTab({ content, searchQuery, setSearchQuery }: any) {
  const [expandedAll, setExpandedAll] = useState(false);
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set());
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

  const countComponents = (obj: any): number => {
    if (!obj) return 0;
    let count = 1;
    if (obj.body && Array.isArray(obj.body)) {
      obj.body.forEach((item: any) => {
        count += countComponents(item);
      });
    }
    Object.entries(obj).forEach(([key, value]) => {
      if (key !== "body" && Array.isArray(value)) {
        value.forEach((item: any) => {
          if (item && typeof item === "object" && item.component) {
            count += countComponents(item);
          }
        });
      }
    });
    return count;
  };

  const totalComponents = countComponents(content);

  const handleExpandAll = () => {
    if (expandedAll) {
      setExpandedComponents(new Set());
      setExpandedFields(new Set());
    }
    setExpandedAll(!expandedAll);
  };

  return (
      <div className="p-4 space-y-6">
        <div className="flex gap-2 items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
                type="text"
                placeholder="Search components, fields, values..."
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

          {/* Expand Button */}
          <button
              onClick={handleExpandAll}
              className="
      flex items-center justify-center gap-2 h-10
      px-4 rounded-lg
      bg-cyan-500 hover:bg-cyan-600
      text-white text-sm font-medium
      transition-colors
    "
          >
            {expandedAll ? (
                <>
                  <ChevronDown className="h-4 w-4" /> Collapse All
                </>
            ) : (
                <>
                  <ChevronRight className="h-4 w-4" /> Expand All
                </>
            )}
          </button>
        </div>

        {/* === Stats + Clear Search === */}
        <div className="flex items-center justify-between text-xs uppercase tracking-wide px-1">
          <div className="flex flex-col gap-1">
            <div className="text-slate-400">
              {totalComponents} {totalComponents === 1 ? "component" : "components"} total
            </div>
            {/* Typ-Statistik */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(
                  (function collectTypes(obj: any, acc: Record<string, number> = {}) {
                    if (!obj) return acc;
                    if (obj.component) {
                      acc[obj.component] = (acc[obj.component] || 0) + 1;
                    }
                    if (obj.body && Array.isArray(obj.body)) {
                      obj.body.forEach((item: any) => collectTypes(item, acc));
                    }
                    Object.values(obj).forEach((val: any) => {
                      if (Array.isArray(val)) {
                        val.forEach((item: any) => {
                          if (item && typeof item === "object") collectTypes(item, acc);
                        });
                      }
                    });
                    return acc;
                  })(content)
              ).map(([type, count]) => (
                  <span
                      key={type}
                      className="px-2 py-0.5 rounded bg-slate-800 border border-slate-600 text-slate-300 text-[10px]"
                  >
          {type}: {count}
        </span>
              ))}
            </div>
          </div>

          {searchQuery && (
              <button
                  onClick={() => setSearchQuery("")}
                  className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Clear search
              </button>
          )}
        </div>

        {/* === Component Tree === */}
        <div
            className="
          bg-slate-900 bg-opacity-50 border border-slate-700
          rounded-lg p-4
          max-h-[70vh] overflow-y-auto sb-scrollbar
        "
        >
          <ComponentTree
              component={content}
              level={0}
              searchQuery={searchQuery}
              expandedAll={expandedAll}
              expandedComponents={expandedComponents}
              setExpandedComponents={setExpandedComponents}
              expandedFields={expandedFields}
              setExpandedFields={setExpandedFields}
          />
        </div>
      </div>
  );
}
