<template>
  <div class="search">
    <img src="../assets/search_icon.svg" />
    <input placeholder="Search" />
  </div>
</template>

<style scoped>
.search {
  background: #f1f2f4;
  height: 42px;
  border-radius: var(--radius);
  margin: 0 0 74px 0;
  width: 100%;
  position: relative;
  box-sizing: border-box;
}

img {
  position: absolute;
  pointer-events: none;
  padding: 13px 17px;
}

input {
  width: 100%;
  height: 100%;
  padding-left: 56px;
  padding-right: 12px;
  font-family: inherit;
  border: none;
  line-height: 42px;
  font-size: 16px;
  color: black;
  outline: none;
  background: none;
  box-sizing: border-box;
}

::placeholder {
  color: rgba(0, 0, 0, 0.76);
}

@media only screen and (max-width: 600px) {
  .search {
    margin: 0 0 44px 0;
  }
}
</style>