import type { Actions } from "./$types";

import * as documents from "$lib/api/documents";

export const actions: Actions = {
  default: async ({ request, cookies, fetch }) => {
    const data = await request.formData();

    console.log(data);
  },
};
