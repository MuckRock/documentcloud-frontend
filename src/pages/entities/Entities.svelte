<script>
  import { onMount } from "svelte";
  import { router } from "@/router/router";
  import { getDocument } from "@/api/document";
  import { jsonUrl } from "@/api/viewer";
  import session from "@/api/session";

  onMount(async () => {
    const id = parseInt(router.resolvedRoute.props.id.split("-")[0]);
    const document = await getDocument(id);
    console.log(await session.getStatic(jsonUrl(document)));
  });
</script>

Entities
