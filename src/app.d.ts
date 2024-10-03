// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
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
