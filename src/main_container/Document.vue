<template>
  <Loader :inline="true" :active="document.loading">
    <div
      @contextmenu="handleContextMenu($event)"
      class="document"
      :class="{ error, fresh }"
    >
      <DocLink :document="document" :disabled="context.show || this.error">
        <div class="documentinner">
          <div class="card">
            <img
              v-if="!error"
              class="card"
              :src="cardImage"
              draggable="false"
            />
            <ErrorCard v-if="error" @delete="$emit('delete', document)" />
          </div>
          <div class="title">{{ document.title }}</div>
          <div class="sub">{{ document.userOrg }}</div>
          <div class="sub">
            {{ document.pageCount }} pages - {{ document.createdAt }}
          </div>
        </div>
        <ContextMenu
          v-if="context.show"
          @close="context.show = false"
          :x="context.x"
          :y="context.y"
        >
          <div class="menuitem" @click="$emit('delete', document)">Delete</div>
        </ContextMenu>
      </DocLink>
    </div>
  </Loader>
</template>

<style lang="scss" scoped>
$freshbg: rgba($tertiary, 0.1);
$normaloutline: 0.5px solid rgba(0, 0, 0, 0.25);

.document {
  width: 222px;
  vertical-align: top;
  display: inline-block;
  padding: 8px 4px;
  margin: 2px;
  border-radius: $radius;

  ::v-deep a {
    color: inherit;
    text-decoration: inherit;
  }

  &:hover {
    cursor: pointer;
    background: rgba(0, 0, 0, 0.03);

    .card {
      outline: 0.5px solid $primary;
    }

    &.error {
      cursor: inherit;
      background: $errorbg;

      .card {
        outline: $normaloutline;
      }
    }
  }

  &.error {
    background: $errorbg;
  }

  &.fresh {
    background: $freshbg;

    &:hover {
      cursor: pointer;
      background: rgba($freshbg, 0.15);
    }
  }
}

.documentinner {
  padding: 7px 20px 20px 20px;
}

.title {
  font-size: $normal;
  padding-top: 10px;
  padding-bottom: 6px;
  word-break: break-word;
}

.sub {
  font-size: $small;
  line-height: 15px;
  color: $gray;
}

.card {
  display: inline-block;
  outline: $normaloutline;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.12);

  img {
    object-fit: contain;
    background: white;
    user-select: none;
  }
}

.card,
.card img {
  width: 171px;
  height: 217px;
}
</style>

<script>
import ErrorCard from "../common/ErrorCard";
import ContextMenu from "../common/ContextMenu";
import DocLink from "../common/DocLink";
import Loader from "../common/Loader";

export default {
  components: { ErrorCard, ContextMenu, DocLink, Loader },
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
    },
    error() {
      return this.document.error;
    },
    fresh() {
      return this.document.fresh;
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
      if (this.context.show || this.error) return;
      this.$extensions.document.open(this.document);
    }
  }
};
</script>
