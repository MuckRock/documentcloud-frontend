<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import Card from "../Card.svelte";

  export const meta = {
    title: "Components / Common / Card",
    component: Card,
  };
</script>

<Story name="default">
  <Card>
    <h2>CHAPTER 6. The Street.</h2>
    <p>
      If I had been astonished at first catching a glimpse of so outlandish an
      individual as Queequeg circulating among the polite society of a civilized
      town, that astonishment soon departed upon taking my first daylight stroll
      through the streets of New Bedford.
    </p>

    <p>
      In thoroughfares nigh the docks, any considerable seaport will frequently
      offer to view the queerest looking nondescripts from foreign parts. Even
      in Broadway and Chestnut streets, Mediterranean mariners will sometimes
      jostle the affrighted ladies. Regent Street is not unknown to Lascars and
      Malays; and at Bombay, in the Apollo Green, live Yankees have often scared
      the natives. But New Bedford beats all Water Street and Wapping. In these
      last-mentioned haunts you see only sailors; but in New Bedford, actual
      cannibals stand chatting at street corners; savages outright; many of whom
      yet carry on their bones unholy flesh. It makes a stranger stare.
    </p>

    <p>
      But, besides the Feegeeans, Tongatobooarrs, Erromanggoans, Pannangians,
      and Brighggians, and, besides the wild specimens of the whaling-craft
      which unheeded reel about the streets, you will see other sights still
      more curious, certainly more comical. There weekly arrive in this town
      scores of green Vermonters and New Hampshire men, all athirst for gain and
      glory in the fishery. They are mostly young, of stalwart frames; fellows
      who have felled forests, and now seek to drop the axe and snatch the
      whale-lance. Many are as green as the Green Mountains whence they came. In
      some things you would think them but a few hours old. Look there! that
      chap strutting round the corner. He wears a beaver hat and swallow-tailed
      coat, girdled with a sailor-belt and sheath-knife. Here comes another with
      a sou’-wester and a bombazine cloak.
    </p>
  </Card>
</Story>
