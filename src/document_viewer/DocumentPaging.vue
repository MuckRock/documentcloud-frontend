<template>
  <div class="documentpaging">
    <div class="pagingarrow" @click="jumpBack()">
      <img svg-inline src="../assets/paging_left.svg" alt />
    </div>
    <div class="pagetext">
      <input
        ref="input"
        @keyup.enter="handleInput()"
        @blur="handleInput()"
        class="pageinput"
        type="text"
        name
        id
        :value="currentPage"
      />
      <span class="outof">/ {{numPages}}</span>
    </div>
    <div class="pagingarrow" @click="jumpForward()">
      <img svg-inline src="../assets/paging_right.svg" alt />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    numPages: Number,
    currentPage: Number
  },
  methods: {
    jumpBack() {
      const jumpPoint = this.currentPage > 1 ? this.currentPage - 1 : 1;
      this.$emit("jump", jumpPoint);
    },
    jumpForward() {
      const jumpPoint =
        this.currentPage < this.numPages ? this.currentPage + 1 : this.numPages;
      this.$emit("jump", jumpPoint);
    },
    handleInput() {
      this.$refs.input.blur();

      let pageNumber = parseInt(this.$refs.input.value);
      if (
        isNaN(pageNumber) ||
        pageNumber == null ||
        pageNumber < 1 ||
        pageNumber > this.numPages
      ) {
        // Some issue, don't jump
        this.$refs.input.value = this.currentPage;
        return;
      }

      this.$refs.input.value = pageNumber;
      this.$emit("jump", pageNumber);
    }
  }
};
</script>

<style scoped>
.documentpaging {
  user-select: none;
  align-self: center;
}

.pagingarrow {
  display: inline-block;
  cursor: pointer;
}

.pagingarrow:hover {
  opacity: var(--hover-opacity);
}

.pagetext {
  display: inline-block;
  padding: 0 30px;
}

.pageinput {
  background: var(--document-faded);
  color: white;
  outline: none;
  border: none;
  border-radius: var(--radius);
  padding: 6px 8px;
  font-family: inherit;
  font-size: 14px;
  width: 30px;
  text-align: center;
}

.pageinput:focus {
  background: white;
  color: black;
}

.outof {
  font-size: 14px;
  padding: 0 6px;
}
</style>