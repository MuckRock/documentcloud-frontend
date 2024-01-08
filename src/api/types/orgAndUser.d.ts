import { Maybe } from "./common";

interface PremiumOrgFields {
  purchased_credits: number;
  monthly_credits: number;
  monthly_credit_allowance: number;
  credit_reset_date: string;
}

export interface Org extends Partial<PremiumOrgFields> {
  id: string;
  name: string;
  slug: string;
  avatar_url: string;
  individual: boolean;
  plan: "Free" | "Professional" | "Organization";
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
  id: string;
  name: Maybe<string>;
  avatar_url: Maybe<string>;
  username: string;
  organization: string | Org;
  organizations: string[];
  admin_organizations: string[];
}
