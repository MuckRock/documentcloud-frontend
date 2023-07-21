import type { Meta, StoryObj, ArgTypes } from "@storybook/svelte";

import Loader from "../Loader.svelte";

const args = {
  active: true,
};

const argTypes: ArgTypes = {
  active: {
    control: { type: "boolean" },
  },
  centered: {
    control: { type: "boolean" },
  },
  big: {
    control: { type: "boolean" },
  },
  inline: {
    control: { type: "boolean" },
  },
  transparent: {
    control: { type: "boolean" },
  },
  pad: {
    control: { type: "boolean" },
  },
};

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta: Meta<Loader> = {
  title: "Common / Loader",
  component: Loader,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes,
};

export default meta;
type Story = StoryObj<Loader>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Active: Story = { args };
export const Centered: Story = { args: { ...args, center: true } };
export const Big: Story = { args: { ...args, big: true } };
export const Inline: Story = { args: { ...args, inline: true } };
export const Transparent: Story = { args: { ...args, transparent: true } };
export const Padded: Story = { args: { ...args, pad: true } };
