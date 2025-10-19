"use client";

import { useState } from "react";
import { Copy, ChevronRight, ChevronDown, Braces } from "lucide-react";

export function JsonTab({ story, onCopy, copiedText }: any) {
    const [viewMode, setViewMode] = useState<"tree" | "raw">("tree");
    const [prettyPrint, setPrettyPrint] = useState(true);
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

    const jsonString = prettyPrint
        ? JSON.stringify(story, null, 2)
        : JSON.stringify(story);

    const sizeKB = (new Blob([jsonString]).size / 1024).toFixed(2);

    // === Recursive Renderer ===
    const renderJSON = (key: string | null, value: any, path: string) => {
        const isObject = typeof value === "object" && value !== null;
        const isArray = Array.isArray(value);
        const collapsedKey = `${path}-${key || "root"}`;

        // Auto collapse for long arrays
        const isInitiallyCollapsed = isArray && value.length > 20;
        const isCollapsed = collapsed[collapsedKey] ?? isInitiallyCollapsed;

        const toggleCollapse = () =>
            setCollapsed((prev) => ({ ...prev, [collapsedKey]: !isCollapsed }));

        if (isObject) {
            const entries = Object.entries(value);
            return (
                <div key={collapsedKey} className="ml-4">
                    <div
                        className="flex items-center cursor-pointer select-none hover:text-cyan-400"
                        onClick={toggleCollapse}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-4 w-4 mr-1" />
                        ) : (
                            <ChevronDown className="h-4 w-4 mr-1" />
                        )}
                        {key && (
                            <span className="text-cyan-400 font-semibold">"{key}"</span>
                        )}
                        <span className="ml-1 text-slate-400">
              {isArray ? `[${value.length}]` : `{${entries.length}}`}
            </span>

                        {/* Copy Path */}
                        {key && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCopy(path + "." + key, `path-${collapsedKey}`);
                                }}
                                className="ml-2 p-1 hover:bg-slate-700 rounded"
                                title="Copy JSON path"
                            >
                                <Copy className="h-3 w-3 text-slate-500 hover:text-cyan-400" />
                            </button>
                        )}
                    </div>

                    {!isCollapsed && (
                        <div className="ml-6 border-l border-slate-700 pl-2">
                            {entries.map(([childKey, childVal]) =>
                                renderJSON(childKey, childVal, `${collapsedKey}.${childKey}`)
                            )}
                        </div>
                    )}
                </div>
            );
        }

        // === Primitive values ===
        let displayValue: any = value;
        let color = "text-green-400"; // string default
        if (typeof value === "number") color = "text-purple-400";
        if (typeof value === "boolean") color = "text-amber-400";
        if (value === null) {
            displayValue = "null";
            color = "text-pink-400";
        }
        if (typeof value === "string") {
            displayValue = `"${value}"`;
        }

        return (
            <div key={collapsedKey} className="ml-4 flex items-center">
                {key && (
                    <>
                        <span className="text-cyan-400 font-semibold">"{key}"</span>
                        <span className="text-slate-400 mr-1">: </span>
                    </>
                )}
                <span className={color}>{String(displayValue)}</span>
                {key && (
                    <button
                        onClick={() => onCopy(path + "." + key, `path-${collapsedKey}`)}
                        className="ml-2 p-1 hover:bg-slate-700 rounded"
                        title="Copy JSON path"
                    >
                        <Copy className="h-3 w-3 text-slate-500 hover:text-cyan-400" />
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="p-0 flex flex-col h-full">
            {/* === Sticky Action Bar === */}
            <div className="flex gap-2 p-3 bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
                <button
                    onClick={() => onCopy(jsonString, "json")}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm font-medium"
                >
                    <Copy className="h-4 w-4" />
                    {copiedText === "json" ? "Copied!" : "Copy JSON"}
                </button>

                {/* Toggle Tree / Raw */}
                <button
                    onClick={() => setViewMode(viewMode === "tree" ? "raw" : "tree")}
                    className="px-4 py-2 border border-slate-500 text-slate-200 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium flex items-center gap-1"
                >
                    <Braces className="h-4 w-4" />
                    {viewMode === "tree" ? "Raw View" : "Tree View"}
                </button>

                {/* Pretty toggle only for Raw */}
                {viewMode === "raw" && (
                    <button
                        onClick={() => setPrettyPrint(!prettyPrint)}
                        className="px-4 py-2 border border-slate-500 text-slate-200 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                    >
                        {prettyPrint ? "Minify" : "Pretty"}
                    </button>
                )}
            </div>

            {/* Meta Info */}
            <div className="flex items-center justify-between px-4 py-2 text-xs text-slate-400 bg-slate-900 border-b border-slate-800">
        <span>
          {viewMode === "tree" ? "Collapsible JSON Tree" : "Raw JSON"}
        </span>
                <span>{sizeKB} KB</span>
            </div>

            {/* Renderer */}
            <div className="bg-slate-900 text-xs font-mono text-slate-200 p-4 overflow-auto flex-1 leading-relaxed">
                {viewMode === "tree" ? renderJSON(null, story, "root") : <pre>{jsonString}</pre>}
            </div>
        </div>
    );
}
