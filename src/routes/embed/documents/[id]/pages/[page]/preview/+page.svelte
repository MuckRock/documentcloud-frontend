<script lang="ts">
  import * as embed from "$lib/api/embed";

  export let data;

  $: document = data.document;
  $: page = data.page;
  $: debug = data.debug;
  $: iframe = embed.page(document, page, debug);
</script>

<svelte:head>
  <title>Embed preview: {document.title}, p. {page}</title>
</svelte:head>

<div class="container">
  <h2>I.</h2>
  <h2>PLAYING PILGRIMS.</h2>
  <p>
    "Christmas won't be Christmas without any presents," grumbled Jo, lying on
    the rug.
  </p>
  <p>
    "It's so dreadful to be poor!" sighed Meg, looking down at her old dress.
  </p>
  <p>
    "I don't think it's fair for some girls to have plenty of pretty things, and
    other girls nothing at all," added little Amy, with an injured sniff.
  </p>
  <p>
    "We've got father and mother and each other," said Beth contentedly, from
    her corner.
  </p>
  {@html iframe}
  <p>
    The four young faces on which the firelight shone brightened at the cheerful
    words, but darkened again as Jo said sadly,—
  </p>
  <p>
    "We haven't got father, and shall not have him for a long time." She didn't
    say "perhaps never," but each silently added it, thinking of father far
    away, where the fighting was.
  </p>
  <p>Nobody spoke for a minute; then Meg said in an altered tone,—</p>
  <p>
    "You know the reason mother proposed not having any presents this Christmas
    was because it is going to be a hard winter for every one; and she thinks we
    ought not to spend money for pleasure, when our men are suffering so in the
    army. We can't do much, but we can make our little sacrifices, and ought to
    do it gladly. But I am afraid I don't;" and Meg shook her head, as she
    thought regretfully of all the pretty things she wanted.
  </p>
  <p>
    "But I don't think the little we should spend would do any good. We've each
    got a dollar, and the army wouldn't be much helped by our giving that. I
    agree not to expect anything from mother or you, but I do want to buy Undine
    and Sintram for myself; I've wanted it so long," said Jo, who was a
    bookworm.
  </p>
  <p>
    "I planned to spend mine in new music," said Beth, with a little sigh, which
    no one heard but the hearth-brush and kettle-holder.
  </p>
  <p>
    "I shall get a nice box of Faber's drawing-pencils; I really need them,"
    said Amy decidedly.
  </p>
  <p>
    "Mother didn't say anything about our money, and she won't wish us to give
    up everything. Let's each buy what we want, and have a little fun; I'm sure
    we work hard enough to earn it," cried Jo, examining the heels of her shoes
    in a gentlemanly manner.
  </p>
  <p>
    "I know I do,—teaching those tiresome children nearly all day, when I'm
    longing to enjoy myself at home," began Meg, in the complaining tone again.
  </p>
  <p>
    "You don't have half such a hard time as I do," said Jo. "How would you like
    to be shut up for hours with a nervous, fussy old lady, who keeps you
    trotting, is never satisfied, and worries you till you're ready to fly out
    of the window or cry?"
  </p>

  <a
    href="https://www.gutenberg.org/cache/epub/37106/pg37106-images.html"
    target="_blank"
    rel="noopener noreferrer"
  >
    Read more
  </a>
</div>

<style>
  .container {
    max-width: 100ch;
    margin: 1rem auto;
    padding: 1.5rem;

    display: flex;
    flex-flow: column nowrap;
    gap: 1rem;
  }

  h2 {
    text-align: center;
  }
</style>
