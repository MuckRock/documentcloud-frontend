import type { Meta, StoryObj } from "@storybook/svelte";

import Button from "../../common/Button.svelte";

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta: Meta<Button> = {
  title: "Common/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    disabledReason: { control: "text" },
    type: {
      control: { type: "select" },
      options: ["button", "submit", "reset"],
    },
  },
};

export default meta;
type Story = StoryObj<Button>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Default: Story = {
  args: {
    label: "Button",
  },
};

export const Secondary: Story = {
  args: {
    ...Default.args,
    secondary: true,
  },
};

export const Tertiary: Story = {
  args: {
    ...Default.args,
    tertiary: true,
  },
};

export const Nondescript: Story = {
  args: {
    ...Default.args,
    nondescript: true,
  },
};

export const Action: Story = {
  args: {
    ...Default.args,
    action: true,
  },
};

export const Caution: Story = {
  args: {
    ...Default.args,
    caution: true,
  },
};

export const Danger: Story = {
  args: {
    ...Default.args,
    danger: true,
  },
};

export const Diabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};

export const DiabledReason: Story = {
  args: {
    ...Default.args,
    disabledReason: "This button is disabled",
  },
};

export const Plain: Story = {
  args: {
    ...Default.args,
    plain: true,
  },
};

export const NoMargin: Story = {
  args: {
    ...Default.args,
    nomargin: true,
  },
};
