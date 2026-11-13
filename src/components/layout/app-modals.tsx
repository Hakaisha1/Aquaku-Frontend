"use client";

import { AuthModals } from "@/components/auth/auth-modals";
import { MembershipModal } from "@/components/marketplace/membership-modal";
import { SellModal } from "@/components/marketplace/sell-modal";
import { TransactionsModal } from "@/components/marketplace/transactions-modal";

export function AppModals() {
  return (
    <>
      <AuthModals />
      <SellModal />
      <MembershipModal />
      <TransactionsModal />
    </>
  );
}
