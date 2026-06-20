"use client";

import { useEffect, useId, useRef, useState } from "react";

type SortMenuOption = {
  id: string;
  label: string;
};

type AccountOrdersSortMenuProps = {
  value: string;
  defaultLabel: string;
  options: SortMenuOption[];
  onChange: (value: string) => void;
};

function menuItemClass(isActive: boolean) {
  return `block w-full border-l-2 py-2 pl-[calc(1rem-2px)] pr-4 text-left text-[0.62rem] font-normal uppercase tracking-[0.14em] transition-colors ${
    isActive
      ? "border-neptura-aurora text-neptura-light-text"
      : "border-transparent text-neptura-light-muted hover:text-neptura-light-text"
  }`;
}

export default function AccountOrdersSortMenu({
  value,
  defaultLabel,
  options,
  onChange,
}: AccountOrdersSortMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const displayLabel =
    value === "" ? defaultLabel : (options.find((option) => option.id === value)?.label ?? defaultLabel);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const selectOption = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className={`neptura-select-toolbar${value ? " neptura-select-toolbar--active" : ""}${
          open ? " neptura-select-toolbar--open" : ""
        }`}
      >
        <span>{displayLabel}</span>
        <svg aria-hidden viewBox="0 0 8 5" className="neptura-select-toolbar-chevron" fill="currentColor">
          <path d="M0 0 4 5 8 0" />
        </svg>
      </button>

      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Sort orders"
          className="absolute right-0 top-full z-20 mt-2 min-w-[8.5rem] border border-neptura-light bg-neptura-light-bg py-1"
        >
          <li role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={value === ""}
              onClick={() => selectOption("")}
              className={menuItemClass(value === "")}
            >
              {defaultLabel}
            </button>
          </li>
          {options.map((option) => (
            <li key={option.id} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={value === option.id}
                onClick={() => selectOption(option.id)}
                className={menuItemClass(value === option.id)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
