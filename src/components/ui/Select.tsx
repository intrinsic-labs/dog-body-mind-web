"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

export type SelectOption = {
  value: string;
  label: string;
};

export interface SelectProps {
  id?: string;
  label?: string; // accessible label (sr-only by default)
  value: string;
  onChange: (value: string) => void;

  options: SelectOption[];

  placeholder?: string;

  disabled?: boolean;
  className?: string;

  /**
   * When true, renders label visually hidden (recommended when you have nearby text).
   * If false, label renders above the control.
   */
  srOnlyLabel?: boolean;
}

/**
 * Custom popover-style select that matches the site’s pill/rounded input aesthetic.
 * - Keyboard: Enter/Space to open, Esc to close, ArrowUp/Down to move, Enter to select.
 * - Click outside to close.
 * - No external deps.
 */
export default function Select({
  id,
  label = "Select",
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled = false,
  className = "",
  srOnlyLabel = true,
}: SelectProps) {
  const reactId = useId();
  const controlId = id || `select-${reactId}`;
  const listboxId = `${controlId}-listbox`;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(() => {
    const idx = options.findIndex((o) => o.value === value);
    return idx >= 0 ? idx : 0;
  });

  const selectedOption = useMemo(
    () => options.find((o) => o.value === value) || null,
    [options, value],
  );

  useEffect(() => {
    const idx = options.findIndex((o) => o.value === value);
    if (idx >= 0) setActiveIndex(idx);
  }, [options, value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    function onDocPointerDown(e: MouseEvent | PointerEvent) {
      const target = e.target as Node | null;
      if (!target) return;
      if (!rootRef.current?.contains(target)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onDocPointerDown);
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  }, [open]);

  // Close on scroll (nice for popovers)
  useEffect(() => {
    if (!open) return;
    function onScroll() {
      setOpen(false);
    }
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [open]);

  function clampIndex(i: number) {
    if (options.length === 0) return 0;
    return Math.max(0, Math.min(options.length - 1, i));
  }

  function commitSelection(nextValue: string) {
    onChange(nextValue);
    setOpen(false);
    // restore focus to button for good a11y flow
    requestAnimationFrame(() => buttonRef.current?.focus());
  }

  function onButtonKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((i) => clampIndex(i + 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((i) => clampIndex(i - 1));
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((v) => !v);
      return;
    }
    if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        setOpen(false);
      }
      return;
    }
  }

  function onListboxKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      requestAnimationFrame(() => buttonRef.current?.focus());
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => clampIndex(i + 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => clampIndex(i - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const opt = options[activeIndex];
      if (opt) commitSelection(opt.value);
      return;
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <label
        htmlFor={controlId}
        className={
          srOnlyLabel
            ? "sr-only"
            : "block text-sm font-medium text-foreground/70 mb-2"
        }
      >
        {label}
      </label>

      <button
        ref={buttonRef}
        id={controlId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={onButtonKeyDown}
        className={[
          // Match the NewsletterSignup pill vibe but in site background
          "w-full border-2 px-5 py-3 text-left transition",
          "bg-white border-white",
          "hover:border-blue/50",
          "focus:outline-none",
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
      >
        <span className="flex items-center justify-between gap-3">
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          {/* caret */}
          <svg
            className={`h-4 w-4 flex-shrink-0 text-foreground/70 transition-transform ${
              open ? "rotate-180" : ""
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          id={listboxId}
          tabIndex={-1}
          aria-labelledby={controlId}
          onKeyDown={onListboxKeyDown}
          className={[
            "absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-foreground/10",
            "bg-white shadow-sm",
          ].join(" ")}
        >
          <div className="max-h-72 overflow-auto py-1">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-foreground/60">
                No options
              </div>
            ) : (
              options.map((opt, idx) => {
                const selected = opt.value === value;
                const active = idx === activeIndex;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => commitSelection(opt.value)}
                    className={[
                      "w-full text-left px-4 py-2.5 text-sm transition",
                      active ? "bg-blue/10" : "",
                      selected ? "text-blue font-medium" : "text-foreground",
                      "hover:bg-blue/10",
                    ].join(" ")}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="truncate">{opt.label}</span>
                      {selected && (
                        <svg
                          className="h-4 w-4 flex-shrink-0 text-blue"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.07 7.112a1 1 0 0 1-1.414.01L3.29 8.936a1 1 0 1 1 1.414-1.414l4.22 4.22 6.364-6.4a1 1 0 0 1 1.416-.052Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
