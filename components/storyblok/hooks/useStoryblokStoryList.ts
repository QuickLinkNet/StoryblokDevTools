"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  StorySummary,
  UseStoryblokStoryListOptions,
} from "../types";

const STORY_LIST_CACHE_KEY = "storyblokDevTools::storyList";
const STORY_LIST_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function useStoryblokStoryList({
  token,
  mounted,
  isMountedRef,
}: UseStoryblokStoryListOptions) {
  const [stories, setStories] = useState<StorySummary[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [storiesError, setStoriesError] = useState<string | null>(null);
  const [storiesFetchedAt, setStoriesFetchedAt] = useState<number | null>(null);

  const fetchAndCacheStories = useCallback(
    async (forceRefresh: boolean = false) => {
      if (!mounted || !token) {
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
          const storiesUrl = `https://api.storyblok.com/v2/cdn/stories?token=${token}&version=draft&per_page=${perPage}&page=${page}`;
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

        if (!isMountedRef.current) {
          return;
        }

        const fetchedAt = Date.now();

        const uniqueStories = Array.from(
          new Map(aggregated.map((story) => [story.fullSlug, story])).values()
        ).sort((a, b) =>
          a.name.localeCompare(b.name, undefined, {
            sensitivity: "base",
          })
        );

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
          // ignore cache removal failure
        }
      } finally {
        if (isMountedRef.current) {
          setStoriesLoading(false);
        }
      }
    },
    [mounted, token, isMountedRef]
  );

  useEffect(() => {
    if (!mounted || !token) return;
    fetchAndCacheStories();
  }, [mounted, token, fetchAndCacheStories]);

  useEffect(() => {
    if (!mounted) return;
    if (!token) {
      setStories([]);
      setStoriesFetchedAt(null);
      setStoriesError(null);
      setStoriesLoading(false);
    }
  }, [mounted, token]);

  const invalidateStories = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORY_LIST_CACHE_KEY);
      } catch {
        // ignore removal failure
      }
    }
    fetchAndCacheStories(true);
  }, [fetchAndCacheStories]);

  return {
    stories,
    storiesLoading,
    storiesError,
    storiesFetchedAt,
    invalidateStories,
  };
}
