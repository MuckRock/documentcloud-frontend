# State

Files in this directory manage shared state used across components. Each file is a `something.svelte.ts` file, which combines typescript datastructures with Svelte state.

Each state object is a class. In most cases:

- only one of these should exist at a time
- they should be instantiated early in the request cycle and high in the component tree
- they should be passed down using context
