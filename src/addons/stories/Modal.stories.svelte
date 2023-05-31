<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";

  import Modal from "../Modal.svelte";

  let args = { visible: true, anchor: "center" };
</script>

<Meta
  title="Add-Ons / Modal"
  tags={["autodocs"]}
  parameters={{ layout: "centered" }}
  component={Modal}
/>

<Template let:args>
  <Modal {...args}>
    <div slot="header">
      <h2>Header content</h2>
    </div>

    <div slot="content">
      <h2>Modal body content</h2>
      <p>This is the main body of the modal</p>
    </div>

    <div slot="footer">
      <h2>Footer content</h2>
    </div>
  </Modal>
</Template>

<Story name="Default" {args} />

<Story name="Anchor left" args={{ ...args, anchor: "left" }} />

<Story name="Anchor right" args={{ ...args, anchor: "right" }} />
