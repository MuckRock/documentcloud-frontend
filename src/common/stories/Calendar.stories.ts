import type { Meta, StoryObj } from "@storybook/svelte";

import "@/langs/i18n.js";
import Calendar from "../../common/Calendar.svelte";

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta: Meta<Calendar> = {
  title: "Common/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  argTypes: {
    value: { control: { type: "date" } },
  },
};

export default meta;
type Story = StoryObj<Calendar>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Default: Story = {
  args: {},
};
