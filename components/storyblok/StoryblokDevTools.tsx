"use client";

import { useEffect, useRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import { StoryblokOverlay } from "./StoryblokOverlay";
import { OverlayToggle } from "./OverlayToggle";
import { TAILWIND_CSS } from "./tailwind-css";

interface StoryData {
  story: {
    content: any;
    name: string;
    id: number;
    uuid: string;
    full_slug?: string;
    space_id?: number;
    [key: string]: any;
  };
}

interface StoryblokDevToolsProps {
  slug?: string;
  version?: "draft" | "published";
  storyData?: StoryData;
  initialOpen?: boolean;
  accessToken?: string;
}

export function StoryblokDevTools({
                                    slug,
                                    version = "draft",
                                    storyData,
                                    initialOpen = false,
                                    accessToken,
                                  }: StoryblokDevToolsProps) {
  const [story, setStory] = useState<StoryData | null>(storyData || null);
  const [overlayOpen, setOverlayOpen] = useState(initialOpen);
  const [mounted, setMounted] = useState(false);
  const [slugReady, setSlugReady] = useState<string | null>(null);

  const [locales, setLocales] = useState<string[]>(["default"]); // alle verfügbaren Locales
  const [currentLocale, setCurrentLocale] = useState<string>("default"); // aktive Locale

  const hostRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);
  const reactRootRef = useRef<Root | null>(null);

  // Mounted setzen
  useEffect(() => {
    setMounted(true);
  }, []);

  // Slug ermitteln
  useEffect(() => {
    if (!mounted) return;
    const currentPath = window.location.pathname;
    if (slug) {
      setSlugReady(slug);
    } else if (currentPath === "/" || currentPath === "") {
      setSlugReady("home");
    } else {
      setSlugReady(
          currentPath.startsWith("/") ? currentPath.slice(1) : currentPath
      );
    }
  }, [mounted, slug]);

  const finalToken =
      accessToken || process.env.NEXT_PUBLIC_STORYBLOK_ACCESS_TOKEN || "";

  // Locales + Story fetchen
  useEffect(() => {
    if (!slugReady || storyData || !finalToken) return;

    const fetchLocalesAndStory = async () => {
      try {
        // 1. Locales abholen
        const spaceUrl = `https://api.storyblok.com/v2/cdn/spaces/me?token=${finalToken}`;
        const resSpace = await fetch(spaceUrl);
        const dataSpace = await resSpace.json();

        if (dataSpace.space?.language_codes) {
          // "default" immer ergänzen
          setLocales(["default", ...dataSpace.space.language_codes]);
        } else {
          setLocales(["default"]);
        }

        // 2. Story in aktueller Locale holen
        const storyUrl =
            `https://api.storyblok.com/v2/cdn/stories/${slugReady}?version=${version}&token=${finalToken}` +
            (currentLocale !== "default" ? `&language=${currentLocale}` : "");

        const resStory = await fetch(storyUrl);
        const dataStory = await resStory.json();

        if (dataStory.story) {
          setStory(dataStory);
        } else {
          console.error("Story not found", dataStory);
        }
      } catch (err) {
        console.error("Failed to fetch locales/story", err);
      }
    };

    fetchLocalesAndStory();
  }, [slugReady, version, storyData, finalToken, currentLocale]);

  // Keyboard Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        setOverlayOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Shadow DOM nur einmal aufbauen
  useEffect(() => {
    if (!hostRef.current || shadowRef.current) return;

    shadowRef.current = hostRef.current.attachShadow({ mode: "open" });

    // Tailwind ins Shadow DOM injizieren
    const style = document.createElement("style");
    style.textContent = TAILWIND_CSS;
    shadowRef.current.appendChild(style);

    // React Root im Shadow
    const mountPoint = document.createElement("div");
    shadowRef.current.appendChild(mountPoint);

    reactRootRef.current = createRoot(mountPoint);
  }, []);

  // Inhalt ins Shadow DOM rendern
  useEffect(() => {
    if (reactRootRef.current) {
      reactRootRef.current.render(
          <>
            {/* Toggle-Button */}
            <OverlayToggle onClick={() => setOverlayOpen(true)} />

            {/* Overlay nur, wenn Story da */}
            {story && (
                <StoryblokOverlay
                    story={story}
                    isOpen={overlayOpen}
                    onClose={() => setOverlayOpen(false)}
                    accessToken={finalToken}
                    locales={locales}                  // NEW
                    currentLocale={currentLocale}      // NEW
                    onLocaleChange={setCurrentLocale}  // NEW
                />
            )}
          </>
      );
    }
  }, [story, overlayOpen, finalToken, locales, currentLocale]);

  // Wichtig: NICHTS außerhalb vom Shadow Root rendern
  return <div ref={hostRef} />;
}
