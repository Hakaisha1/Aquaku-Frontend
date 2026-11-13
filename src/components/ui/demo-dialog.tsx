"use client";

import { useRef, type ReactNode } from "react";
import { FlaskConical, X } from "lucide-react";

export function DemoDialog({
  title,
  children,
  label,
  className = "button-secondary",
  icon,
}: {
  title: string;
  children: ReactNode;
  label: ReactNode;
  className?: string;
  icon?: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => dialog.current?.showModal()}
      >
        {icon}
        {label}
      </button>
      <dialog
        ref={dialog}
        aria-label={title}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className="p-6 sm:p-8">
          <div className="mb-5 flex items-start justify-between gap-4">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-soft text-brand">
              <FlaskConical size={23} aria-hidden="true" />
            </span>
            <button
              className="icon-button -mr-2 -mt-2"
              aria-label="Tutup dialog"
              onClick={() => dialog.current?.close()}
            >
              <X size={20} />
            </button>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">{title}</h2>
          <div className="mt-3 space-y-3 text-sm leading-7 text-muted">
            {children}
          </div>
          <button
            type="button"
            className="button-primary mt-6 w-full"
            onClick={() => dialog.current?.close()}
          >
            Mengerti
          </button>
        </div>
      </dialog>
    </>
  );
}
