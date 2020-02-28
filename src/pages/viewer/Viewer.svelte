<script>
  import Header from "./header/Header";
  import Body from "./Body";
  import Sidebar from "./Sidebar";
  import Footer from "./Footer";

  // Dialogs
  import ConfirmDialog from "@/common/dialog/ConfirmDialog";
  import { confirmDialog, hideConfirm } from "@/manager/confirmDialog";
  import EditSectionsDialog from "@/common/dialog/EditSectionsDialog";

  import Modal from "@/common/Modal";
  import ErrorModal from "@/common/ErrorModal";
  import Loader from "@/common/Loader";
  import { layout, hideEditSections } from "@/viewer/layout";
</script>

{#if $layout.error}
  <ErrorModal store={$layout} />
{:else if $confirmDialog.open}
  <Modal component={ConfirmDialog} on:close={hideConfirm} />
{:else if $layout.showEditSections}
  <Modal component={EditSectionsDialog} on:close={hideEditSections} />
{/if}

<Loader active={$layout.loading}>
  <Header />
  <Body />
  <Sidebar />
  <Footer />
</Loader>
