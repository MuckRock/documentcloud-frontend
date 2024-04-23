// bust cache after a production deploy succeeds

const { CLOUDFLARE_ID, CLOUDFLARE_TOKEN } = process.env;
const PURGE_URL = `https://api.cloudflare.com/client/v4
/zones/${CLOUDFLARE_ID}/purge_cache`;

export async function onSuccess() {
  if (!CLOUDFLARE_ID) {
    console.error("CLOUDFLARE_ID is not set.");
    return;
  }

  const resp = await fetch(PURGE_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${CLOUDFLARE_TOKEN}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ purge_everything: true }),
  });

  if (!resp.ok) {
    console.error("Error purging cache.");
    console.error(`${resp.status}: ${resp.statusText}`);
  }

  const result = await resp.json();

  console.log(JSON.stringify(result, null, 2));
}
