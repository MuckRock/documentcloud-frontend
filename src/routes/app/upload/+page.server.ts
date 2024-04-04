import type { Actions } from "./$types";

import * as documents from "$lib/api/documents";

export const actions: Actions = {
  default: async ({ request, cookies, fetch }) => {
    const data = await request.formData();
    const files = Array.from(data.getAll("uploads"));

    console.log(data);
    console.log(files);
  },
};
