<template>
  <div class="document">
    <div class="documentinner">
      <img class="card" v-bind:src="cardImage" draggable="false" />
      <div class="title">{{ document.title }}</div>
      <div class="sub">{{document.account_name }} ({{document.organization_name}})</div>
      <div class="sub">{{document.page_count}} pages - {{document.created_at}}</div>
    </div>
  </div>
</template>

<style scoped>
.document {
  width: 222px;
  vertical-align: top;
  display: inline-block;
  padding: 10px 6px;
  border-radius: var(--radius);
}

.document:hover {
  cursor: pointer;
  background: rgba(0, 0, 0, 0.03);
}

.document:hover .card {
  outline: 0.5px solid var(--primary);
}

.documentinner {
  padding: 7px 20px 20px 20px;
}

.title {
  font-size: var(--normal);
  padding-top: 10px;
  padding-bottom: 6px;
  word-break: break-word;
}

.sub {
  font-size: var(--small);
  line-height: 15px;
  color: var(--gray);
}

.card {
  width: 171px;
  height: 217px;
  outline: 0.5px solid rgba(0, 0, 0, 0.25);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.12);
  object-fit: contain;
  background: white;
  user-select: none;
}
</style>

<script>
export default {
  props: {
    document: {
      type: Object
    }
  },
  computed: {
    cardImage() {
      return this.document.thumbnail_url.replace(
        /-thumbnail\.gif$/,
        "-normal.gif"
      );
    }
  }
};
</script>