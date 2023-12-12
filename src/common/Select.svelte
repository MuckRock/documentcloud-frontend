<script>
  export let name;
  export let label;
  export let placeholder = "";
  export let options = []; // [value, name, disabled]
  export let selected;
  export let value = null;

  let input;

  $: valueToName = options.reduce((m, opt) => {
    m.set(opt[0], opt[1]);
    return m;
  }, new Map());

  $: nameToValue = options.reduce((m, opt) => {
    m.set(opt[1], opt[0]);
    return m;
  }, new Map());

  $: value = nameToValue.get(selected);

  function onFocus(e) {
    selected = input.value;
    input.value = "";
  }

  function onBlur(e) {
    input.value = selected;
  }
</script>

<label>
  {label}
  <input
    type="search"
    {name}
    {placeholder}
    list={name}
    bind:this={input}
    bind:value={selected}
    on:focus={onFocus}
    on:blur={onBlur}
  />
  <datalist id={name}>
    {#if nameToValue.has(selected)}
      <optgroup>
        <option>{selected}</option>
      </optgroup>
    {/if}

    {#each options as [value, name, disabled]}
      <option {disabled}>{name}</option>
    {/each}
  </datalist>
</label>

<style>
  label {
    font-weight: bold;
  }

  input,
  input:focus,
  input:focus-visible {
    border: none;
    border-bottom: solid 1px #333;
    border-radius: 0;
  }
</style>
