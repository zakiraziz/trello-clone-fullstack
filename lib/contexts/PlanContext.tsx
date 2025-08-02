"use client";

import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";

interface PlanContextType {
  isFreeUser: boolean;
  hasProPlan: boolean;
  hasEnterprisePlan: boolean;
  // Feature flags
  canUseAdvancedFeatures: boolean;
  canExportData: boolean;
  canInviteTeamMembers: boolean;
  maxProjectsAllowed: number;
  storageLimitGB: number;
  // Plan metadata
  planName: string;
  planExpiryDate?: Date;
  // Methods
  upgradePlan: (plan: "pro" | "enterprise") => Promise<void>;
  checkFeatureAccess: (feature: string) => boolean;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

interface PlanProviderProps {
  children: ReactNode;
  hasProPlan: boolean;
  hasEnterprisePlan: boolean;
  // Additional plan metadata
  planExpiryDate?: Date;
  // Feature flags
  featureFlags?: Record<string, boolean>;
  // Callbacks
  onUpgrade?: (plan: "pro" | "enterprise") => Promise<void>;
}

export function PlanProvider({
  children,
  hasProPlan,
  hasEnterprisePlan,
  planExpiryDate,
  featureFlags = {},
  onUpgrade,
}: PlanProviderProps) {
  const isFreeUser = !hasProPlan && !hasEnterprisePlan;
  const planName = hasEnterprisePlan ? "Enterprise" : hasProPlan ? "Pro" : "Free";

  const value = useMemo(() => ({
    isFreeUser,
    hasProPlan,
    hasEnterprisePlan,
    planName,
    planExpiryDate,
    // Feature access
    canUseAdvancedFeatures: hasProPlan || hasEnterprisePlan,
    canExportData: hasEnterprisePlan,
    canInviteTeamMembers: hasEnterprisePlan,
    maxProjectsAllowed: hasEnterprisePlan ? Infinity : hasProPlan ? 10 : 1,
    storageLimitGB: hasEnterprisePlan ? 100 : hasProPlan ? 10 : 1,
    // Methods
    upgradePlan: async (plan: "pro" | "enterprise") => {
      if (onUpgrade) {
        await onUpgrade(plan);
      }
    },
    checkFeatureAccess: (feature: string) => {
      // Check plan-based features first
      switch (feature) {
        case "advanced-analytics":
          return hasProPlan || hasEnterprisePlan;
        case "team-collaboration":
          return hasEnterprisePlan;
        default:
          return featureFlags[feature] ?? false;
      }
    },
  }), [hasProPlan, hasEnterprisePlan, planExpiryDate, featureFlags, onUpgrade]);

  return (
    <PlanContext.Provider value={value}>
      {children}
    </PlanContext.Provider>
  );
}

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error("usePlan must be used within a PlanProvider");
  }
  return context;
};

// Helper hooks for common checks
export const useCanExport = () => usePlan().canExportData;
export const useCanInviteTeamMembers = () => usePlan().canInviteTeamMembers;
export const usePlanName = () => usePlan().planName;
export const useIsFreeUser = () => usePlan().isFreeUser;
export const useUpgradePlan = () => usePlan().upgradePlan;
export const useCheckFeatureAccess = () => usePlan().checkFeatureAccess;
