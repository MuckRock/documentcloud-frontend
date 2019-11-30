<template>
  <div>
    <div class="mcontent">
      <h1>{{ title }}</h1>
      <p>{{ body }}</p>
      <div class="buttonpadded">
        <Button :color="buttonColor" @click="confirm()">{{
          buttonText
        }}</Button>
        <Button :secondary="true" @click="dismiss()">Cancel</Button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.buttonpadded {
  margin: 25px 0 25px -5px;

  ::v-deep button {
    margin: 0 5px;
  }
}
</style>

<script>
import Button from "../common/Button";

export default {
  components: { Button },
  computed: {
    dialog() {
      return this.$extensions.confirmDialog;
    },
    title() {
      return this.dialog.title;
    },
    body() {
      return this.dialog.body;
    },
    buttonText() {
      return this.dialog.buttonText;
    },
    buttonColor() {
      return this.dialog.buttonColor;
    },
    confirmFn() {
      return this.dialog.confirmFn;
    }
  },
  methods: {
    confirm() {
      this.dialog.runConfirm();
    },
    dismiss() {
      this.dialog.hideConfirm();
    }
  }
};
</script>
