<script lang="ts">
  import { _ } from "svelte-i18n";
  // import Button from "../../common/Button.svelte";
  // import Credit from "../../common/icons/Credit.svelte";
  import Price from "../../premium-credits/Price.svelte";
  import UpgradePrompt from "../../premium-credits/UpgradePrompt.svelte";

  import {
    isPremiumOrg,
    getCreditBalance,
    // triggerCreditPurchaseFlow,
    triggerPremiumUpgradeFlow,
    isOrgAdmin,
  } from "../../manager/orgsAndUsers.js";

  import type { AddOnListItem } from "../types";
  import { type User, isOrg } from "../../api/types/orgAndUser";

  export let addon: AddOnListItem;

  export let user: User | null;

  let spendingLimitEnabled = false;
  let spendingLimit = 0;

  $: creditBalance = isOrg(user?.organization)
    ? getCreditBalance(user.organization)
    : 0;
  $: isIndividualOrg =
    isOrg(user?.organization) && user?.organization?.individual;
  $: isPremium = addon?.parameters?.categories?.includes("premium") ?? false;
  const { amount, unit, price } = addon?.parameters?.cost ?? {};

  function toggleSpendingLimit(
    event: Event & { currentTarget: HTMLInputElement },
  ) {
    const {
      currentTarget: { checked },
    } = event;
    spendingLimitEnabled = checked;
  }

  function setSpendingLimit(
    event: Event & { currentTarget: HTMLInputElement },
  ) {
    const {
      currentTarget: { value },
    } = event;
    let numVal = parseInt(value);
    if (isNaN(numVal) || numVal < 0) {
      numVal = 0;
    }
    if (numVal > creditBalance) {
      numVal = creditBalance;
    }
    spendingLimit = numVal;
  }
</script>

{#if isPremium}
  {#if isPremiumOrg(user?.organization)}
    <fieldset class="premium">
      <legend>{$_("addonDispatchDialog.premium")}</legend>
      <div class="row">
        <div class="column">
          {#if amount}
            <h3 class="prettyCost">
              {$_("addonDispatchDialog.cost", {
                values: { amount: amount, unit: unit, price: price || 1 },
              })}
            </h3>
          {/if}
          <!-- TODO: Support spend limit (#343)
          <label class="spendingLimit">
            <input
              type="checkbox"
              name="setLimit"
              class="toggle"
              on:change={toggleSpendingLimit}
            />
            <span class="label"
              >{$_("addonDispatchDialog.premiumSpendLimit")}</span
            >
            <div class="amount">
              <span class="creditIcon"><Credit size={1.5} /></span>
              <input
                type="number"
                name="limitAmount"
                class="limitInput"
                min={0}
                max={creditBalance}
                bind:value={spendingLimit}
                on:change={setSpendingLimit}
                disabled={!spendingLimitEnabled}
              />
            </div>
          </label>
          -->
        </div>
        <div class="column">
          <dl class="creditBalance">
            <dt>Your credit balance</dt>
            <dd><Price value={creditBalance} /></dd>
          </dl>
          <!-- TODO: Support credit purchases (#342)
          <Button
            premium
            fullWidth
            nomargin
            label="Purchase Credits"
            on:click={triggerCreditPurchaseFlow}
          />
          -->
        </div>
      </div>
    </fieldset>
  {:else if isOrgAdmin(user)}
    <UpgradePrompt
      message={$_("addonDispatchDialog.premiumUpgrade.message", {
        values: {
          plan: isIndividualOrg ? "Professional" : "Organization",
        },
      })}
      callToAction={$_("addonDispatchDialog.premiumUpgrade.callToAction")}
      on:click={() => triggerPremiumUpgradeFlow(user?.organization)}
    />
  {:else}
    <UpgradePrompt
      message={$_("addonDispatchDialog.premiumUpgrade.memberMessage")}
    />
  {/if}
{/if}

<style>
  fieldset {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    margin: 0;
    padding: 1em;
    border-radius: var(--radius);
    border-color: rgba(0, 0, 0, 0.1);
    border-width: 1px;
  }
  legend {
    color: var(--darkgray);
    font-weight: 600;
  }
  .row {
    display: flex;
    gap: 1rem;
  }
  .column {
    min-width: 0;
    flex: 1 1 50%;
    gap: 0.5em;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .prettyCost {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
  }
  /*
  .spendingLimit {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .spendingLimit .label {
    flex: 1 1 auto;
    font-size: 0.8125rem;
    font-style: normal;
    font-weight: 400;
    line-height: 1rem;
  }
  .spendingLimit .toggle {
    flex: 0 1 auto;
    margin: 0;
  }
  .spendingLimit .amount {
    flex: 0 1 4.5rem;
    display: flex;
    align-items: center;
    min-width: 0;
  }
  .spendingLimit .creditIcon {
    flex: 0 1 auto;
  }
  .spendingLimit .limitInput {
    width: auto;
    min-width: 0;
    padding: 0.25rem 0.25rem;
    flex: 0 1 3em;
    font-weight: 600;
    -webkit-appearance: textfield;
    -moz-appearance: textfield;
    appearance: textfield;
  }
  .spendingLimit .limitInput::-webkit-inner-spin-button,
  .spendingLimit .limitInput::-webkit-outer-spin-button {
    -webkit-appearance: none;
  }
  */
  .creditBalance {
    margin: 0;
    font-weight: 600;

    display: flex;
    gap: 1rem;
    justify-content: space-between;
  }
  .creditBalance dt {
    font-size: 0.875em;
    color: var(--gray);
  }
  .creditBalance dd {
    margin: 0;
  }
</style>
