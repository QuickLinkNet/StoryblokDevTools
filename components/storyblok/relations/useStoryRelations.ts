"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  DatasetCache,
  StoryRelationEntry,
  StoryRelationOccurrence,
  StoryblokStoryRecord,
  TraverseContext,
  UseStoryRelationsArgs,
  UseStoryRelationsResult,
} from "../types";

export type {
  StoryRelationEntry,
  StoryRelationOccurrence,
  UseStoryRelationsResult,
} from "../types";

const STORYBLOK_UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SKIP_KEYS = new Set(["_uid", "_editable"]);

function createSnippet(value: string) {
  return value.length > 80 ? `${value.slice(0, 77)}...` : value;
}

function extractComponent(parent: unknown): string | null {
  if (!parent || typeof parent !== "object") {
    return null;
  }
  const candidate = (parent as Record<string, unknown>).component;
  return typeof candidate === "string" ? candidate : null;
}

function traverseContent(
  value: unknown,
  visitor: (context: TraverseContext) => void,
  path = "content",
  key: string | null = null,
  parent: unknown = null,
  visited: WeakSet<object> = new WeakSet()
): void {
  if (value === null || value === undefined) {
    return;
  }

  if (typeof value === "string") {
    visitor({ path, key, value, parent });
    return;
  }

  if (typeof value !== "object") {
    return;
  }

  if (visited.has(value as object)) {
    return;
  }
  visited.add(value as object);

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const nextPath = `${path}[${index}]`;
      traverseContent(item, visitor, nextPath, null, value, visited);
    });
    return;
  }

  for (const [childKey, childValue] of Object.entries(
    value as Record<string, unknown>
  )) {
    if (SKIP_KEYS.has(childKey)) {
      continue;
    }
    const nextPath = path ? `${path}.${childKey}` : childKey;
    traverseContent(childValue, visitor, nextPath, childKey, value, visited);
  }
}

function computeOutboundRelations(
  storyContent: any,
  currentUuid: string,
  storyMap: Map<string, StoryblokStoryRecord>
): StoryRelationEntry[] {
  if (!storyContent || !currentUuid) {
    return [];
  }

  const occurrencesByUuid = new Map<string, StoryRelationOccurrence[]>();

  traverseContent(storyContent, ({ value, path, key, parent }) => {
    const trimmed = value.trim();
    if (!STORYBLOK_UUID_REGEX.test(trimmed)) {
      return;
    }
    if (trimmed === currentUuid) {
      return;
    }
    if (!storyMap.has(trimmed)) {
      return;
    }

    const occurrence: StoryRelationOccurrence = {
      path,
      fieldKey: key,
      snippet: createSnippet(trimmed),
      component: extractComponent(parent),
    };

    const bucket = occurrencesByUuid.get(trimmed);
    if (bucket) {
      bucket.push(occurrence);
    } else {
      occurrencesByUuid.set(trimmed, [occurrence]);
    }
  });

  return Array.from(occurrencesByUuid.entries())
    .map(([uuid, occurrences]) => {
      const referenced = storyMap.get(uuid);
      return {
        storyUuid: uuid,
        storyName:
          referenced?.name || referenced?.full_slug || referenced?.slug || uuid,
        storySlug: referenced?.full_slug || referenced?.slug || "",
        occurrences,
      };
    })
    .sort((a, b) =>
      a.storyName.localeCompare(b.storyName, undefined, {
        sensitivity: "base",
      })
    );
}

function computeInboundRelations(
  dataset: StoryblokStoryRecord[],
  currentUuid: string
): StoryRelationEntry[] {
  if (!dataset.length || !currentUuid) {
    return [];
  }

  const relations: StoryRelationEntry[] = [];

  for (const story of dataset) {
    if (story.is_folder || story.uuid === currentUuid) {
      continue;
    }

    const storyContent = story.content;
    if (!storyContent) {
      continue;
    }

    const occurrences: StoryRelationOccurrence[] = [];

    traverseContent(storyContent, ({ value, path, key, parent }) => {
      if (value.trim() !== currentUuid) {
        return;
      }

      occurrences.push({
        path,
        fieldKey: key,
        snippet: createSnippet(value),
        component: extractComponent(parent),
      });
    });

    if (occurrences.length > 0) {
      relations.push({
        storyUuid: story.uuid,
        storyName: story.name || story.full_slug || story.slug || story.uuid,
        storySlug: story.full_slug || story.slug || "",
        occurrences,
      });
    }
  }

  return relations.sort((a, b) =>
    a.storyName.localeCompare(b.storyName, undefined, {
      sensitivity: "base",
    })
  );
}

async function fetchStoryDataset(
  token: string,
  version: "draft" | "published",
  signal: AbortSignal
): Promise<StoryblokStoryRecord[]> {
  const perPage = 100;
  const aggregated: StoryblokStoryRecord[] = [];
  let page = 1;
  let total = Infinity;

  while (aggregated.length < total) {
    const url = new URL("https://api.storyblok.com/v2/cdn/stories");
    url.searchParams.set("token", token);
    url.searchParams.set("version", version);
    url.searchParams.set("per_page", String(perPage));
    url.searchParams.set("page", String(page));

    const response = await fetch(url.toString(), { signal });
    if (!response.ok) {
      throw new Error(`Failed to load stories (${response.status})`);
    }

    const data = await response.json();
    const pageStories = Array.isArray(data?.stories) ? data.stories : [];

    const filtered = pageStories.filter(
      (item: StoryblokStoryRecord) => !item.is_folder
    );
    aggregated.push(...filtered);

    const totalHeader = response.headers.get("total");
    if (totalHeader) {
      const parsed = Number(totalHeader);
      if (!Number.isNaN(parsed) && parsed > 0) {
        total = parsed;
      }
    }

    if (pageStories.length < perPage) {
      break;
    }

    page += 1;
  }

  return aggregated;
}

const RELATIONS_CACHE_KEY = "storyblokDevTools::relations";
const RELATIONS_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 Stunden

interface RelationsCacheEntry {
  token: string;
  storyUuid: string;
  version: "draft" | "published";
  updatedAt: number;
  inbound: StoryRelationEntry[];
  outbound: StoryRelationEntry[];
  analyzedStories: number;
  datasetSize: number;
  datasetFetchedAt: number | null;
}

type RelationsCacheMap = Record<string, RelationsCacheEntry>;

function getRelationsCacheMap(): RelationsCacheMap {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(RELATIONS_CACHE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed as RelationsCacheMap;
    }
  } catch (error) {
    console.warn("Failed to parse Story relations cache", error);
  }
  return {};
}

function persistRelationsCacheMap(map: RelationsCacheMap) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(RELATIONS_CACHE_KEY, JSON.stringify(map));
  } catch (error) {
    console.warn("Failed to persist Story relations cache", error);
  }
}

function makeRelationsCacheKey(
  token: string,
  version: "draft" | "published",
  storyUuid: string
) {
  return `${token}::${version}::${storyUuid}`;
}

function getRelationsCacheEntry(
  token: string,
  version: "draft" | "published",
  storyUuid: string
): RelationsCacheEntry | null {
  if (!token || !storyUuid) {
    return null;
  }
  const map = getRelationsCacheMap();
  const cacheKey = makeRelationsCacheKey(token, version, storyUuid);
  const entry = map[cacheKey];
  if (!entry) {
    return null;
  }
  if (Date.now() - entry.updatedAt > RELATIONS_CACHE_TTL) {
    delete map[cacheKey];
    persistRelationsCacheMap(map);
    return null;
  }
  return entry;
}

function setRelationsCacheEntry(
  token: string,
  version: "draft" | "published",
  storyUuid: string,
  entry: Omit<
    RelationsCacheEntry,
    "token" | "storyUuid" | "version" | "updatedAt"
  >
) {
  if (!token || !storyUuid) {
    return;
  }
  const map = getRelationsCacheMap();
  const cacheKey = makeRelationsCacheKey(token, version, storyUuid);
  const now = Date.now();

  map[cacheKey] = {
    token,
    storyUuid,
    version,
    updatedAt: now,
    ...entry,
  };

  for (const [key, value] of Object.entries(map)) {
    if (now - value.updatedAt > RELATIONS_CACHE_TTL) {
      delete map[key];
    }
  }

  persistRelationsCacheMap(map);
}

function clearRelationsCache() {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(RELATIONS_CACHE_KEY);
  } catch (error) {
    console.warn("Failed to clear Story relations cache", error);
  }
}

export function useStoryRelations({
  story,
  accessToken,
  version = "draft",
}: UseStoryRelationsArgs): UseStoryRelationsResult {
  const storyUuid: string = story?.story?.uuid || "";
  const storyContent = story?.story?.content;

  const [inbound, setInbound] = useState<StoryRelationEntry[]>([]);
  const [outbound, setOutbound] = useState<StoryRelationEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [datasetMeta, setDatasetMeta] = useState<DatasetCache | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [analyzedStories, setAnalyzedStories] = useState(0);
  const [datasetSize, setDatasetSize] = useState(0);
  const [datasetFetchedAtState, setDatasetFetchedAt] = useState<number | null>(
    null
  );

  const abortRef = useRef<AbortController | null>(null);
  const lastAnalyzedRef = useRef<{
    uuid: string | null;
    contentRef: any | null;
    token: string | null;
  }>({
    uuid: null,
    contentRef: null,
    token: null,
  });
  const lastStoryUuidRef = useRef<string | null>(null);

  const datasetStories = datasetMeta?.stories;
  const datasetFetchedAt = datasetFetchedAtState;

  const performAnalysis = useCallback(
    async (options: { force?: boolean } = {}) => {
      if (!storyUuid) {
        setError("Keine Story-UUID verfügbar.");
        setInbound([]);
        setOutbound([]);
        return;
      }

      if (!accessToken) {
        setError("Kein Storyblok Preview Token gefunden.");
        setInbound([]);
        setOutbound([]);
        return;
      }

      if (!options.force) {
        const cached = getRelationsCacheEntry(accessToken, version, storyUuid);
        if (cached) {
          setInbound(cached.inbound);
          setOutbound(cached.outbound);
          setAnalyzedStories(
            cached.analyzedStories ?? cached.datasetSize ?? 0
          );
          setLastUpdated(cached.updatedAt);
          setDatasetSize(cached.datasetSize);
          setDatasetFetchedAt(cached.datasetFetchedAt ?? cached.updatedAt);
          setError(null);
          setLoading(false);
          lastAnalyzedRef.current = {
            uuid: storyUuid,
            contentRef: storyContent,
            token: accessToken,
          };
          return;
        }
      }

      const isCachedDataset =
        datasetMeta &&
        datasetMeta.token === accessToken &&
        Array.isArray(datasetStories) &&
        datasetStories.length > 0;
      const alreadyAnalyzed =
        !options.force &&
        lastAnalyzedRef.current.uuid === storyUuid &&
        lastAnalyzedRef.current.contentRef === storyContent &&
        lastAnalyzedRef.current.token === accessToken &&
        isCachedDataset;

      if (alreadyAnalyzed) {
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        let storiesDataset = Array.isArray(datasetStories)
          ? datasetStories
          : [];

        let datasetWasFetched = false;
        let datasetFetchedAtValue =
          datasetMeta?.fetchedAt ?? datasetFetchedAtState ?? null;

        if (!isCachedDataset || options.force) {
          storiesDataset = await fetchStoryDataset(
            accessToken,
            version,
            controller.signal
          );
          datasetWasFetched = true;
          if (!controller.signal.aborted) {
            const fetchedAt = Date.now();
            datasetFetchedAtValue = fetchedAt;
            setDatasetMeta({
              token: accessToken,
              stories: storiesDataset,
              fetchedAt,
            });
            setDatasetFetchedAt(fetchedAt);
          }
        }

        if (controller.signal.aborted) {
          return;
        }

        setAnalyzedStories(storiesDataset.length);
        if (!datasetWasFetched) {
          if (!datasetFetchedAtValue) {
            datasetFetchedAtValue = Date.now();
          }
          setDatasetFetchedAt(datasetFetchedAtValue);
        }
        setDatasetSize(storiesDataset.length);

        const outboundRelations = computeOutboundRelations(
          storyContent,
          storyUuid,
          new Map(
            storiesDataset.map((item) => [item.uuid, item])
          )
        );

        const inboundRelations = computeInboundRelations(
          storiesDataset,
          storyUuid
        );

        if (controller.signal.aborted) {
          return;
        }

        setOutbound(outboundRelations);
        setInbound(inboundRelations);
        setLastUpdated(Date.now());
        lastAnalyzedRef.current = {
          uuid: storyUuid,
          contentRef: storyContent,
          token: accessToken,
        };

        setRelationsCacheEntry(accessToken, version, storyUuid, {
          inbound: inboundRelations,
          outbound: outboundRelations,
          analyzedStories: storiesDataset.length,
          datasetSize: storiesDataset.length,
          datasetFetchedAt: datasetFetchedAtValue ?? Date.now(),
        });
      } catch (err: unknown) {
        if ((err as Error).name === "AbortError") {
          return;
        }
        console.error("Relations analysis failed", err);
        setError(
          err instanceof Error
            ? err.message
            : "Die Relations-Analyse ist fehlgeschlagen."
        );
        setInbound([]);
        setOutbound([]);
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [
      accessToken,
      datasetMeta,
      datasetStories,
      storyContent,
      storyUuid,
      version,
    ]
  );

  useEffect(() => {
    if (
      lastStoryUuidRef.current &&
      storyUuid &&
      storyUuid !== lastStoryUuidRef.current
    ) {
      clearRelationsCache();
      setInbound([]);
      setOutbound([]);
      setDatasetMeta(null);
      setDatasetFetchedAt(null);
      setDatasetSize(0);
      setAnalyzedStories(0);
      setLastUpdated(null);
      setError(null);
    }
    lastStoryUuidRef.current = storyUuid || null;
  }, [storyUuid]);

  useEffect(() => {
    performAnalysis();
    return () => {
      abortRef.current?.abort();
    };
  }, [performAnalysis]);

  const refresh = useCallback(
    (options: { force?: boolean } = {}) => {
      performAnalysis({ force: options.force ?? true });
    },
    [performAnalysis]
  );

  return {
    inbound,
    outbound,
    loading,
    error,
    refresh,
    lastUpdated,
    datasetSize,
    analyzedStories,
    datasetFetchedAt,
  };
}
