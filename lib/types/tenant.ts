export type TenantStatus = "active" | "disabled";

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  status: TenantStatus;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}
