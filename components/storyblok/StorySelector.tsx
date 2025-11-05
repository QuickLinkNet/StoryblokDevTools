"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import type {
  StorySelectorOption,
  StorySelectorProps,
} from "./types";

export type { StorySelectorOption, StorySelectorProps } from "./types";

export function StorySelector({
  options,
  selectedSlug,
  onSelect,
  disabled = false,
  loading = false,
  updatedAt = null,
}: StorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const highlightIndexRef = useRef(0);

  const selectedOption = useMemo(
    () => options.find((option) => option.fullSlug === selectedSlug) || null,
    [options, selectedSlug]
  );

  const filteredOptions = useMemo(() => {
    if (!query.trim()) {
      return options;
    }
    const q = query.trim().toLowerCase();
    const matches = options.filter((option) => {
      const haystack = `${option.name} ${option.fullSlug}`.toLowerCase();
      return haystack.includes(q);
    });

    if (
      selectedSlug &&
      !matches.some((option) => option.fullSlug === selectedSlug)
    ) {
      const current = options.find(
        (option) => option.fullSlug === selectedSlug
      );
      if (current) {
        matches.unshift(current);
      }
    }

    return matches;
  }, [options, query, selectedSlug]);

  const formattedUpdatedAt = useMemo(() => {
    if (!updatedAt) return null;
    return new Date(updatedAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [updatedAt]);

  const buttonLabel = selectedOption ? selectedOption.name : "Select story";
  const truncatedButtonLabel =
    buttonLabel.length > 42
      ? `${buttonLabel.slice(0, 39)}…`
      : buttonLabel;

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      if (hasInitializedRef.current) {
        setQuery("");
      }
      setHighlightIndex(0);
      highlightIndexRef.current = 0;
      return;
    }

    hasInitializedRef.current = true;

    const selectedIndex = filteredOptions.findIndex(
      (option) => option.fullSlug === selectedSlug
    );
    const initialIndex = selectedIndex >= 0 ? selectedIndex : 0;
    setHighlightIndex(initialIndex);
    highlightIndexRef.current = initialIndex;

    const rAF = requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
    });

    return () => cancelAnimationFrame(rAF);
  }, [open, filteredOptions, selectedSlug]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current) return;
      const path = event.composedPath();
      if (!path.includes(menuRef.current)) {
        handleClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!open) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
        return;
      }

      if (!filteredOptions.length) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        const next =
          highlightIndexRef.current + 1 < filteredOptions.length
            ? highlightIndexRef.current + 1
            : 0;
        highlightIndexRef.current = next;
        setHighlightIndex(next);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        const next =
          highlightIndexRef.current - 1 >= 0
            ? highlightIndexRef.current - 1
            : filteredOptions.length - 1;
        highlightIndexRef.current = next;
        setHighlightIndex(next);
      } else if (event.key === "Enter") {
        event.preventDefault();
        const option = filteredOptions[highlightIndexRef.current];
        if (option) {
          onSelect(option.fullSlug);
          handleClose();
        }
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, filteredOptions, handleClose, onSelect]);

  const handleToggleOpen = () => {
    if (disabled) return;
    setOpen((prev) => !prev);
  };

  const handleSelect = (slug: string) => {
    if (!slug) return;
    onSelect(slug);
    handleClose();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggleOpen}
        disabled={disabled}
        className="story-selector-trigger flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 text-left text-slate-200 text-sm border border-slate-600 hover:bg-slate-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="story-selector-menu"
      >
        <span className="truncate">{truncatedButtonLabel}</span>
        <ChevronDown
          className={`w-4 h-4 ml-auto transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          ref={menuRef}
          id="story-selector-menu"
          className="story-selector-panel absolute right-0 mt-2 rounded-xl border border-slate-700 bg-slate-900 shadow-xl shadow-black/30 overflow-hidden"
          style={{ zIndex: 1000000 }}
        >
          <div className="p-3 border-b border-slate-800 bg-slate-900/60">
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search stories…"
              aria-label="Search stories"
              className="w-full px-3 py-2 rounded-lg bg-slate-800 text-slate-100 text-sm border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-slate-400"
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <ul
            role="listbox"
            aria-label="Story list"
          className="max-h-48 min-h-[180px] overflow-y-auto overscroll-contain py-1 sb-scrollbar"
          >
            {!filteredOptions.length && (
              <li className="px-4 py-3 text-xs text-slate-400">
                {loading ? "Loading stories…" : "No matches found"}
              </li>
            )}

            {filteredOptions.map((option, index) => {
              const isActive = option.fullSlug === selectedSlug;
              const isHighlighted = index === highlightIndex;

              return (
                <li key={option.uuid || option.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      isHighlighted
                        ? "bg-cyan-600/20 text-white"
                        : "text-slate-200 hover:bg-slate-800"
                    } ${isActive ? "font-semibold" : ""}`}
                    onMouseEnter={() => {
                      highlightIndexRef.current = index;
                      setHighlightIndex(index);
                    }}
                    onClick={() => handleSelect(option.fullSlug)}
                  >
                    <span className="block truncate">{option.name}</span>
                    <span className="block text-[11px] text-slate-400 truncate">
                      {option.fullSlug}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="px-4 py-2 text-[11px] text-slate-500 border-t border-slate-800 bg-slate-900/70 flex items-center justify-between">
            <span>
              {filteredOptions.length}{" "}
              {filteredOptions.length === 1 ? "match" : "matches"}
            </span>
            {formattedUpdatedAt && (
              <span className="ml-2 text-slate-400">
                Updated {formattedUpdatedAt}
              </span>
            )}
          </div>
        </div>
      )}

      {open && loading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-cyan-400" />
      )}
    </div>
  );
}
