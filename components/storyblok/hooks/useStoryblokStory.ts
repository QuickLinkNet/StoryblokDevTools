"use client";

import { useEffect, useState } from "react";
import type { StoryData, UseStoryblokStoryOptions } from "../types";

export function useStoryblokStory({
  slug,
  token,
  version,
  currentLocale,
  initialStory,
  isMountedRef,
}: UseStoryblokStoryOptions) {
  const [story, setStory] = useState<StoryData | null>(initialStory || null);
  const [storyLoading, setStoryLoading] = useState(false);
  const [storyError, setStoryError] = useState<string | null>(null);

  useEffect(() => {
    if (initialStory) {
      setStory(initialStory);
      setStoryError(null);
      setStoryLoading(false);
    }
  }, [initialStory]);

  useEffect(() => {
    if (!slug || !token) return;

    if (
      initialStory &&
      initialStory.story?.full_slug === slug &&
      currentLocale === "default"
    ) {
      setStory(initialStory);
      setStoryLoading(false);
      setStoryError(null);
      return;
    }

    const controller = new AbortController();
    const storyUrl =
      `https://api.storyblok.com/v2/cdn/stories/${slug}?version=${version}&token=${token}` +
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
  }, [slug, version, token, currentLocale, initialStory, isMountedRef]);

  return {
    story,
    storyLoading,
    storyError,
    setStoryError,
  };
}
