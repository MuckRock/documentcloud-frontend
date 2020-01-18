import { Svue } from "svue";
import { pageSizesFromSpec } from "@/api/pageSize";
import { getDocument } from "@/api/document";
import { router } from "@/router/router";

export const viewer = new Svue({
  data() {
    return {
      router
    };
  },
  computed: {
    id(router) {
      const route = router.resolvedRoute;
      if (route.name == "viewer" && route.props != null) {
        return route.props.id;
      }
      return null;
    },
    loaded(document, pageAspects) {
      return document != null && pageAspects != null;
    },
    async document(id) {
      if (id == null) return null;

      const doc = await getDocument(id);
      return doc;
    },
    pageAspects(document) {
      if (document == null) return null;

      return pageSizesFromSpec(document.pageSpec);
    }
  }
});
