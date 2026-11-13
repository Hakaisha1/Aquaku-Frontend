"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  Heart,
  House,
  MessageCircle,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { useSavedProducts } from "@/components/marketplace/saved-products";
import { useAuth } from "@/context/auth-context";

const items = [
  { href: "/", label: "Beranda", mobileLabel: "Beranda", icon: House },
  {
    href: "/marketplace",
    label: "Marketplace",
    mobileLabel: "Belanja",
    icon: ShoppingBag,
  },
  {
    href: "/forum",
    label: "Forum komunitas",
    mobileLabel: "Forum",
    icon: MessageCircle,
  },
  {
    href: "/marketplace?view=saved",
    label: "Tersimpan",
    mobileLabel: "Simpan",
    icon: Heart,
  },
];

function NavigationItems({
  mobile,
  pathname,
  savedView,
}: {
  mobile: boolean;
  pathname: string;
  savedView: boolean;
}) {
  const { saved } = useSavedProducts();
  return (
    <>
      {items.map(({ href, label, mobileLabel, icon: Icon }) => {
        const active = href.includes("?")
          ? savedView
          : href === "/"
            ? pathname === "/"
            : pathname.startsWith(href) && !savedView;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={
              mobile
                ? `flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-all duration-150 ease-out active:scale-95 ${active ? "text-brand" : "text-muted"}`
                : `flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-all duration-150 ease-out active:scale-[0.98] ${active ? "bg-soft text-brand" : "text-muted hover:bg-soft hover:text-foreground"}`
            }
          >
            <Icon
              size={mobile ? 20 : 19}
              strokeWidth={active ? 2.2 : 1.8}
              aria-hidden="true"
            />
            {mobile ? mobileLabel : label}
            {!mobile && label === "Tersimpan" && saved.length ? (
              <span className="ml-auto text-xs">{saved.length}</span>
            ) : null}
          </Link>
        );
      })}
      {mobile ? (
        <MobileAccountButton />
      ) : null}
    </>
  );
}

function MobileAccountButton() {
  const { user, openAccountModal } = useAuth();
  if (user) {
    return (
      <button
        type="button"
        onClick={openAccountModal}
        className="flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] font-semibold text-muted transition-all duration-150 ease-out hover:text-brand active:scale-95"
      >
        <span className="flex size-5 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-on-brand transition-transform duration-150 group-active:scale-90">
          {user.display_name.slice(0, 1).toUpperCase()}
        </span>
        <span>Profil</span>
      </button>
    );
  }

  return (
    <Link
      href="/login"
      className="flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] font-semibold text-muted transition-all duration-150 ease-out hover:text-brand active:scale-95"
    >
      <UserRound size={20} aria-hidden="true" />
      <span>Masuk</span>
    </Link>
  );
}

function ResolvedNavigation({ mobile }: { mobile: boolean }) {
  const pathname = usePathname();
  const params = useSearchParams();
  return (
    <NavigationItems
      mobile={mobile}
      pathname={pathname}
      savedView={pathname === "/marketplace" && params.get("view") === "saved"}
    />
  );
}

export function PrimaryNavigation({ mobile = false }: { mobile?: boolean }) {
  return (
    <Suspense
      fallback={
        <NavigationItems mobile={mobile} pathname="" savedView={false} />
      }
    >
      <ResolvedNavigation mobile={mobile} />
    </Suspense>
  );
}
