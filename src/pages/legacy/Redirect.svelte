<script>
  import { onMount } from "svelte";
  import axios from "axios";
  import { pushUrl } from "@/router/router";
  import { projectUrl } from "@/search/search";

  export let query = null;

  const isProjectQuery = /^Project: "(.*)"$/;

  function hash(d = 0, s) {
    // Adapted from https://github.com/sindresorhus/fnv1a
    s = unescape(encodeURIComponent(s));
    if (d == 0) d = 16777619;

    for (let i = 0; i < s.length; i++) {
      d ^= s.charCodeAt(i);
      d += (d << 1) + (d << 4) + (d << 7) + (d << 8) + (d << 24);
    }

    return d >>> 0;
  }

  function validate(value, key) {
    // Validate that the extra hash checks out for the key
    const validation = value[1];
    if (hash(134871, key) % 256 == validation) return value[0];
    return null;
  }

  function lookup(mph, key) {
    // Lookup a key in the minimal perfect hash (with validation)
    const [G, V, size] = mph;
    const d = G[hash(0, key) % size] || 0;
    if (d < 0) return validate(V[-d - 1], key);
    return validate(V[hash(d, key) % size], key);
  }

  function redirectDefault() {
    pushUrl("/");
  }

  async function getMph() {
    // Download and decode minimal perfect hash structure in binary format
    const { data } = await axios.get(process.env.PROJECT_REDIRECT_HASH_URL, {
      responseType: "arraybuffer",
    });

    // Decode hash structure
    const dataview = new DataView(data);
    let offset = 0;
    const size = dataview.getInt32(offset);
    offset += 4;
    const gMin = dataview.getInt32(offset);
    offset += 4;
    const vMin = dataview.getInt32(offset);
    offset += 4;

    const G = [];
    const V = [];
    for (let i = 0; i < size; i++) {
      G.push(dataview.getUint16(offset) + gMin);
      offset += 2;
      const v = dataview.getUint16(offset) + vMin;
      offset += 2;
      const check = dataview.getUint8(offset);
      offset++;
      V.push([v, check]);
    }
    return [G, V, size];
  }

  onMount(async () => {
    try {
      // Try to reroute based on legacy project url's
      const projectQuery = isProjectQuery.exec(decodeURI(query));
      if (projectQuery == null) {
        return redirectDefault();
      } else {
        const projectName = projectQuery[1];
        const mph = await getMph();
        const id = lookup(mph, projectName);
        if (id == null) redirectDefault();
        const redirectUrl = projectUrl({ title: projectName, id });
        pushUrl(decodeURI(redirectUrl));
      }
    } catch (e) {
      // TODO: log
      console.error(e);
      redirectDefault();
    }
  });
</script>
