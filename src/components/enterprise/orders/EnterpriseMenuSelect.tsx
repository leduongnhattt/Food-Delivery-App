"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type EnterpriseMenuSelectOption = { value: string; label: string };

type Props = {
  value: string;
  onChange: (next: string) => void;
  options: EnterpriseMenuSelectOption[];
  /** Wrapper width / layout */
  className?: string;
  /** Extra classes on the trigger button (e.g. segmented left segment) */
  triggerClassName?: string;
  /** Dropdown panel min-width / width */
  menuClassName?: string;
  alignMenu?: "left" | "right";
  "aria-label"?: string;
  /** When true, trigger has no ring (use inside a bordered parent) */
  borderlessTrigger?: boolean;
};

/**
 * Custom dropdown matching admin list filters (ring inset, shadow menu, slate hover).
 */
export function EnterpriseMenuSelect({
  value,
  onChange,
  options,
  className = "",
  triggerClassName = "",
  menuClassName = "",
  alignMenu = "left",
  "aria-label": ariaLabel,
  borderlessTrigger = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const pick = useCallback(
    (v: string) => {
      onChange(v);
      setOpen(false);
    },
    [onChange],
  );

  const triggerRing = borderlessTrigger
    ? "border-0 ring-0 shadow-none focus:ring-0 focus-visible:ring-0"
    : "ring ring-inset ring-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-300";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative inline-flex h-9 min-h-9 w-full items-center border-0 bg-white px-3 py-0 text-left text-[13px] text-slate-900 transition-colors disabled:cursor-not-allowed disabled:opacity-75 md:text-[13px]",
          borderlessTrigger ? null : "rounded",
          triggerRing,
          "pe-10",
          triggerClassName,
        )}
      >
        <span className="truncate">{selected?.label ?? value}</span>
        <ChevronDown
          className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className={`absolute z-[100] mt-2 max-h-72 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg ${
            alignMenu === "right" ? "right-0" : "left-0"
          } min-w-full ${menuClassName}`}
        >
          {options.map((opt) => {
            const isSel = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSel}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] text-slate-900 hover:bg-slate-50 md:text-[13px]"
                onClick={() => pick(opt.value)}
              >
                <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                {isSel ? (
                  <Check className="h-4 w-4 shrink-0 text-slate-700" aria-hidden />
                ) : (
                  <span className="h-4 w-4 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
