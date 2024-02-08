/**
 * API response types
 *
 * This is a separate module from what's in src/api to prevent conflicts.
 * Both modules can be merged later.
 * */

import type { User, Org } from "../../api/types/orgAndUser";
import type { Project } from "../../api/types/project";
import type { Page } from "../../api/types/common";

// https://www.documentcloud.org/help/api#documents
export interface Document {
  id: number;
  access: "public" | "private" | "organization"; // https://www.documentcloud.org/help/api#access-levels
  admin_noindex: boolean;
  asset_url: string | URL;
  canonical_url: string | URL;
  created_at: string | Date;
  data: Record<string, string[]>;
  description: string;
  edit_access: boolean;
  file_hash: string;
  noindex: boolean;
  language: string;
  organization: number | Org;
  original_extension: string;
  page_count: number;
  page_spec: string;
  projects: number[] | Project[];
  publish_at: string | null;
  published_url: string | URL;
  related_article: string | URL;
  revision_control: boolean;
  slug: string;
  source: string;
  status: "success" | "readable" | "pending" | "error" | "nofile"; // https://www.documentcloud.org/help/api#statuses
  title: string;
  updated_at: string | Date;
  user: number | User;
}

export type DocumentResults = Page<Document>;
