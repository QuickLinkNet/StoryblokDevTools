"use client";

import { useCallback, useEffect, useState } from "react";
import type { UseStoryblokLocalesOptions } from "../types";

const DEFAULT_LOCALE = "default";

export function useStoryblokLocales({
  token,
  mounted,
}: UseStoryblokLocalesOptions) {
  const [locales, setLocales] = useState<string[]>([DEFAULT_LOCALE]);
  const [currentLocale, setCurrentLocale] = useState<string>(DEFAULT_LOCALE);

  useEffect(() => {
    if (!mounted || !token) return;

    const fetchLocales = async () => {
      try {
        const spaceUrl = `https://api.storyblok.com/v2/cdn/spaces/me?token=${token}`;
        const resSpace = await fetch(spaceUrl);
        const dataSpace = await resSpace.json();

        if (Array.isArray(dataSpace?.space?.language_codes)) {
          setLocales([DEFAULT_LOCALE, ...dataSpace.space.language_codes]);
        } else {
          setLocales([DEFAULT_LOCALE]);
        }
      } catch (err) {
        console.error("Failed to fetch Storyblok locales", err);
        setLocales([DEFAULT_LOCALE]);
      }
    };

    fetchLocales();
  }, [mounted, token]);

  useEffect(() => {
    if (!token) {
      setLocales([DEFAULT_LOCALE]);
      setCurrentLocale(DEFAULT_LOCALE);
    }
  }, [token]);

  const resetLocale = useCallback(
    () => setCurrentLocale(DEFAULT_LOCALE),
    []
  );

  return {
    locales,
    currentLocale,
    setCurrentLocale,
    resetLocale,
  };
}
