<script lang="ts">
  import { _ } from "svelte-i18n";
  import { handlePlural } from "../../util/string";
  import type { AddOnListItem } from "../browser/AddOnListItem.svelte";
  import Button from "../../common/Button.svelte";
  import Credit from "../../common/icons/Credit.svelte";
  import Price from "../../premium-credits/Price.svelte";
  import UpgradePrompt from "../../premium-credits/UpgradePrompt.svelte";

  export let addon: AddOnListItem;

  // TODO: Load premium user status; if not premium, show upgrade tout
  export let isPremiumUser: boolean = true;
  // TODO: Load credit balance from connected pro/org account
  export let creditBalance: number = 7000;

  let spendingLimitEnabled = false;
  let spendingLimit = 0;

  const { amount, unit } = addon.premium_cost ?? {};
  $: prettyCost = amount && unit ? handlePlural(amount, unit) : null;

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

  function triggerPremiumUpgradeFlow() {
    // TODO: Trigger the premium account upgrade flow
    alert("Upgrade to premium?");
  }

  function triggerCreditPurchaseFlow() {
    // TODO: Trigger the credit purchase flow
    alert("Purchase credits?");
  }
</script>

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

{#if addon.premium}
  {#if isPremiumUser}
    <fieldset class="premium">
      <legend>{$_("addonDispatchDialog.premium")}</legend>
      <div class="row">
        <div class="column">
          {#if prettyCost}
            <h3 class="prettyCost">
              {prettyCost} per credit
            </h3>
          {/if}
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
        </div>
        <div class="column">
          <dl class="creditBalance">
            <dt>Your credit balance</dt>
            <dd><Price value={creditBalance} /></dd>
          </dl>
          <Button
            premium
            fullWidth
            nomargin
            label="Purchase Credits"
            on:click={triggerCreditPurchaseFlow}
          />
        </div>
      </div>
    </fieldset>
  {:else}
    <UpgradePrompt
      message={$_("addonDispatchDialog.premiumUpgrade.message")}
      callToAction={$_("addonDispatchDialog.premiumUpgrade.callToAction")}
      on:click={triggerPremiumUpgradeFlow}
    />
  {/if}
{/if}
