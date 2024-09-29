import type { DefinedError } from "ajv";

type AddOnCategory = "premium" | string;

export type Status =
  | "success"
  | "failure"
  | "queued"
  | "in_progress"
  | "cancelled";

import type { PageParams } from "@/api/types/common";

export interface AddOnParams extends PageParams {
  query?: string;
  active?: boolean;
  default?: boolean;
  featured?: boolean;
  premium?: boolean;
  category?: string;
  repository?: string;
}

interface AddOnProperty {
  type: string;
  title?: string;
  description?: string;
  default?: string | string[] | number;
  format?: string;
  enum?: (string | boolean)[];
  items?: AddOnProperty;
  maximum?: number;
  minimum?: number;
}

export interface EventOptions {
  name?: string;
  events: string[];
}

interface AddOnParameters {
  type: string;
  version: number;
  title: string;
  description: string;
  instructions: string;
  custom_disabled_email_footer: string;
  categories: AddOnCategory[];
  documents: string[];
  required: string[];
  properties: Record<string, AddOnProperty>;
  cost: {
    amount: number;
    price?: number;
    unit: string;
  };
  eventOptions: EventOptions;
}

// https://api.www.documentcloud.org/api/addons/
export interface AddOnListItem {
  id: number;
  user: number;
  organization: number;
  access: "public" | "private";
  name: string;
  repository: string;
  parameters: Partial<AddOnParameters>;
  created_at: string;
  updated_at: string;
  active: boolean;
  featured: boolean;
  default: boolean;
  usage?: number;
}

// https://api.www.documentcloud.org/api/addon_events/?expand=addon
export interface Event {
  id: number;
  addon: AddOnListItem;
  user: number;
  parameters: any;
  event: number;
  scratch: any;
  created_at: string;
  updated_at: string;
}

// https://api.www.documentcloud.org/api/addon_runs/?expand=addon
export interface Run {
  uuid: string;
  addon: AddOnListItem;
  user: number;
  status: Status;
  progress: number;
  message: string;
  file_url?: string | null;
  file_expires_at?: string | null;
  dismissed: boolean;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  credits_spent?: number;
}

// payload for creating or scheduling an add-on run
// including the `event` property will schedule runs (or cancel, if it's zero)
// the `documents` and `query` properties tell the add-on what documents to run against
export interface AddOnPayload {
  addon: number;
  parameters: any;
  event?: number;
  documents?: number[] | string[];
  query?: string;
  errors?: DefinedError[];
  valid?: boolean;
}
