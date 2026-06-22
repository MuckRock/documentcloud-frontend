<script lang="ts">
  import four04 from "./assets/404_Media_logo.svg.png";
  import ap from "./assets/Associated_Press_logo_2012.svg.png";
  import cnn from "./assets/CNN.svg.png";
  import eff from "./assets/eff-logo-1color-blue 1.png";
  import latimes from "./assets/Los_Angeles_Times.svg.png";
  import npr from "./assets/NPR_new_logo.svg.png";
  import bostonglobe from "./assets/The_Boston_Globe.svg.png";
  import guardian from "./assets/The_Guardian_2018.svg.png";
  import wapo from "./assets/The_Logo_of_The_Washington_Post_Newspaper.svg.png";
  import wired from "./assets/Wired_logo.svg.png";

  const logos = [
    {
      logo: bostonglobe,
      alt: "The Boston Globe",
      width: 0.585,
      right: 0.114,
    },
    {
      logo: npr,
      alt: "NPR",
      width: 0.234,
    },
    {
      logo: ap,
      alt: "Associated Press",
      width: 0.14,
      right: 0.103,
    },
    {
      logo: wapo,
      alt: "Washington Post",
      width: 0.677,
    },
    {
      logo: latimes,
      alt: "Los Angeles Times",
      width: 0.626,
      right: 0.083,
    },
    {
      logo: four04,
      alt: "404 Media",
      width: 0.286,
    },
    {
      logo: eff,
      alt: "Electronic Frontier Foundation",
      width: 0.517,
      left: 0.028,
      right: 0.149,
    },
    {
      logo: cnn,
      alt: "CNN",
      width: 0.237,
    },
    {
      logo: guardian,
      alt: "The Guardian",
      width: 0.4,
      right: 0.08,
    },
    {
      logo: wired,
      alt: "Wired",
      width: 0.52,
    },
  ];
</script>

<div>
  {#each logos as { logo, alt, width, left, right }}
    <img
      src={logo}
      {alt}
      style:width="{width * 100}%"
      style:margin-left="{(left ?? 0) * 100}%"
      style:margin-right="{(right ?? 0) * 100}%"
    />
  {/each}
</div>

<style>
  div {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    row-gap: 28px;
  }

  img {
    object-fit: contain;
  }
</style>
