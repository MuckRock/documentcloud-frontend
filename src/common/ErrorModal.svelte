<script>
  import Modal from "./Modal";
  import ErrorDialog from "./dialog/ErrorDialog";

  export let store;
</script>

<Modal
  component={ErrorDialog}
  properties={{ error: $store.error }}
  on:close={() => (store.error = null)} />
