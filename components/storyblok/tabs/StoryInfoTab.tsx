"use client";

import {
    Copy,
    ExternalLink,
    FileCode,
    Hash,
    Globe,
    Box,
    Zap,
    FolderTree,
    ArrowUpDown,
    Languages,
    Link2,
    Layers,
    Eye,
    Calendar,
    Clock,
    Tag,
    Database,
} from "lucide-react";
import { InfoCard } from "../components/InfoCards";

export function StoryInfoTab({
                                 story,
                                 deliveryApiUrl,
                                 editorUrl,
                                 onCopy,
                                 copiedText,
                             }: any) {
    const s = story.story;

    // === Publication Status Logic ===
    let statusLabel = "Draft";
    let statusClass = "bg-amber-500 bg-opacity-20 text-amber-400";
    if (!s.first_published_at) {
        statusLabel = "Never published";
        statusClass = "bg-slate-600 bg-opacity-20 text-slate-400";
    } else if (s.published_at) {
        statusLabel = "Published";
        statusClass = "bg-green-500 bg-opacity-20 text-green-400";
    } else {
        statusLabel = "Draft (unpublished changes)";
        statusClass = "bg-amber-500 bg-opacity-20 text-amber-400";
    }

    return (
        <div className="p-5 space-y-8">
            {/* === General === */}
            <section>
                <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                    General
                </h3>
                <div className="sb-grid-2-3-4 sb-grid-gap">
                    <InfoCard icon={<FileCode className="h-4 w-4" />} label="Name" value={s.name} />
                    <InfoCard icon={<Hash className="h-4 w-4" />} label="ID" value={s.id} />
                    <InfoCard icon={<Globe className="h-4 w-4" />} label="Slug" value={s.slug} mono />
                    <InfoCard
                        icon={<Box className="h-4 w-4" />}
                        label="Status"
                        value={
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                {statusLabel}
              </span>
                        }
                    />
                </div>
            </section>

            {/* === Structure === */}
            <section>
                <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                    Structure
                </h3>
                <div className="sb-grid-2-3-4 sb-grid-gap">
                    <InfoCard
                        icon={<Zap className="h-4 w-4 text-amber-500" />}
                        label="Startpage"
                        value={<span className={s.is_startpage ? "text-amber-400 font-semibold" : "text-slate-500"}>{s.is_startpage ? "Yes" : "No"}</span>}
                    />
                    <InfoCard icon={<FolderTree className="h-4 w-4" />} label="Parent ID" value={s.parent_id === 0 ? "Root" : s.parent_id} />
                    {s.position > 0 && (
                        <InfoCard
                            icon={<ArrowUpDown className="h-4 w-4" />}
                            label="Position"
                            value={s.position}
                            tooltip="Position in sort order within the parent folder"
                        />
                    )}
                    {s.lang && (
                        <InfoCard
                            icon={<Languages className="h-4 w-4" />}
                            label="Language"
                            value={s.lang.toUpperCase()}
                            mono
                        />
                    )}
                    {s.path && (
                        <InfoCard
                            icon={<Link2 className="h-4 w-4 text-slate-400" />}
                            label="Path"
                            value={s.path}
                            mono
                        />
                    )}
                </div>
            </section>

            {/* === Identifiers === */}
            <section>
                <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                    Identifiers
                </h3>
                <div className="sb-grid-2-3-4 sb-grid-gap">
                    <InfoCard icon={<Link2 className="h-5 w-5 text-slate-400" />} label="Full Slug" value={s.full_slug} mono />
                    <InfoCard icon={<Hash className="h-5 w-5 text-slate-400" />} label="UUID" value={s.uuid} mono />
                    {s.content_type && <InfoCard icon={<Layers className="h-5 w-5 text-blue-400" />} label="Content Type" value={s.content_type} mono />}
                </div>
            </section>

            {/* === Dates === */}
            <section>
                <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">
                    Dates
                </h3>
                <div className="sb-grid-2-3-4 sb-grid-gap">
                    <InfoCard icon={<Eye className="h-4 w-4 text-green-400" />} label="Published At" value={s.published_at ? new Date(s.published_at).toLocaleString() : "Not published"} />
                    <InfoCard icon={<Calendar className="h-4 w-4 text-blue-400" />} label="Created At" value={new Date(s.created_at).toLocaleString()} />
                    <InfoCard icon={<Clock className="h-4 w-4 text-purple-400" />} label="Updated At" value={new Date(s.updated_at).toLocaleString()} />
                </div>
            </section>

            {/* === Other (cards) === */}
            <section>
                <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                    Other
                </h3>

                <div className="sb-grid-2-3-4 sb-grid-gap">
                    {s.tag_list?.length > 0 ? (
                        <>
                            {s.tag_list.map((tag: string, idx: number) => (
                                <InfoCard
                                    key={idx}
                                    icon={<Tag className="h-4 w-4 text-purple-400" />}
                                    label="Tag"
                                    value={`#${tag}`}
                                />
                            ))}
                        </>
                    ) : (
                        <>
                            <InfoCard
                                icon={<Tag className="h-4 w-4 text-slate-400" />}
                                label="Tags"
                                value="No tags defined"
                            />
                        </>
                    )}

                    {s.alternates?.length > 0 ? (
                        <>
                            {s.alternates.map((alt: any, idx: number) => (
                                <InfoCard
                                    key={idx}
                                    icon={<Languages className="h-4 w-4 text-blue-400" />}
                                    label={alt?.lang ? alt.lang.toUpperCase() : "DEFAULT"}
                                    value={alt?.full_slug || "-"}
                                    mono
                                />
                            ))}
                        </>
                    ) : (
                        <InfoCard
                            icon={<Languages className="h-4 w-4 text-slate-400" />}
                            label="Translations"
                            value="No alternates available"
                        />
                    )}

                    <InfoCard
                        icon={<Database className="h-4 w-4 text-indigo-400" />}
                        label="Cache Version"
                        value={String(story.cv)}
                        mono
                    />
                </div>
            </section>


            {/* === Actions === */}
            <section className="pt-6">
                <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                    {/* Primary */}
                    <button
                        onClick={() => onCopy(deliveryApiUrl, "api")}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 active:from-cyan-600 active:to-blue-600 shadow-md shadow-cyan-900 shadow-opacity-30 transition-all"
                    >
                        <Copy className="h-5 w-5" />
                        {copiedText === "api" ? "Copied!" : "Copy API URL"}
                    </button>

                    {/* Secondary */}
                    <button
                        onClick={() => window.open(editorUrl, "_blank")}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-slate-200 bg-slate-800 border border-slate-600 hover:bg-slate-700 hover:border-slate-500 active:bg-slate-900 shadow-sm shadow-black shadow-opacity-20 transition-all"
                    >
                        <ExternalLink className="h-5 w-5" />
                        Open Editor
                    </button>
                </div>
            </section>
        </div>
    );
}
