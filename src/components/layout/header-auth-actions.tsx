"use client";

import Link from "next/link";
import { LogIn, Plus } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export function HeaderAuthActions() {
  const { user, openAccountModal, openSellModal } = useAuth();

  return (
    <>
      <div className="hidden sm:block">
        {user ? (
          <button
            type="button"
            onClick={openAccountModal}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground hover:border-brand hover:text-brand"
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-on-brand">
              {user.display_name.slice(0, 1).toUpperCase()}
            </span>
            <span className="max-w-28 truncate">{user.display_name}</span>
          </button>
        ) : (
          <Link
            href="/login"
            className="button-secondary border-transparent bg-transparent px-3 text-xs sm:text-sm"
          >
            <LogIn size={16} />
            Masuk
          </Link>
        )}
      </div>

      <button
        type="button"
        onClick={openSellModal}
        className="button-primary min-h-11 px-3.5 text-xs sm:text-sm"
      >
        <Plus size={17} aria-hidden="true" />
        <span className="sm:hidden">Jual</span>
        <span className="hidden sm:inline">Jual barang</span>
      </button>
    </>
  );
}
