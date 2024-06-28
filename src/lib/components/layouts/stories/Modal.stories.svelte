<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import Modal from "../Modal.svelte";

  export const meta = {
    title: "Layout / Modal",
    component: Modal,
    parameters: { layout: "fullscreen" },
  };
</script>

<Story name="With Title">
  <Modal>
    <h1 slot="title">The Ship</h1>
    <div>
      <p>
        In bed we concocted our plans for the morrow. But to my surprise and no
        small concern, Queequeg now gave me to understand, that he had been
        diligently consulting Yojo—the name of his black little god—and Yojo had
        told him two or three times over, and strongly insisted upon it
        everyway, that instead of our going together among the whaling-fleet in
        harbor, and in concert selecting our craft; instead of this, I say, Yojo
        earnestly enjoined that the selection of the ship should rest wholly
        with me, inasmuch as Yojo purposed befriending us; and, in order to do
        so, had already pitched upon a vessel, which, if left to myself, I,
        Ishmael, should infallibly light upon, for all the world as though it
        had turned out by chance; and in that vessel I must immediately ship
        myself, for the present irrespective of Queequeg.
      </p>
    </div>
  </Modal>
</Story>

<Story name="Without Title">
  <Modal>
    <div>
      <p>
        In bed we concocted our plans for the morrow. But to my surprise and no
        small concern, Queequeg now gave me to understand, that he had been
        diligently consulting Yojo—the name of his black little god—and Yojo had
        told him two or three times over, and strongly insisted upon it
        everyway, that instead of our going together among the whaling-fleet in
        harbor, and in concert selecting our craft; instead of this, I say, Yojo
        earnestly enjoined that the selection of the ship should rest wholly
        with me, inasmuch as Yojo purposed befriending us; and, in order to do
        so, had already pitched upon a vessel, which, if left to myself, I,
        Ishmael, should infallibly light upon, for all the world as though it
        had turned out by chance; and in that vessel I must immediately ship
        myself, for the present irrespective of Queequeg.
      </p>
    </div>
  </Modal>
</Story>
