"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

interface StorySummary {
  id: number;
  name: string;
  uuid: string;
  fullSlug: string;
}

interface StoryblokDevToolsProps {
  slug?: string;
  version?: "draft" | "published";
  storyData?: StoryData;
  initialOpen?: boolean;
  accessToken?: string;
}

const STORY_LIST_CACHE_KEY = "storyblokDevTools::storyList";
const STORY_LIST_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

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
  const [stories, setStories] = useState<StorySummary[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [storiesError, setStoriesError] = useState<string | null>(null);
  const [storiesFetchedAt, setStoriesFetchedAt] = useState<number | null>(null);
  const [storyLoading, setStoryLoading] = useState(false);
  const [storyError, setStoryError] = useState<string | null>(null);

  const [locales, setLocales] = useState<string[]>(["default"]); // alle verfügbaren Locales
  const [currentLocale, setCurrentLocale] = useState<string>("default"); // aktive Locale

  const hostRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);
  const reactRootRef = useRef<Root | null>(null);
  const isMountedRef = useRef(false);

  // Mounted setzen
  useEffect(() => {
    setMounted(true);
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (storyData) {
      setStory(storyData);
      setStoryError(null);
      setStoryLoading(false);
    }
  }, [storyData]);

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

  const fetchAndCacheStories = useCallback(
      async (forceRefresh: boolean = false) => {
        if (!mounted || !finalToken) {
          return;
        }

        if (typeof window === "undefined") {
          return;
        }

        const now = Date.now();

        if (!forceRefresh) {
          const cachedRaw = window.localStorage.getItem(STORY_LIST_CACHE_KEY);
          if (cachedRaw) {
            try {
              const cached = JSON.parse(cachedRaw);
              if (
                  cached &&
                  Array.isArray(cached.stories) &&
                  typeof cached.timestamp === "number" &&
                  now - cached.timestamp < STORY_LIST_CACHE_TTL
              ) {
                setStories(cached.stories);
                setStoriesFetchedAt(cached.timestamp);
                setStoriesError(null);
                return;
              }
            } catch (error) {
              console.warn("Failed to parse Storyblok story cache", error);
            }
          }
        }

        setStoriesLoading(true);
        setStoriesError(null);

        try {
          const perPage = 100;
          let page = 1;
          let total = Infinity;
          const aggregated: StorySummary[] = [];

          while (aggregated.length < total) {
            const storiesUrl = `https://api.storyblok.com/v2/cdn/stories?token=${finalToken}&version=draft&per_page=${perPage}&page=${page}`;
            const response = await fetch(storiesUrl);

            if (!response.ok) {
              throw new Error(`Failed to load stories (${response.status})`);
            }

            const data = await response.json();
            const pageStories = Array.isArray(data?.stories) ? data.stories : [];

            const filtered = pageStories
                .filter((item: any) => !item.is_folder)
                .map(
                    (item: any): StorySummary => ({
                      id: item.id,
                      name: item.name || item.slug || "Untitled Story",
                      uuid: item.uuid,
                      fullSlug: item.full_slug || item.slug || "",
                    })
                )
                .filter((item: StorySummary) => Boolean(item.fullSlug));

            aggregated.push(...filtered);

            const totalHeader = response.headers.get("total");
            if (totalHeader) {
              const parsedTotal = Number(totalHeader);
              if (!Number.isNaN(parsedTotal) && parsedTotal > 0) {
                total = parsedTotal;
              }
            }

            if (!pageStories.length || pageStories.length < perPage) {
              break;
            }

            page += 1;
          }

          const uniqueStories = Array.from(
              new Map(aggregated.map((story) => [story.fullSlug, story])).values()
          ).sort((a, b) =>
              a.name.localeCompare(b.name, undefined, {
                sensitivity: "base",
              })
          );

          if (!isMountedRef.current) {
            return;
          }

          const fetchedAt = Date.now();

          setStories(uniqueStories);
          setStoriesFetchedAt(fetchedAt);
          setStoriesError(null);

          try {
            window.localStorage.setItem(
                STORY_LIST_CACHE_KEY,
                JSON.stringify({
                  timestamp: fetchedAt,
                  stories: uniqueStories,
                })
            );
          } catch (storageError) {
            console.warn("Failed to store Storyblok story cache", storageError);
          }
        } catch (error: any) {
          if (!isMountedRef.current) {
            return;
          }
          setStoriesError(error?.message || "Unable to load stories");
          setStories([]);
          setStoriesFetchedAt(null);
          try {
            window.localStorage.removeItem(STORY_LIST_CACHE_KEY);
          } catch {
            // ignore
          }
        } finally {
          if (isMountedRef.current) {
            setStoriesLoading(false);
          }
        }
      },
      [finalToken, mounted]
  );

  useEffect(() => {
    if (!mounted || !finalToken) return;
    fetchAndCacheStories();
  }, [mounted, finalToken, fetchAndCacheStories]);

  useEffect(() => {
    if (!mounted) return;
    if (!finalToken) {
      setStories([]);
      setStoriesFetchedAt(null);
      setStoriesError(null);
      setStoriesLoading(false);
    }
  }, [mounted, finalToken]);

  const handleInvalidateStoryCache = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORY_LIST_CACHE_KEY);
      } catch {
        // ignore removal failure
      }
    }
    fetchAndCacheStories(true);
  }, [fetchAndCacheStories]);

  const handleStorySelect = useCallback(
      (newSlug: string) => {
        if (!newSlug || newSlug === slugReady) {
          return;
        }
        setStoryError(null);
        setSlugReady(newSlug);
      },
      [slugReady]
  );

  // Locales laden
  useEffect(() => {
    if (!mounted || !finalToken) return;

    const fetchLocales = async () => {
      try {
        const spaceUrl = `https://api.storyblok.com/v2/cdn/spaces/me?token=${finalToken}`;
        const resSpace = await fetch(spaceUrl);
        const dataSpace = await resSpace.json();

        if (Array.isArray(dataSpace?.space?.language_codes)) {
          setLocales(["default", ...dataSpace.space.language_codes]);
        } else {
          setLocales(["default"]);
        }
      } catch (err) {
        console.error("Failed to fetch Storyblok locales", err);
        setLocales(["default"]);
      }
    };

    fetchLocales();
  }, [mounted, finalToken]);

  useEffect(() => {
    if (!slugReady) return;
    setCurrentLocale("default");
  }, [slugReady]);

  // Story für aktiven Slug laden
  useEffect(() => {
    if (!slugReady || !finalToken) return;

    if (
        storyData &&
        storyData.story?.full_slug === slugReady &&
        currentLocale === "default"
    ) {
      setStory(storyData);
      setStoryLoading(false);
      setStoryError(null);
      return;
    }

    const controller = new AbortController();
    const storyUrl =
        `https://api.storyblok.com/v2/cdn/stories/${slugReady}?version=${version}&token=${finalToken}` +
        (currentLocale !== "default" ? `&language=${currentLocale}` : "");

    setStoryLoading(true);
    setStoryError(null);

    const fetchStory = async () => {
      try {
        const resStory = await fetch(storyUrl, { signal: controller.signal });

        if (!resStory.ok) {
          throw new Error(`Failed to load story (${resStory.status})`);
        }

        const dataStory = await resStory.json();

        if (controller.signal.aborted || !isMountedRef.current) {
          return;
        }

        if (dataStory?.story) {
          setStory(dataStory);
          setStoryError(null);
        } else {
          setStoryError("Story not found");
          setStory(null);
        }
      } catch (err: any) {
        if (controller.signal.aborted || !isMountedRef.current) {
          return;
        }
        console.error("Failed to fetch Storyblok story", err);
        setStoryError(err?.message || "Failed to load story");
        setStory(null);
      } finally {
        if (!controller.signal.aborted && isMountedRef.current) {
          setStoryLoading(false);
        }
      }
    };

    fetchStory();

    return () => {
      controller.abort();
    };
  }, [slugReady, version, finalToken, currentLocale, storyData]);

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

            {/* Overlay nur, wenn Story verfügbar oder aktuell geladen */}
            {(story || storyLoading) && (
                <StoryblokOverlay
                    story={story}
                    isOpen={overlayOpen}
                    onClose={() => setOverlayOpen(false)}
                    accessToken={finalToken}
                    locales={locales}
                    currentLocale={currentLocale}
                    onLocaleChange={setCurrentLocale}
                    stories={stories}
                    storiesLoading={storiesLoading}
                    storiesError={storiesError}
                    selectedStorySlug={slugReady || ""}
                    onSelectStory={handleStorySelect}
                    onInvalidateStoryCache={handleInvalidateStoryCache}
                    storyLoading={storyLoading}
                    storyError={storyError}
                    storiesFetchedAt={storiesFetchedAt}
                />
            )}
          </>
      );
    }
  }, [
    story,
    storyLoading,
    overlayOpen,
    finalToken,
    locales,
    currentLocale,
    stories,
    storiesLoading,
    storiesError,
    slugReady,
    handleStorySelect,
    handleInvalidateStoryCache,
    storyError,
    storiesFetchedAt,
  ]);

  // Wichtig: NICHTS außerhalb vom Shadow Root rendern
  return <div ref={hostRef} />;
}
