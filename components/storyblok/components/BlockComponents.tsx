"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export function ComponentTree({
                                  component,
                                  level,
                                  searchQuery,
                                  expandedAll,
                                  expandedComponents,
                                  setExpandedComponents,
                                  expandedFields,
                                  setExpandedFields,
                              }: any) {
    const uid = component._uid || `root-${level}`;
    const isExpanded = expandedAll || expandedComponents.has(uid);

    if (!component) return null;

    const matchesSearch =
        !searchQuery ||
        component.component?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(component).toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return null;

    const hasNestedComponents =
        component.body && Array.isArray(component.body) && component.body.length > 0;
    const allFields = Object.entries(component).filter(
        ([key]) => !["_uid", "component", "body", "_editable"].includes(key)
    );

    const hasContent = allFields.length > 0 || hasNestedComponents;

    const toggleComponent = () => {
        const newSet = new Set(expandedComponents);
        if (newSet.has(uid)) {
            newSet.delete(uid);
        } else {
            newSet.add(uid);
        }
        setExpandedComponents(newSet);
    };

    return (
        <div className="space-y-2">
            <button
                onClick={toggleComponent}
                className="flex items-center gap-2 w-full p-3 rounded-lg
                   bg-slate-800 border border-slate-700
                   hover:bg-slate-700 transition-colors text-left"
            >
                {hasContent ? (
                    isExpanded ? (
                        <ChevronDown className="h-4 w-4 shrink-0 text-slate-300" />
                    ) : (
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                    )
                ) : (
                    <div className="w-4 shrink-0" />
                )}
                <span className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-xs font-mono font-semibold text-slate-200">
          {component.component || "root"}
        </span>
                <span className="text-xs text-slate-400 truncate font-mono">
          {component._uid}
        </span>
                {allFields.length > 0 && (
                    <span className="ml-auto text-xs text-slate-400 shrink-0">
            {allFields.length}{" "}
                        {allFields.length === 1 ? "field" : "fields"}
          </span>
                )}
            </button>

            {isExpanded && hasContent && (
                <div className="space-y-3 pl-6 border-l border-slate-700 ml-2">
                    {allFields.length > 0 && (
                        <div className="space-y-3">
                            {allFields.map(([key, value]) => (
                                <FieldDisplay
                                    key={`${uid}-${key}`}
                                    fieldName={key}
                                    fieldValue={value}
                                    fieldId={`${uid}-${key}`}
                                    expandedFields={expandedFields}
                                    setExpandedFields={setExpandedFields}
                                    expandedAll={expandedAll}
                                />
                            ))}
                        </div>
                    )}

                    {hasNestedComponents && (
                        <div className="space-y-2 pt-2">
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-2">
                                Nested Components ({component.body.length})
                            </div>
                            {component.body.map((nestedComponent: any) => (
                                <ComponentTree
                                    key={nestedComponent._uid}
                                    component={nestedComponent}
                                    level={level + 1}
                                    searchQuery={searchQuery}
                                    expandedAll={expandedAll}
                                    expandedComponents={expandedComponents}
                                    setExpandedComponents={setExpandedComponents}
                                    expandedFields={expandedFields}
                                    setExpandedFields={setExpandedFields}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export function FieldDisplay({
                                 fieldName,
                                 fieldValue,
                                 fieldId,
                                 expandedFields,
                                 setExpandedFields,
                                 expandedAll,
                             }: any) {
    const isExpanded = expandedAll || expandedFields.has(fieldId);

    const getFieldType = (value: any): string => {
        if (value === null) return "null";
        if (value === undefined) return "undefined";
        if (Array.isArray(value)) return `array[${value.length}]`;
        if (typeof value === "object") return "object";
        if (typeof value === "string") return "string";
        if (typeof value === "number") return "number";
        if (typeof value === "boolean") return "boolean";
        return typeof value;
    };

    const fieldType = getFieldType(fieldValue);
    const isComplex =
        Array.isArray(fieldValue) ||
        (typeof fieldValue === "object" && fieldValue !== null);

    const toggleField = () => {
        const newSet = new Set(expandedFields);
        if (newSet.has(fieldId)) {
            newSet.delete(fieldId);
        } else {
            newSet.add(fieldId);
        }
        setExpandedFields(newSet);
    };

    const renderValue = (value: any, depth: number = 0): React.ReactNode => {
        if (value === null)
            return <span className="text-orange-400 font-semibold">null</span>;
        if (value === undefined)
            return <span className="text-orange-400 font-semibold">undefined</span>;
        if (typeof value === "boolean")
            return <span className="text-purple-400 font-semibold">{String(value)}</span>;
        if (typeof value === "number")
            return <span className="text-blue-400 font-semibold">{value}</span>;
        if (typeof value === "string")
            return <span className="text-green-400">&quot;{value}&quot;</span>;

        if (Array.isArray(value)) {
            if (value.length === 0)
                return <span className="text-slate-500">[]</span>;

            const hasObjects = value.some(
                (item) => typeof item === "object" && item !== null
            );

            if (hasObjects) {
                return (
                    <div className="space-y-2 mt-2">
                        {value.map((item, index) => (
                            <ArrayItemDisplay key={index} item={item} index={index} />
                        ))}
                    </div>
                );
            } else {
                return (
                    <div className="flex flex-wrap gap-2 mt-1">
                        {value.map((item, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-200"
                            >
                {renderValue(item, depth + 1)}
              </span>
                        ))}
                    </div>
                );
            }
        }

        if (typeof value === "object") {
            return (
                <div className="mt-2 space-y-1 pl-4 border-l border-slate-700">
                    {Object.entries(value).map(([key, val]) => (
                        <div key={key} className="text-xs">
                            <span className="font-medium text-slate-300">{key}:</span>{" "}
                            {renderValue(val, depth + 1)}
                        </div>
                    ))}
                </div>
            );
        }

        return <span className="text-slate-200">{String(value)}</span>;
    };

    return (
        <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-cyan-500 transition-colors">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-slate-200 text-sm">
              {fieldName}
            </span>
                        <span className="px-1.5 py-0.5 bg-slate-700 text-slate-400 rounded text-xs font-mono">
              {fieldType}
            </span>
                    </div>

                    {isComplex ? (
                        <div className="text-sm">
                            {!isExpanded && (
                                <button
                                    onClick={toggleField}
                                    className="text-cyan-400 hover:text-cyan-300 text-xs font-medium flex items-center gap-1"
                                >
                                    <ChevronRight className="h-3 w-3" />
                                    Show details
                                </button>
                            )}
                            {isExpanded && (
                                <div className="mt-2">
                                    {renderValue(fieldValue)}
                                    <button
                                        onClick={toggleField}
                                        className="text-cyan-400 hover:text-cyan-300 text-xs font-medium mt-2 flex items-center gap-1"
                                    >
                                        <ChevronDown className="h-3 w-3" />
                                        Hide details
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-sm mt-1">{renderValue(fieldValue)}</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function ArrayItemDisplay({ item, index }: { item: any; index: number }) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (typeof item !== "object" || item === null) {
        return (
            <div className="p-2 bg-slate-700 rounded border border-slate-600 text-sm">
                <span className="text-slate-400 font-mono text-xs">[{index}]</span>{" "}
                {typeof item === "string" ? (
                    <span className="text-green-400">&quot;{item}&quot;</span>
                ) : (
                    String(item)
                )}
            </div>
        );
    }

    const component = item.component;
    const uid = item._uid;
    const fields = Object.entries(item).filter(
        ([key]) => !["_uid", "component", "_editable"].includes(key)
    );

    return (
        <div className="border border-slate-600 rounded-lg overflow-hidden bg-slate-800">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center gap-2 p-3 bg-slate-700 hover:bg-slate-600 transition-colors text-left"
            >
                {isExpanded ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-300" />
                ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                )}
                <span className="text-xs font-mono text-slate-300 font-semibold">
          [{index}]
        </span>
                {component && (
                    <span className="px-2 py-0.5 bg-cyan-900 text-cyan-300 rounded text-xs font-mono font-semibold">
            {component}
          </span>
                )}
                {uid && (
                    <span className="text-xs text-slate-500 truncate font-mono">{uid}</span>
                )}
                <span className="ml-auto text-xs text-slate-400 shrink-0">
          {fields.length} {fields.length === 1 ? "field" : "fields"}
        </span>
            </button>

            {isExpanded && (
                <div className="p-3 space-y-2 border-t border-slate-600 bg-slate-900">
                    {fields.map(([key, value]) => (
                        <div key={key} className="text-sm">
                            <span className="font-medium text-slate-300">{key}:</span>{" "}
                            <span className="text-slate-200">
                {typeof value === "object" ? (
                    <pre className="mt-1 text-xs bg-slate-800 p-2 rounded border border-slate-700 overflow-x-auto font-mono text-slate-200">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                ) : typeof value === "string" ? (
                    <span className="text-green-400">&quot;{value}&quot;</span>
                ) : (
                    String(value)
                )}
              </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
