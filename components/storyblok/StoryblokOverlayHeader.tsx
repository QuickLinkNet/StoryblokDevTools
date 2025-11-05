"use client";

import { useId } from "react";
import {
  Code,
  Loader2,
  RotateCcw,
  X,
} from "lucide-react";
import { StorySelector } from "./StorySelector";
import type {
  HeaderLocaleSwitcherProps,
  OverlayActionsProps,
  OverlayTitleProps,
  StoryblokOverlayHeaderProps,
  StorySelectorOption,
  SvgIconProps,
} from "./types";

const iconButtonClassName =
  "inline-flex h-8 items-center justify-center rounded-lg border border-slate-600 bg-slate-700 px-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-60";

export function StoryblokOverlayHeader({
  storyName,
  storyLoading,
  hasAccessToken,
  storyOptions,
  storySelectValue,
  onSelectStory,
  onInvalidateStoryCache,
  storiesLoading,
  storiesFetchedAt,
  locales,
  currentLocale,
  onLocaleChange,
  onClose,
}: StoryblokOverlayHeaderProps) {
  const showLocaleSwitcher = locales.length > 1;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-700 bg-slate-800/95 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <OverlayTitle storyName={storyName} storyLoading={storyLoading} />
        <OverlayActions
          hasAccessToken={hasAccessToken}
          storyOptions={storyOptions}
          storySelectValue={storySelectValue}
          onSelectStory={onSelectStory}
          onInvalidateStoryCache={onInvalidateStoryCache}
          storiesLoading={storiesLoading}
          storiesFetchedAt={storiesFetchedAt}
          showLocaleSwitcher={showLocaleSwitcher}
          locales={locales}
          currentLocale={currentLocale}
          onLocaleChange={onLocaleChange}
          onClose={onClose}
        />
      </div>
      {!hasAccessToken && (
        <p className="mt-2 text-right text-[11px] text-amber-300">
          Add a Storyblok Developer Token to enable story switching.
        </p>
      )}
    </header>
  );
}

function OverlayTitle({
  storyName,
  storyLoading,
}: OverlayTitleProps) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <Code className="h-6 w-6 animate-sb-pulse text-blue-400" />
      <div className="min-w-0">
        <p className="text-lg font-bold text-white">
          Storyblok DevTools
        </p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
          <span
            className="max-w-[220px] truncate sm:max-w-[260px] lg:max-w-[280px]"
            title={storyName}
          >
            {storyName}
          </span>
          {storyLoading && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
          )}
        </div>
      </div>
    </div>
  );
}

function OverlayActions({
  hasAccessToken,
  storyOptions,
  storySelectValue,
  onSelectStory,
  onInvalidateStoryCache,
  storiesLoading,
  storiesFetchedAt,
  showLocaleSwitcher,
  locales,
  currentLocale,
  onLocaleChange,
  onClose,
}: OverlayActionsProps) {
  const disableStorySwitching =
    !hasAccessToken || storyOptions.length === 0;
  const disableRefresh = storiesLoading || !hasAccessToken;

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
      <div className="flex-none min-w-[180px]">
        <StorySelector
          options={storyOptions}
          selectedSlug={storySelectValue}
          onSelect={onSelectStory}
          disabled={disableStorySwitching}
          loading={storiesLoading}
          updatedAt={storiesFetchedAt}
        />
      </div>

      <button
        type="button"
        onClick={onInvalidateStoryCache}
        disabled={disableRefresh}
        className={`${iconButtonClassName} gap-2`}
        aria-label="Refresh story list"
        title="Refresh story list"
      >
        {storiesLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RotateCcw className="h-4 w-4" />
        )}
        <span>Reload Stories</span>
      </button>

      {showLocaleSwitcher && (
        <div className="flex-none">
          <HeaderLocaleSwitcher
            locales={locales}
            currentLocale={currentLocale}
            onLocaleChange={onLocaleChange}
          />
        </div>
      )}

      <a
        href="https://www.youtube.com/@APIAnarchistProgrammersInc-f4i/videos"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-lg bg-red-600 px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
        title="Visit API Anarchist Programmers Inc. on YouTube"
      >
        <YouTubeIcon className="h-4 w-4 flex-shrink-0" />
        <span className="sm:show whitespace-nowrap">
          API Anarchist Programmers Inc.
        </span>
      </a>

      <button
        type="button"
        onClick={onClose}
        className={`${iconButtonClassName} w-10 px-0`}
        aria-label="Close overlay"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

function HeaderLocaleSwitcher({
  locales,
  currentLocale,
  onLocaleChange,
}: HeaderLocaleSwitcherProps) {
  const selectId = useId();

  return (
    <div className="inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-lg border border-slate-600 bg-slate-700 px-3 text-sm text-slate-200">
      <label
        htmlFor={selectId}
        className="text-[11px] tracking-wide text-slate-300"
      >
        Locale
      </label>
      <select
        id={selectId}
        value={currentLocale}
        onChange={(event) => onLocaleChange(event.target.value)}
        className="rounded-md border border-transparent bg-slate-800 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {locale === "default" ? "Default" : locale.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}

function YouTubeIcon(props: SvgIconProps) {
  const { className, ...rest } = props;

  return (
    <svg
      {...rest}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M23.498 6.186a2.974 2.974 0 0 0-2.096-2.106C19.2 3.5 12 3.5 12 3.5s-7.2 0-9.402.58A2.974 2.974 0 0 0 .502 6.186 30.215 30.215 0 0 0 0 12a30.215 30.215 0 0 0 .502 5.814 2.974 2.974 0 0 0 2.096 2.106C4.8 20.5 12 20.5 12 20.5s7.2 0 9.402-.58a2.974 2.974 0 0 0 2.096-2.106A30.215 30.215 0 0 0 24 12a30.215 30.215 0 0 0-.502-5.814zM9.75 15.5v-7l6 3.5-6 3.5z" />
    </svg>
  );
}
