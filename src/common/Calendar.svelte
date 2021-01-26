<script>
  import { lpad } from "@/util/string";

  // SVG assets
  import CalendarLeft from "@/assets/calendar_left.svg";
  import CalendarRight from "@/assets/calendar_right.svg";

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  function roundMinutes(date) {
    date.setMinutes(Math.round(date.getMinutes() / 15) * 15);
    return date;
  }

  const _now = new Date();
  const now = roundMinutes(
    new Date(new Date(_now).setHours(_now.getHours() + 1))
  ); // now is 1 hr from now to avoid issues
  export let value = now;

  if (value == null) value = now;

  let startMonth = value.getMonth();
  let startYear = value.getFullYear();

  let month = value.getMonth();
  let viewedMonth = month;
  let year = value.getFullYear();
  let viewedYear = year;
  let dayOfMonth = value.getDate();

  let hour = value.getHours() % 12;
  let minute = value.getMinutes();
  let amPm = value.getHours() >= 12;

  function deriveValue() {
    return new Date(
      year,
      month,
      dayOfMonth,
      (amPm ? 1 : 0) * 12 + hour,
      minute
    );
  }

  $: value = deriveValue(year, month, dayOfMonth, hour, minute, amPm);

  function dateLessThan(day, now) {
    return (
      day.getFullYear() < now.getFullYear() ||
      (day.getFullYear() == now.getFullYear() &&
        day.getMonth() < now.getMonth()) ||
      (day.getFullYear() == now.getFullYear() &&
        day.getMonth() == now.getMonth() &&
        day.getDate() < now.getDate())
    );
  }

  function setMonth(delta) {
    viewedMonth += delta;
    while (viewedMonth < 0) {
      viewedMonth += 12;
      viewedYear--;
    }
    while (viewedMonth >= 12) {
      viewedMonth -= 12;
      viewedYear++;
    }
  }

  function getDayObjects(month, year) {
    const date = new Date(year, month, 1);
    const days = [];

    // Get Sunday before the 1st
    const dayOfWeek = date.getDay();
    date.setDate(date.getDate() - dayOfWeek);

    const row = [];
    for (let i = 0; i < 7; i++) {
      row.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    days.push(row);

    while (date.getMonth() == month) {
      const row = [];
      for (let i = 0; i < 7; i++) {
        row.push(new Date(date));
        date.setDate(date.getDate() + 1);
      }
      days.push(row);
    }

    return days;
  }

  $: days = getDayObjects(viewedMonth, viewedYear);
</script>

<style lang="scss">
  .calendarcontainer {
    width: 100%;
    max-width: 300px;

    table {
      width: 100%;
      user-select: none;

      td {
        @include buttonLike;
        text-align: center;
        color: $primary;
        font-weight: bold;
        position: relative;

        &::before {
          content: "";
          position: absolute;
          $circleSize: 26px;
          width: $circleSize;
          height: $circleSize;
          border-radius: $circleSize;
          background: rgba($primary, 0.18);
          left: 50%;
          top: 50%;
          margin-left: -$circleSize / 2;
          margin-top: -$circleSize / 2;
          z-index: -1;
        }

        &.selected {
          background: $primary;
          color: white;
        }

        &.disabled {
          font-weight: normal;
          color: black;
          opacity: 0.3;
          pointer-events: none;

          &::before {
            display: none;
          }
        }

        &.plain {
          font-weight: normal;
        }
      }
    }
  }

  .calendarheader {
    display: table;
    width: 100%;
    margin-top: 16px;
  }

  .monthrow {
    display: table-row;
    background: $primary;
    color: white;

    .arrow {
      @include buttonLike;
      display: table-cell;
      padding: 0 10px;

      &.hidden {
        opacity: 0.4;
        pointer-events: none;
      }
    }

    .month {
      display: table-cell;
      width: 100%;
      text-align: center;
      padding: 10px;
      font-weight: bold;
      user-select: none;
    }
  }

  .timepicker {
    margin-top: 15px;

    .currentdate {
      margin: 5px 0;
      font-weight: bold;
    }
  }
</style>

<div class="calendarcontainer">
  <div class="calendarheader">
    <div class="monthrow">
      <div
        class="arrow"
        class:hidden={viewedYear * 12 + viewedMonth <=
          startYear * 12 + startMonth}
        on:click={() => setMonth(-1)}
      >{@html CalendarLeft}</div>
      <div class="month">{months[viewedMonth]} {viewedYear}</div>
      <div class="arrow" on:click={() => setMonth(1)}>
        {@html CalendarRight}
      </div>
    </div>
  </div>
  <table>
    {#each days as week}
      <tr>
        {#each week as day}
          <td
            class:disabled={dateLessThan(day, now)}
            class:plain={day.getMonth() != viewedMonth}
            class:selected={day.getFullYear() == year &&
              day.getMonth() == month &&
              day.getDate() == dayOfMonth}
            on:click={() => {
              dayOfMonth = day.getDate();
              month = day.getMonth();
              year = day.getFullYear();
            }}>{day.getDate()}</td
          >
        {/each}
      </tr>
    {/each}
  </table>

  <div class="timepicker">
    <div class="currentdate">{months[month]} {dayOfMonth}, {year}</div>
    <select bind:value={hour}>
      {#each Array(12) as _, i}
        <option value={i + 1}>{i + 1}</option>
      {/each}
    </select>
    :
    <select bind:value={minute}>
      {#each Array(60) as _, i}
        <option value={i}>{lpad(`${i}`, 2)}</option>
      {/each}
    </select>
    <select bind:value={amPm}>
      <option value={false}>AM</option>
      <option value={true}>PM</option>
    </select>
  </div>
</div>
