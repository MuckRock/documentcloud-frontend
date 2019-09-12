<template>
  <div>
    <DocumentHamburger />
    <DocumentTitle :doc="doc" />
  </div>
</template>

<script>
import DocumentHamburger from "./DocumentHamburger";
import DocumentTitle from "./DocumentTitle";

export default {
  components: { DocumentHamburger, DocumentTitle },
  props: {
    doc: Object
  }
};
</script>