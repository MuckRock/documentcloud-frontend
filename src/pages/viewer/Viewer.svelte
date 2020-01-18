<script>
  import Header from "./Header";
  import Body from "./Body";
  import Sidebar from "./Sidebar";
  import Footer from "./Footer";

  import { confirmDialog, hideConfirm } from "@/manager/confirmDialog";
  import ConfirmDialog from "@/common/dialog/ConfirmDialog";
  import Modal from "@/common/Modal";
  import Loader from "@/common/Loader";
  import { layout } from "@/viewer/layout";
</script>

{#if $confirmDialog.open}
  <Modal component={ConfirmDialog} on:close={hideConfirm} />
{/if}

<Loader active={$layout.loading}>
  <Header />
  <Body />
  <Sidebar />
  <Footer />
</Loader>
