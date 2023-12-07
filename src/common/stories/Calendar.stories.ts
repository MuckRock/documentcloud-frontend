import type { Meta, StoryObj } from "@storybook/svelte";

import "@/langs/i18n.js";
import Calendar from "../Calendar.svelte";

const meta: Meta<Calendar> = {
  title: "Common/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  argTypes: {
    value: { control: { type: "date" } },
  },
  parameters: {
    date: new Date("December 5, 2023 10:00:00"),
  },
};

export default meta;
type Story = StoryObj<Calendar>;

export const Default: Story = {
  args: {},
};
