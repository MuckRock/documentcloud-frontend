import { Maybe } from "./common";

interface PremiumOrgFields {
  purchased_credits: number;
  monthly_credits: number;
  monthly_credit_allowance: number;
  credit_reset_date: string;
}

export interface Org extends Partial<PremiumOrgFields> {
  uuid: string;
  id: number;
  name: string;
  slug: string;
  avatar_url: string;
  individual?: boolean;
  plan?: "Free" | "Professional" | "Organization";
}

export interface GroupOrg extends Org {
  individual: false;
  plan: "Free" | "Organization";
}

export interface IndividualOrg extends Org {
  individual: true;
  plan: "Free" | "Professional";
}

export interface User {
  uuid: string;
  id: number;
  name: Maybe<string>;
  avatar_url: Maybe<string>;
  username: string;
  organization: number | Org;
  organizations: number[];
  admin_organizations: number[];
  feature_level?: number;
  verified_journalist?: boolean;
  is_staff?: boolean;
}

export function isOrg(org?: null | number | Org): org is Org {
  return org !== undefined && org !== null && typeof org !== "number";
}
