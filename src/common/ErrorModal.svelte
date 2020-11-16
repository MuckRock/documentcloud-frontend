<script>
  import Modal from "./Modal";
  import ErrorDialog from "./dialog/ErrorDialog";

  export let store;
  export let refresh = false;
</script>

<Modal
  component={ErrorDialog}
  properties={{ error: $store.error, refresh }}
  on:close={() => {
    store.error = null;
    if (refresh) {
      window.location.reload();
    }
  }} />
