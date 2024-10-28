<script lang="ts">
  import { locale } from "svelte-i18n";

  export let date: Date;

  const relativeFormatter = new Intl.RelativeTimeFormat($locale ?? "en", {
    style: "long",
  });

  type Division = {
    amount: number;
    name: Intl.RelativeTimeFormatUnit;
  };

  const DIVISIONS: Division[] = [
    { amount: 60, name: "seconds" },
    { amount: 60, name: "minutes" },
    { amount: 24, name: "hours" },
    { amount: 7, name: "days" },
    { amount: 4.34524, name: "weeks" },
    { amount: 12, name: "months" },
    { amount: Number.POSITIVE_INFINITY, name: "years" },
  ];

  function formatTimeAgo(date: Date): string {
    let duration = (date.getTime() - new Date().getTime()) / 1000;
    let formatted: string = "";

    for (let i = 0; i < DIVISIONS.length; i++) {
      const division = DIVISIONS[i]!;
      if (Math.abs(duration) < division.amount) {
        formatted = relativeFormatter.format(
          Math.round(duration),
          division.name,
        );
        break;
      }
      duration /= division.amount;
    }

    return formatted;
  }
</script>

<time datetime={date.toISOString()} title={date.toISOString()}>
  {formatTimeAgo(date)}
</time>

<style>
  time {
    cursor: default;
  }
</style>
