import type { Meta, StoryObj } from "@storybook/svelte";

import Toast from "../Toast.svelte";

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta: Meta<Toast> = {
  title: "Common/Toast",
  component: Toast,
  tags: ["autodocs"],
  argTypes: {
    onClose: {
      action: "Close",
    },
    onReset: {
      action: "Reset",
    },
    onCancel: {
      action: "Cancel",
    },
  },
};

export default meta;
type Story = StoryObj<Toast>;

export const Info: Story = {
  args: {
    toast: {
      idx: 1,
      content: "This is an info message",
      status: "info",
    },
    i: 1,
    fade: false,
  },
};

export const Success: Story = {
  args: {
    toast: {
      idx: 1,
      content: "This is a success message",
      status: "success",
    },
    i: 1,
    fade: false,
  },
};

export const Warning: Story = {
  args: {
    toast: {
      idx: 1,
      content: "This is a warning message",
      status: "warning",
    },
    i: 1,
    fade: false,
  },
};

export const Error: Story = {
  args: {
    toast: {
      idx: 1,
      content: "This is an error message",
      status: "error",
    },
    i: 1,
    fade: false,
  },
};

export const WithFade: Story = {
  args: {
    toast: {
      idx: 1,
      content: "This message will automatically disappear",
      status: "info",
    },
    i: 1,
    fade: true,
  },
};

export const WithLongContent: Story = {
  args: {
    toast: {
      idx: 1,
      content:
        "This message is very, very long. It's a super long message. You rarely see a message this long nowadays. Kids these days have no attention span. Back in my day we used to read three books a day, uphill both ways!",
      status: "info",
    },
    i: 1,
    fade: false,
  },
};
