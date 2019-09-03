<template>
  <div>
    <div class="shim" @click="dismiss()"></div>
    <div class="modalcontainer">
      <div class="modalintermediate">
        <div class="modal">
          <div class="header">
            <img @click="dismiss()" class="close" src="../assets/close.svg" alt draggable="false" />
          </div>
          <div class="content">
            <slot></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shim {
  background: var(--gray);
  z-index: 20;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}

.modalcontainer {
  z-index: 21;
  position: fixed;
  top: 20vh;
  left: 20vw;
  height: 60vh;
  width: 60vw;
  display: table;
  pointer-events: none;
  -webkit-overflow-scrolling: touch;
}

.modalintermediate {
  display: table-cell;
  vertical-align: middle;
  pointer-events: none;
  -webkit-overflow-scrolling: touch;
}

.modal {
  box-sizing: border-box;
  overflow-y: auto;
  background: var(--modal);
  border-radius: var(--radius);
  color: white;
  padding: 0 0 44px 0;
  box-shadow: var(--overlay-shadow);
  position: relative;
  max-height: 100%;
  max-width: 766px;
  margin: 0 auto;
  text-align: left;
  pointer-events: all;
  -webkit-overflow-scrolling: touch;
}

@media only screen and (max-width: 600px) {
  .modalcontainer {
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
  }
}

.header {
  position: sticky;
  position: -webkit-sticky;
  top: 0;
  height: 42px;
  margin-bottom: 2px;
}

.content {
  padding: 0 42px;
}

.close {
  user-select: none;
  margin-left: 12px;
  margin-top: 12px;
}

.close:hover {
  opacity: var(--hover-opacity);
  cursor: pointer;
}

.modal >>> h1 {
  font-size: 18px;
  font-weight: 600;
}
</style>

<script>
export default {
  methods: {
    dismiss() {
      this.$emit("close");
    }
  },
  mounted() {
    window.console.log("MODAL SHOWN");
    document.body.classList.add("modalopen");
  },
  destroyed() {
    window.console.log("MODAL DESTROYED");
    document.body.classList.remove("modalopen");
  }
};
</script>