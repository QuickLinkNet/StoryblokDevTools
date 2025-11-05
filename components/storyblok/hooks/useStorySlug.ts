"use client";

import { useEffect, useState } from "react";
import type { UseStorySlugOptions } from "../types";

export function useStorySlug({ slug, mounted }: UseStorySlugOptions) {
  const [slugReady, setSlugReady] = useState<string | null>(null);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    if (slug) {
      setSlugReady(slug);
      return;
    }

    const currentPath = window.location.pathname;
    if (currentPath === "/" || currentPath === "") {
      setSlugReady("home");
    } else {
      setSlugReady(
        currentPath.startsWith("/") ? currentPath.slice(1) : currentPath
      );
    }
  }, [mounted, slug]);

  return { slugReady, setSlugReady };
}
