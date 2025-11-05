"use client";

import type {
  ComponentPropsWithoutRef,
  MutableRefObject,
  ReactNode,
} from "react";
import type { LucideIcon } from "lucide-react";

// Core Storyblok entities
export interface StoryData {
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

export interface StorySummary {
  id: number;
  name: string;
  uuid: string;
  fullSlug: string;
}

// Storyblok DevTools
export interface StoryblokDevToolsProps {
  slug?: string;
  version?: "draft" | "published";
  storyData?: StoryData;
  initialOpen?: boolean;
  accessToken?: string;
}

export interface OverlayToggleProps {
  onClick: () => void;
}

export interface ShadowDomWrapperProps {
  children: ReactNode;
}

// Story selector
export interface StorySelectorOption {
  id: number;
  name: string;
  uuid: string;
  fullSlug: string;
}

export interface StorySelectorProps {
  options: StorySelectorOption[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
  disabled?: boolean;
  loading?: boolean;
  updatedAt?: number | null;
}

// Overlay tabs
export type StoryblokOverlayTabId =
  | "info"
  | "blocks"
  | "assets"
  | "performance"
  | "dev"
  | "fields"
  | "actions"
  | "seo"
  | "relations"
  | "json";

export interface StoryblokOverlayTab {
  id: StoryblokOverlayTabId;
  label: string;
  icon: LucideIcon;
}

export interface StoryblokOverlayTabsProps {
  tabs: ReadonlyArray<StoryblokOverlayTab>;
  activeTab: StoryblokOverlayTabId;
  onSelect: (tabId: StoryblokOverlayTabId) => void;
}

// Overlay components
export interface StoryblokOverlayProps {
  story: any | null;
  isOpen?: boolean;
  onClose?: () => void;
  accessToken?: string;
  locales?: string[];
  currentLocale?: string;
  onLocaleChange?: (locale: string) => void;
  stories?: StorySelectorOption[];
  storiesLoading?: boolean;
  storiesError?: string | null;
  selectedStorySlug?: string;
  onSelectStory?: (slug: string) => void;
  onInvalidateStoryCache?: () => void;
  storyLoading?: boolean;
  storyError?: string | null;
  storiesFetchedAt?: number | null;
}

export interface StoryblokOverlayAlertsProps {
  storiesError: string | null;
  storyError: string | null;
}

export type StoryblokOverlayAlertVariant = "error" | "warning";

export interface StoryblokOverlayAlertProps {
  variant: StoryblokOverlayAlertVariant;
  message: string;
}

export interface StoryblokOverlayHeaderProps {
  storyName: string;
  storyLoading: boolean;
  hasAccessToken: boolean;
  storyOptions: StorySelectorOption[];
  storySelectValue: string;
  onSelectStory: (slug: string) => void;
  onInvalidateStoryCache: () => void;
  storiesLoading: boolean;
  storiesFetchedAt: number | null;
  locales: string[];
  currentLocale: string;
  onLocaleChange: (locale: string) => void;
  onClose: () => void;
}

export interface OverlayTitleProps {
  storyName: string;
  storyLoading: boolean;
}

export interface OverlayActionsProps {
  hasAccessToken: boolean;
  storyOptions: StorySelectorOption[];
  storySelectValue: string;
  onSelectStory: (slug: string) => void;
  onInvalidateStoryCache: () => void;
  storiesLoading: boolean;
  storiesFetchedAt: number | null;
  showLocaleSwitcher: boolean;
  locales: string[];
  currentLocale: string;
  onLocaleChange: (locale: string) => void;
  onClose: () => void;
}

export interface HeaderLocaleSwitcherProps {
  locales: string[];
  currentLocale: string;
  onLocaleChange: (locale: string) => void;
}

export type SvgIconProps = ComponentPropsWithoutRef<"svg">;

// Hook option types
export interface UseStorySlugOptions {
  slug?: string;
  mounted: boolean;
}

export interface UseStoryblokLocalesOptions {
  token: string;
  mounted: boolean;
}

export interface UseStoryblokStoryListOptions {
  token: string;
  mounted: boolean;
  isMountedRef: MutableRefObject<boolean>;
}

export interface UseStoryblokStoryOptions {
  slug?: string | null;
  token: string;
  version: "draft" | "published";
  currentLocale: string;
  initialStory?: StoryData | null;
  isMountedRef: MutableRefObject<boolean>;
}

// Story relations
export interface StoryblokStoryRecord {
  id: number;
  uuid: string;
  slug?: string;
  name?: string;
  full_slug?: string;
  is_folder?: boolean;
  content?: any;
}

export interface StoryRelationOccurrence {
  path: string;
  fieldKey: string | null;
  snippet: string;
  component: string | null;
}

export interface StoryRelationEntry {
  storyUuid: string;
  storyName: string;
  storySlug: string;
  occurrences: StoryRelationOccurrence[];
}

export interface DatasetCache {
  token: string;
  stories: StoryblokStoryRecord[];
  fetchedAt: number;
}

export interface UseStoryRelationsArgs {
  story: any | null;
  accessToken?: string;
  version?: "draft" | "published";
}

export interface UseStoryRelationsResult {
  inbound: StoryRelationEntry[];
  outbound: StoryRelationEntry[];
  loading: boolean;
  error: string | null;
  refresh: (options?: { force?: boolean }) => void;
  lastUpdated: number | null;
  datasetSize: number;
  analyzedStories: number;
  datasetFetchedAt: number | null;
}

export interface TraverseContext {
  path: string;
  key: string | null;
  value: string;
  parent: unknown;
}

// Tab-specific data
export interface Asset {
  type: "image" | "video" | "file";
  url: string;
  filename?: string;
  alt?: string;
  title?: string;
  name?: string;
  id?: string | number;
  copyright?: string;
  fieldtype?: string;
  isExternal?: boolean;
}

export interface FieldAnalysis {
  path: string;
  value: any;
  isEmpty: boolean;
  type: string;
}

export interface RelationsTabProps {
  story: any | null;
  accessToken?: string;
}

export interface SummaryCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: ReactNode;
  accentClass: string;
  iconBgClass: string;
}

export interface RelationListProps {
  title: string;
  entries: StoryRelationEntry[];
  accentClass: string;
  badgeClass: string;
}
