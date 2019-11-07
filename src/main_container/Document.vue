<template>
  <Loader :inline="true" :active="document.loading">
    <div @contextmenu="handleContextMenu($event)" class="document">
      <div class="documentinner" @click="open()">
        <img class="card" :src="cardImage" draggable="false" />
        <div class="title">{{ document.title }}</div>
        <div class="sub">{{ document.userOrg }}</div>
        <div class="sub">{{document.pageCount}} pages - {{document.createdAt}}</div>
      </div>
      <ContextMenu v-if="context.show" @close="context.show = false" :x="context.x" :y="context.y">
        <div class="menuitem" @click="$emit('delete', document)">Delete</div>
      </ContextMenu>
    </div>
  </Loader>
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
import ContextMenu from "../common/ContextMenu";
import Loader from "../common/Loader";

export default {
  components: { ContextMenu, Loader },
  props: {
    document: {
      type: Object
    }
  },
  data() {
    return {
      context: {
        show: false,
        x: 0,
        y: 0
      }
    };
  },
  computed: {
    cardImage() {
      return this.document.thumbnail;
    }
  },
  methods: {
    handleContextMenu(e) {
      if (!this.context.show) {
        this.context.x = e.clientX;
        this.context.y = e.clientY;
        this.context.show = true;
      } else {
        this.context.show = false;
      }
      e.preventDefault();
    },
    open() {
      if (this.context.show) return;
      this.$router.push({
        name: "viewer",
        params: {
          id: this.document.slugId
        }
      });
    }
  }
};
</script>
