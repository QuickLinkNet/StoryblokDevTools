"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { TAILWIND_CSS } from "./tailwind-css";
import type { ShadowDomWrapperProps } from "./types";

export function ShadowDomWrapper({ children }: ShadowDomWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shadowRootRef = useRef<ShadowRoot | null>(null);
  const [mountPoint, setMountPoint] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      let shadow: ShadowRoot;

      if (containerRef.current.shadowRoot) {
        shadow = containerRef.current.shadowRoot;
      } else {
        shadow = containerRef.current.attachShadow({ mode: "open" });

        const styleElement = document.createElement("style");
        styleElement.textContent = TAILWIND_CSS;
        shadow.appendChild(styleElement);
      }

      shadowRootRef.current = shadow;

      const mount = document.createElement("div");
      shadow.appendChild(mount);

      setMountPoint(mount);

      return () => {
        if (mount && shadow.contains(mount)) {
          shadow.removeChild(mount);
        }
        setMountPoint(null);
      };
    } catch (error) {
      console.error("Shadow DOM error:", error);
    }
  }, []);

  return (
    <div ref={containerRef}>
      {mountPoint && createPortal(children, mountPoint)}
    </div>
  );
}
