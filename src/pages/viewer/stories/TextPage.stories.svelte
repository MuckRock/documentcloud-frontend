<script context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import TextPage from "../TextPage.svelte";

  export const meta = {
    title: "Viewer / Text / Text page",
    component: TextPage,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };

  const text = `First, Second, and Single COVID-19 Vaccine Doses Administered, 
Boston Residents Age 16+, Dec. 15, 2020 - May 4, 2021 * The Boston Total population count (581,209 
residents) includes residents ages 16+, the population 
for which a COVID-19 vaccine is currently approved. 
`;

  const highlights = [
    [
      {
        text: "First, Second, and Single COVID-19 Vaccine Doses Administered, \n",
        type: "normal",
      },
      {
        text: "Boston",
        type: "highlight",
      },
      {
        text: " Residents Age 16+, Dec. 15, 2020 - May 4, 2021 * The ",
        type: "normal",
      },
      {
        text: "Boston",
        type: "highlight",
      },
      {
        text: " Total population count (581,209 \nresidents) includes residents ages 16+, the population \nfor which a COVID-19 vaccine is currently approved. \n1\n At Least 1 Dose refers to individuals who have \nreceived one or more doses of the Moderna or Pfizer \nvaccine, or a single dose of the Johnson & Johnson \nvaccine. 2\n Partially Vaccinated refers to individuals who \nhave received only a first dose of the Moderna or Pfizer \nvaccine. 3\n Fully Vaccinated refers to individuals who \nhave received both first and second doses of the \nModerna or Pfizer vaccine, or a single dose of the \nJohnson & Johnson vaccine. \n",
        type: "normal",
      },
    ],
  ];
</script>

<Template let:args>
  <TextPage {...args} />
</Template>

<Story name="default" args={{ text }} />

<Story name="highlighted" args={{ text, highlights }} />
