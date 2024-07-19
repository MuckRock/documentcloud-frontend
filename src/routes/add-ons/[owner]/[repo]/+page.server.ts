import type { Actions } from "@sveltejs/kit";

export const actions = {
  async dispatch({ cookies, fetch, request, params }) {
    const form = await request.formData();

    console.log([...form]);
  },
} satisfies Actions;
