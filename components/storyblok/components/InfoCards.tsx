import React from "react";

export function InfoCard({ icon, label, value, mono }: any) {
    return (
        <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-slate-300 mb-1">
                <span className="text-slate-400 text-lg">{icon}</span>
                <span className="font-medium">{label}</span>
            </div>
            <div
                className={`text-base text-white truncate ${
                    mono ? "font-mono" : ""
                }`}
            >
                {typeof value === "string" ? value : value}
            </div>
        </div>
    );
}
