import type { Access } from "$lib/api/types";
import {
  Globe24,
  Lock24,
  Organization24,
  type SvgComponent,
} from "svelte-octicons";
import { unwrapFunctionStore, _ } from "svelte-i18n";

const $_ = unwrapFunctionStore(_);

export interface Level {
  value: Access;
  title: string;
  description: string;
  icon: typeof SvgComponent;
}

export const levels: Level[] = [
  {
    value: $_("access.private.value") as Access,
    title: $_("access.private.title"),
    description: $_("access.private.description"),
    icon: Lock24,
  },
  {
    value: $_("access.organization.value") as Access,
    title: $_("access.organization.title"),
    description: $_("access.organization.description"),
    icon: Organization24,
  },
  {
    value: $_("access.public.value") as Access,
    title: $_("access.public.title"),
    description: $_("access.public.description"),
    icon: Globe24,
  },
];
