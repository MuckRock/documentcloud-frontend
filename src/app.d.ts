// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { PlausibleEventOptions } from "@plausible-analytics/tracker";

declare global {
  interface Window {
    plausible(eventName: string, options: PlausibleEventOptions): void;
  }

  namespace App {
    // interface Error {}
    // interface Locals {}

    interface PageData {
      flash?: {
        message: string;
        status?: "info" | "warning" | "success" | "error";
        lifespan?: number | null;
      };
    }
    // interface PageState {}
    interface Platform {
      context: any;
    }
  }

  namespace svelteHTML {
    interface HTMLAttributes<T> {
      "on:vite:preloadError"?: (event: any) => any;
    }

    interface HTMLProps<T> {
      "on:vite:preloadError"?: (event: any) => any;
    }
  }
}

export {};
