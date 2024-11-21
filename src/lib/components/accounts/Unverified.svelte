<!-- @component
This component displays anywhere we need to explain verification to
a user who is logged in but has `verified_journalist = false`.
-->
<script lang="ts">
  import type { Nullable, User } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { Unverified24 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";
  import Tip from "../common/Tip.svelte";

  import {
    APP_URL,
    SQUARELET_ORGS_URL,
    VERIFICATION_FORM_URL,
  } from "@/config/config.js";
  import { isOrg } from "$lib/api/accounts";

  export let user: Nullable<User> = null;

  const FAQ = `${APP_URL}help/faq#verification`;

  function prefill(form_url: string, user: Nullable<User>) {
    if (!user) return form_url;

    const url = new URL(form_url);

    const accountUrl = `https://accounts.muckrock.com/users/${user.username}/`;
    const orgAccountUrl = isOrg(user.organization)
      ? `https://accounts.muckrock.com/organizations/${user.organization.slug}`
      : "";

    const params = {
      "prefill_MR User Email": user.email ?? "",
      "prefill_MR User Name": user.username ?? "",
      "prefill_MR User Account URL": accountUrl,
      "prefill_MR Organization Account URL": orgAccountUrl,
    };

    url.search = new URLSearchParams(params).toString();

    return url.href;
  }
</script>

<Tip>
  <Unverified24 slot="icon" />
  <p>{$_("unverified.verify")}</p>
  <Flex class="buttons" gap={1}>
    <Button mode="primary" href={SQUARELET_ORGS_URL} target="_blank">
      {$_("unverified.orgs")}
    </Button>
    <Button
      mode="primary"
      href={prefill(VERIFICATION_FORM_URL, user)}
      target="_blank"
    >
      {$_("unverified.requestVerificationAction")}
    </Button>
  </Flex>
  <p>{$_("unverified.allowed_actions")}</p>
  <p>
    <a href={FAQ} target="_blank">
      {$_("unverified.faq")}
    </a>
  </p>
</Tip>
