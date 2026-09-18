"use client";

import { create } from "zustand";
import type { PaymentBadgeInfo, Product } from "@/lib/types/catalog";

interface QuickViewContext {
  product: Product;
  tenantSlug: string;
  brandName?: string;
  paymentBadge?: PaymentBadgeInfo;
  currency?: string;
}

interface QuickViewState {
  context: QuickViewContext | null;
  open: (context: QuickViewContext) => void;
  close: () => void;
}

/** Ephemeral UI state only (never persisted) — see NSQuickViewModal, mounted once in the storefront layout, and the "vista rápida" trigger on both themes' product cards. */
export const useQuickViewStore = create<QuickViewState>((set) => ({
  context: null,
  open: (context) => set({ context }),
  close: () => set({ context: null }),
}));
