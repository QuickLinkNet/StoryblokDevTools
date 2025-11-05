"use client";

import { useState } from "react";
import { Code as Code2 } from "lucide-react";
import type { OverlayToggleProps } from "./types";

export function OverlayToggle({ onClick }: OverlayToggleProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="
        fixed bottom-6 right-6
        w-16 h-16
        rounded-2xl
        bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600
        shadow-lg shadow-cyan-500 shadow-opacity-40
        text-white
        cursor-pointer
        flex items-center justify-center
        transition-transform duration-300 ease-out
        hover:scale-110 hover:rotate-3 hover:shadow-xl hover:shadow-cyan-500 hover:shadow-opacity-60
        active:scale-95
        group
        border border-white border-opacity-20
        z-999998
      "
            aria-label="Toggle Storyblok Developer Tools"
        >
            <div className="relative">
                <Code2
                    className="
            w-8 h-8
            transition-transform duration-300 ease-out
            group-hover:scale-110
          "
                />
                {isHovered && (
                    <div
                        className="
              absolute -top-14 left-1/2 -translate-x-1/2
              whitespace-nowrap
              px-3 py-1.5
              rounded-lg
              bg-slate-900/95 backdrop-blur-sm
              text-white text-xs font-medium
              shadow-xl
              animate-fade-in
              pointer-events-none
            "
                    >
                        Storyblok DevTools
                        <div
                            className="
                absolute -bottom-1 left-1/2 -translate-x-1/2
                w-2 h-2
                bg-slate-900 rotate-45
              "
                        />
                    </div>
                )}
            </div>
        </button>
    );
}
