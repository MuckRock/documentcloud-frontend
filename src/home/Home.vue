<template>
  <HomePage :showMast="true">
    <p>DocumentCloud is an all-in-one platform for documents: upload, organize, analyze, annotate, search, and embed.</p>
    <p>Primarily used by journalists, DocumentCloud has established a reputation as a store for primary source documents and has been utilized in breaking investigative stories worldwide.</p>
  </HomePage>
</template>

<script>
import HomePage from "./HomePage";

export default {
  components: { HomePage }
};
</script>