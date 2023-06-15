<script lang="ts">
  import { nFormatter } from "../util/string.js";

  export let useCount: number;
</script>

<style>
  .container {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  .icon {
    fill: var(--primary, #4294f0);
  }
  .icon svg {
    display: block;
  }
</style>

<div class="container" title={useCount.toString()}>
  <span class="icon">
    <svg width="18px" height="16px" viewBox="0 0 18 16">
      <title>Usage</title>
      <path
        d="M12.0007811,5 C11.4477282,5 11.0009113,4.553125 11.0009113,4 C11.0009113,3.446875 11.4477282,3 12.0007811,3 L17.0001302,3 C17.5531832,3 18,3.446875 18,4 L18,9 C18,9.553125 17.5531832,10 17.0001302,10 C16.4470772,10 16.0002604,9.553125 16.0002604,9 L16.0002604,6.415625 L10.7071996,11.70625 C10.3166254,12.096875 9.68233303,12.096875 9.29175889,11.70625 L6.0015623,8.415625 L1.70837131,12.70625 C1.31779716,13.096875 0.683504752,13.096875 0.292930608,12.70625 C-0.097643536,12.315625 -0.097643536,11.68125 0.292930608,11.290625 L5.29227965,6.290625 C5.6828538,5.9 6.3171462,5.9 6.70772035,6.290625 L10.0010415,9.584375 L14.5848197,5 L12.0007811,5 Z"
        fill-rule="nonzero"
      />
    </svg>
  </span>
  <span class="count">
    {nFormatter(useCount, 1)}
  </span>
</div>
