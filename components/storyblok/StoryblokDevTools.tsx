"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { OverlayToggle } from "./OverlayToggle";
import { StoryblokOverlay } from "./StoryblokOverlay";
import { ShadowDomWrapper } from "./ShadowDomWrapper";
import { useMountState } from "./hooks/useMountState";
import { useStorySlug } from "./hooks/useStorySlug";
import { useStoryblokStoryList } from "./hooks/useStoryblokStoryList";
import { useStoryblokLocales } from "./hooks/useStoryblokLocales";
import { useStoryblokStory } from "./hooks/useStoryblokStory";
import type { StoryblokDevToolsProps } from "./types";

export function StoryblokDevTools({
  slug,
  version = "draft",
  storyData,
  initialOpen = false,
  accessToken,
}: StoryblokDevToolsProps) {
  const [overlayOpen, setOverlayOpen] = useState(initialOpen);
  const { mounted, isMountedRef } = useMountState();
  const { slugReady, setSlugReady } = useStorySlug({ slug, mounted });

  const finalToken = useMemo(
    () => accessToken || process.env.NEXT_PUBLIC_STORYBLOK_ACCESS_TOKEN || "",
    [accessToken]
  );

  const {
    locales,
    currentLocale,
    setCurrentLocale,
    resetLocale,
  } = useStoryblokLocales({ token: finalToken, mounted });

  const {
    stories,
    storiesLoading,
    storiesError,
    storiesFetchedAt,
    invalidateStories,
  } = useStoryblokStoryList({ token: finalToken, mounted, isMountedRef });

  const { story, storyLoading, storyError, setStoryError } = useStoryblokStory({
    slug: slugReady,
    token: finalToken,
    version,
    currentLocale,
    initialStory: storyData,
    isMountedRef,
  });

  useEffect(() => {
    if (!slugReady) return;
    resetLocale();
  }, [slugReady, resetLocale]);

  const handleStorySelect = useCallback(
    (newSlug: string) => {
      if (!newSlug || newSlug === slugReady) {
        return;
      }
      setStoryError(null);
      setSlugReady(newSlug);
    },
    [slugReady, setSlugReady, setStoryError]
  );

  const handleInvalidateStoryCache = useCallback(() => {
    invalidateStories();
  }, [invalidateStories]);

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

  const showOverlay = Boolean(story || storyLoading);

  return (
    <ShadowDomWrapper>
      <OverlayToggle onClick={() => setOverlayOpen(true)} />

      {showOverlay && (
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
    </ShadowDomWrapper>
  );
}
