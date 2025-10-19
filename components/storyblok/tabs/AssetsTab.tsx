"use client";

import { Image, Video, File, Download, Copy, ExternalLink, Hash, Search } from "lucide-react";
import {useEffect, useState} from "react";

interface Asset {
  type: "image" | "video" | "file";
  url: string;
  filename?: string;
  alt?: string;
  title?: string;
  name?: string;
  id?: string | number;
  copyright?: string;
  fieldtype?: string;
  isExternal?: boolean;
}

export function AssetsTab({ story, onCopy, copiedText }: any) {
  const [filter, setFilter] = useState<"all" | "image" | "video" | "file">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setPreviewAsset(null);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  // === Extract assets recursively ===
  const extractAssets = (obj: any, assets: Asset[] = []): Asset[] => {
    if (!obj || typeof obj !== "object") return assets;

    if (obj.filename && typeof obj.filename === "string") {
      const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(obj.filename);
      const isVideo = /\.(mp4|webm|mov|avi)$/i.test(obj.filename);

      assets.push({
        type: isImage ? "image" : isVideo ? "video" : "file",
        url: obj.filename,
        filename: obj.filename.split("/").pop(),
        alt: obj.alt || "",
        title: obj.title || "",
        name: obj.name || "",
        id: obj.id,
        copyright: obj.copyright,
        fieldtype: obj.fieldtype,
        isExternal: obj.is_external_url,
      });
    }

    Object.values(obj).forEach((value) => {
      if (typeof value === "object") {
        extractAssets(value, assets);
      }
    });

    return assets;
  };

  const allAssets = extractAssets(story.story.content);
  const typedAssets = filter === "all" ? allAssets : allAssets.filter(a => a.type === filter);

  const filteredAssets = searchQuery
      ? typedAssets.filter(a => {
        const haystack = [
          a.title, a.name, a.filename, a.alt, a.url
        ].filter(Boolean).join(" | ").toLowerCase();
        return haystack.includes(searchQuery.toLowerCase());
      })
      : typedAssets;

  const imageCount = allAssets.filter(a => a.type === "image").length;
  const videoCount = allAssets.filter(a => a.type === "video").length;
  const fileCount = allAssets.filter(a => a.type === "file").length;

  // === Filter buttons ===
  const FilterButton = ({ type, label, count, activeColor }: any) => (
      <button
          onClick={() => setFilter(type)}
          className={`p-3 rounded-lg border-2 transition-all ${
              filter === type
                  ? `${activeColor.bg} ${activeColor.border} ${activeColor.text}`
                  : "border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500"
          }`}
      >
        {type === "all" && <File className={`h-5 w-5 mx-auto mb-1`} />}
        {type === "image" && <Image className={`h-5 w-5 mx-auto mb-1`} />}
        {type === "video" && <Video className={`h-5 w-5 mx-auto mb-1`} />}
        {type === "file" && <Download className={`h-5 w-5 mx-auto mb-1`} />}
        <div className="text-xs font-semibold">{label}</div>
        <div className="text-lg font-bold">{count}</div>
      </button>
  );

  return (
      <div className="p-4 space-y-4">
        {/* === Search === */}
        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
              type="text"
              placeholder="Search assets (name, alt, url, …)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
      w-full pl-10 pr-24 h-10
      bg-slate-800 border border-slate-600
      rounded-lg
      focus:outline-none focus:ring-2 focus:ring-cyan-500
      text-sm text-slate-200 placeholder-slate-400
    "
          />
          {searchQuery && (
              <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs rounded bg-slate-700 text-slate-200 hover:bg-slate-600"
              >
                Clear
              </button>
          )}
        </div>

        {/* === Filter === */}
        <div className="grid grid-cols-4 gap-2">
          <FilterButton type="all" label="All" count={allAssets.length} activeColor={{ bg: "bg-cyan-900 bg-opacity-40", border: "border-cyan-500", text: "text-cyan-400" }} />
          <FilterButton type="image" label="Images" count={imageCount} activeColor={{ bg: "bg-green-900 bg-opacity-40", border: "border-green-500", text: "text-green-400" }} />
          <FilterButton type="video" label="Videos" count={videoCount} activeColor={{ bg: "bg-blue-900 bg-opacity-40", border: "border-blue-500", text: "text-blue-400" }} />
          <FilterButton type="file" label="Files" count={fileCount} activeColor={{ bg: "bg-amber-900 bg-opacity-40", border: "border-amber-500", text: "text-amber-400" }} />
        </div>

        <div className="text-xs text-slate-400 px-1">
          {filteredAssets.length} {filteredAssets.length === 1 ? "result" : "results"}
        </div>

        {/* === Asset List === */}
        {filteredAssets.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <File className="h-12 w-12 mx-auto mb-3 opacity-50 text-slate-400" />
              <p className="text-sm">No {filter === "all" ? "assets" : `${filter}s`} found</p>
            </div>
        ) : (
            <div className="space-y-3">
              {filteredAssets.map((asset, idx) => (
                  <div key={idx} className="p-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-cyan-400 transition-colors">
                    <div className="flex items-start gap-3">
                      {/* === Preview === */}
                      {asset.type === "image" ? (
                          <div className="w-16 h-16 shrink-0 bg-slate-900 rounded overflow-hidden flex items-center justify-center">
                            <img
                                src={asset.url}
                                alt={asset.alt || "Asset"}
                                className="w-full h-full object-cover"
                                onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                            />
                          </div>
                      ) : asset.type === "video" ? (
                          <div className="w-16 h-16 shrink-0 bg-blue-900 rounded flex items-center justify-center">
                            <Video className="h-6 w-6 text-blue-400" />
                          </div>
                      ) : (
                          <div className="w-16 h-16 shrink-0 bg-amber-900 rounded flex items-center justify-center">
                            <File className="h-6 w-6 text-amber-400" />
                          </div>
                      )}

                      {/* === Infos === */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-slate-100 truncate mb-1">
                          {asset.title || asset.name || asset.filename || "Unknown"}
                        </div>
                        {asset.alt && <div className="text-xs text-slate-400 mb-1">Alt: {asset.alt}</div>}
                        {asset.copyright && <div className="text-xs text-slate-500 mb-1">© {asset.copyright}</div>}
                        <div className="text-xs font-mono text-slate-500 truncate">{asset.url}</div>

                        <div className="flex flex-wrap gap-2 mt-2">
                          {asset.id && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-xs font-mono">
                        <Hash className="h-3 w-3" /> {asset.id}
                      </span>
                          )}
                          {asset.fieldtype && (
                              <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-xs font-mono">
                        {asset.fieldtype}
                      </span>
                          )}
                          {asset.isExternal && (
                              <span className="px-2 py-0.5 rounded bg-purple-900 bg-opacity-40 text-purple-300 text-xs font-mono">
                            External
                          </span>
                          )}
                        </div>
                      </div>

                      {/* === Actions === */}
                      <div className="flex gap-1 shrink-0">
                        {/* Copy URL */}
                        <button
                            onClick={() => onCopy(asset.url, `asset-${idx}`)}
                            className="p-2 hover:bg-slate-700 rounded transition-colors"
                            title="Copy URL"
                        >
                          <Copy className="h-4 w-4 text-slate-300" />
                        </button>

                        {/* Open */}
                        <button
                            onClick={() => window.open(asset.url, "_blank")}
                            className="p-2 hover:bg-slate-700 rounded transition-colors"
                            title="Open in new tab"
                        >
                          <ExternalLink className="h-4 w-4 text-slate-300" />
                        </button>

                        {/* Preview */}
                        <button
                            onClick={() => setPreviewAsset(asset)}
                            className="p-2 hover:bg-slate-700 rounded transition-colors"
                            title="Preview"
                        >
                          <Image className="h-4 w-4 text-slate-300" />
                        </button>

                        {/* Copy ID */}
                        {asset.id && (
                            <button
                                onClick={() => onCopy(String(asset.id), `asset-id-${idx}`)}
                                className="p-2 hover:bg-slate-700 rounded transition-colors"
                                title="Copy ID"
                            >
                              <Hash className="h-4 w-4 text-slate-300" />
                            </button>
                        )}
                      </div>

                      {/* === Preview Modal === */}
                      {previewAsset && (
                          <div
                              className="fixed inset-0 z-50 flex items-center justify-center"
                              aria-modal="true"
                              role="dialog"
                          >
                            {/* Backdrop */}
                            <div
                                className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm animate-sb-fade-in"
                                onClick={() => setPreviewAsset(null)}
                            />

                            {/* Modal Box */}
                            <div
                                className="relative bg-slate-900 rounded-lg shadow-2xl p-6 max-w-4xl w-full mx-4 animate-sb-slide-in"
                                onClick={(e) => e.stopPropagation()}
                            >
                              {/* Close Button */}
                              <button
                                  onClick={() => setPreviewAsset(null)}
                                  className="absolute top-3 right-3 p-2 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600"
                                  aria-label="Close"
                              >
                                ✕
                              </button>

                              {/* Title */}
                              <h2 className="text-lg font-semibold text-white mb-4 pr-8">
                                {previewAsset.title || previewAsset.name || previewAsset.filename}
                              </h2>

                              {/* Preview Content */}
                              <div className="flex items-center justify-center max-h-[70vh] overflow-hidden">
                                {previewAsset.type === "image" ? (
                                    <img
                                        src={previewAsset.url}
                                        alt={previewAsset.alt || ""}
                                        className="max-h-[70vh] rounded shadow-lg"
                                    />
                                ) : previewAsset.type === "video" ? (
                                    <video
                                        src={previewAsset.url}
                                        controls
                                        autoPlay
                                        className="max-h-[70vh] rounded shadow-lg"
                                    />
                                ) : (
                                    <div className="p-6 text-slate-300 text-center">
                                      <File className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                                      <p>No preview available for this file type.</p>
                                    </div>
                                )}
                              </div>
                            </div>
                          </div>
                      )}
                    </div>
                  </div>
              ))}
            </div>
        )}
      </div>
  );
}
