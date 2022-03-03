<script lang="ts">
  import Button from "@/common/Button";
  import { addons, dispatchAddon } from "@/manager/addons";
  import { search, initSearch } from "@/search/search";
  import { viewer } from "@/viewer/viewer";
  import emitter from "@/emit";
  import { _ } from "svelte-i18n";

  // Stores
  import { layout } from "@/manager/layout";
  // import { layout as viewerLayout } from "@/viewer/layout";

  import Ajv from "ajv";
  import {components} from "./DCDefaultFormComponents"
   import { Form /*, components*/  } from "@pyoner/svelte-form";
  import { createAjvValidator } from "@pyoner/svelte-form-ajv";

  const ajv = new Ajv({
    schemaId: "auto",
    jsonPointers: true,
    allErrors: true,
    coerceTypes: true,
  });

  const validator = createAjvValidator(ajv);

  let schema, value;

  schema = layout.addonDispatchOpen.parameters;

  /* TODO: internationalize errors as before:
    const fieldValid = (value, initial) => value != initial;
    const fieldInvalidText = (value, initial, fieldName) =>
      value == initial ? `The document already has this ${fieldName}` : "";
  $_(
        (x.fieldInvalidText || fieldInvalidText)(
          values[i],
          initial[i],
          x.fieldName,
        ),
        {
          values: { fieldName: $_(x.fieldName) },
        },
      ), 
  */

  const emit = emitter({
    dismiss() {},
  });

  $: isViewer = $viewer.document != null;
  $: numSelected = isViewer ? 1 : $layout.numSelected;
  $: selected = isViewer ? [$viewer.document] : $layout.selected;
</script>

<style lang="scss">

  #repository-detail {
      font-size: 16px;
      font-weight: normal;

      a {
        text-decoration: underline;
      }
  }
  input,
  table {
    position: border-box;
    width: 100%;
    font-size: 16px;
    font-family: inherit;
  }

  td:first-child {
    white-space: nowrap;
    padding-right: 5px;
  }

  td:last-child {
    width: 100%;
    position: relative;
  }

  $font-size-sm: 0.7rem !default;
  $font-size-lg: 0.9rem !default;
  $line-height: 1.2rem !default;

  $unit-1: 0.2rem !default;
  $unit-2: 0.4rem !default;
  $unit-3: 0.6rem !default;
  $unit-4: 0.8rem !default;

  $layout-spacing: $unit-2 !default;
  $layout-spacing-sm: $unit-1 !default;
  $layout-spacing-lg: $unit-4 !default;

  // Core variables
  $version: "0.5.9";

  // Core features
  $rtl: false !default;

  // Core colors
  $primary-color: #5755d9 !default;
  $primary-color-dark: darken($primary-color, 3%) !default;
  $primary-color-light: lighten($primary-color, 3%) !default;
  $secondary-color: lighten($primary-color, 37.5%) !default;
  $secondary-color-dark: darken($secondary-color, 3%) !default;
  $secondary-color-light: lighten($secondary-color, 3%) !default;

  // Gray colors
  $dark-color: #303742 !default;
  $light-color: #fff !default;
  $gray-color: lighten($dark-color, 55%) !default;
  $gray-color-dark: darken($gray-color, 30%) !default;
  $gray-color-light: lighten($gray-color, 20%) !default;

  $border-color: lighten($dark-color, 65%) !default;
  $border-color-dark: darken($border-color, 10%) !default;
  $border-color-light: lighten($border-color, 8%) !default;
  $bg-color: lighten($dark-color, 75%) !default;
  $bg-color-dark: darken($bg-color, 3%) !default;
  $bg-color-light: $light-color !default;

  // Control colors
  $success-color: #32b643 !default;
  $warning-color: #ffb700 !default;
  $error-color: #e85600 !default;

  // Other colors
  $code-color: #d73e48 !default;
  $highlight-color: #ffe9b3 !default;
  $body-bg: $bg-color-light !default;
  $body-font-color: lighten($dark-color, 5%) !default;
  $link-color: $primary-color !default;
  $link-color-dark: darken($link-color, 10%) !default;
  $link-color-light: lighten($link-color, 10%) !default;

  // Fonts
  // Credit: https://www.smashingmagazine.com/2015/11/using-system-ui-fonts-practical-guide/
  $base-font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI",
    Roboto !default;
  $mono-font-family: "SF Mono", "Segoe UI Mono", "Roboto Mono", Menlo, Courier,
    monospace !default;
  $fallback-font-family: "Helvetica Neue", sans-serif !default;
  $cjk-zh-hans-font-family: $base-font-family, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", $fallback-font-family !default;
  $cjk-zh-hant-font-family: $base-font-family, "PingFang TC",
    "Hiragino Sans CNS", "Microsoft JhengHei", $fallback-font-family !default;
  $cjk-jp-font-family: $base-font-family, "Hiragino Sans",
    "Hiragino Kaku Gothic Pro", "Yu Gothic", YuGothic, Meiryo,
    $fallback-font-family !default;
  $cjk-ko-font-family: $base-font-family, "Malgun Gothic", $fallback-font-family !default;
  $body-font-family: $base-font-family, $fallback-font-family !default;

  // Unit sizes
  $unit-o: 0.05rem !default;
  $unit-h: 0.1rem !default;
  $unit-1: 0.2rem !default;
  $unit-2: 0.4rem !default;
  $unit-3: 0.6rem !default;
  $unit-4: 0.8rem !default;
  $unit-5: 1rem !default;
  $unit-6: 1.2rem !default;
  $unit-7: 1.4rem !default;
  $unit-8: 1.6rem !default;
  $unit-9: 1.8rem !default;
  $unit-10: 2rem !default;
  $unit-12: 2.4rem !default;
  $unit-16: 3.2rem !default;

  // Font sizes
  $html-font-size: 20px !default;
  $html-line-height: 1.5 !default;
  $font-size: 0.8rem !default;
  $font-size-sm: 0.7rem !default;
  $font-size-lg: 0.9rem !default;
  $line-height: 1.2rem !default;

  // Sizes
  $layout-spacing: $unit-2 !default;
  $layout-spacing-sm: $unit-1 !default;
  $layout-spacing-lg: $unit-4 !default;
  $border-radius: $unit-h !default;
  $border-width: $unit-o !default;
  $border-width-lg: $unit-h !default;
  $control-size: $unit-9 !default;
  $control-size-sm: $unit-7 !default;
  $control-size-lg: $unit-10 !default;
  $control-padding-x: $unit-2 !default;
  $control-padding-x-sm: $unit-2 * 0.75 !default;
  $control-padding-x-lg: $unit-2 * 1.5 !default;
  $control-padding-y: ($control-size - $line-height) / 2 - $border-width !default;
  $control-padding-y-sm: ($control-size-sm - $line-height) / 2 - $border-width !default;
  $control-padding-y-lg: ($control-size-lg - $line-height) / 2 - $border-width !default;
  $control-icon-size: 0.8rem !default;

  $control-width-xs: 180px !default;
  $control-width-sm: 320px !default;
  $control-width-md: 640px !default;
  $control-width-lg: 960px !default;
  $control-width-xl: 1280px !default;

  // Responsive breakpoints
  $size-xs: 480px !default;
  $size-sm: 600px !default;
  $size-md: 840px !default;
  $size-lg: 960px !default;
  $size-xl: 1280px !default;
  $size-2x: 1440px !default;

  $responsive-breakpoint: $size-xs !default;

  // Z-index
  $zindex-0: 1 !default;
  $zindex-1: 100 !default;
  $zindex-2: 200 !default;
  $zindex-3: 300 !default;
  $zindex-4: 400 !default;

  // Forms
  .form-group {
    &:not(:last-child) {
      margin-bottom: $layout-spacing;
    }
  }

  fieldset {
    margin-bottom: $layout-spacing-lg;
  }

  legend {
    font-size: $font-size-lg;
    font-weight: 500;
    margin-bottom: $layout-spacing-lg;
  }

  // Form element: Label
  .form-label {
    display: block;
    line-height: $line-height;
    padding: $control-padding-y + $border-width 0;

    &.label-sm {
      font-size: $font-size-sm;
      padding: $control-padding-y-sm + $border-width 0;
    }

    &.label-lg {
      font-size: $font-size-lg;
      padding: $control-padding-y-lg + $border-width 0;
    }
  }

  // Form element: Input
  .form-input {
    appearance: none;
    background: $bg-color-light;
    background-image: none;
    border: $border-width solid $border-color-dark;
    border-radius: $border-radius;
    color: $body-font-color;
    display: block;
    font-size: $font-size;
    height: $control-size;
    line-height: $line-height;
    max-width: 100%;
    outline: none;
    padding: $control-padding-y $control-padding-x;
    position: relative;
    transition: background 0.2s, border 0.2s, box-shadow 0.2s, color 0.2s;
    width: 100%;
    &:focus {
      border-color: $primary-color;
    }
    &::placeholder {
      color: $gray-color;
    }

    // Input sizes
    &.input-sm {
      font-size: $font-size-sm;
      height: $control-size-sm;
      padding: $control-padding-y-sm $control-padding-x-sm;
    }

    &.input-lg {
      font-size: $font-size-lg;
      height: $control-size-lg;
      padding: $control-padding-y-lg $control-padding-x-lg;
    }

    &.input-inline {
      display: inline-block;
      vertical-align: middle;
      width: auto;
    }

    // Input types
    &[type="file"] {
      height: auto;
    }
  }

  // Form element: Textarea
  textarea.form-input {
    &,
    &.input-lg,
    &.input-sm {
      height: auto;
    }
  }

  // Form element: Input hint
  .form-input-hint {
    color: $gray-color;
    font-size: $font-size-sm;
    margin-top: $unit-1;

    .has-success &,
    .is-success + & {
      color: $success-color;
    }

    .has-error &,
    .is-error + & {
      color: $error-color;
    }
  }

  // Form element: Select
  .form-select {
    appearance: none;
    border: $border-width solid $border-color-dark;
    border-radius: $border-radius;
    color: inherit;
    font-size: $font-size;
    height: $control-size;
    line-height: $line-height;
    outline: none;
    padding: $control-padding-y $control-padding-x;
    vertical-align: middle;
    width: 100%;
    background: $bg-color-light;
    &:focus {
      border-color: $primary-color;
    }
    &::-ms-expand {
      display: none;
    }

    // Select sizes
    &.select-sm {
      font-size: $font-size-sm;
      height: $control-size-sm;
      padding: $control-padding-y-sm
        ($control-icon-size + $control-padding-x-sm) $control-padding-y-sm
        $control-padding-x-sm;
    }

    &.select-lg {
      font-size: $font-size-lg;
      height: $control-size-lg;
      padding: $control-padding-y-lg
        ($control-icon-size + $control-padding-x-lg) $control-padding-y-lg
        $control-padding-x-lg;
    }

    // Multiple select
    &[size],
    &[multiple] {
      height: auto;
      padding: $control-padding-y $control-padding-x;

      option {
        padding: $unit-h $unit-1;
      }
    }
    &:not([multiple]):not([size]) {
      background: $bg-color-light
        url("data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%204%205'%3E%3Cpath%20fill='%23667189'%20d='M2%200L0%202h4zm0%205L0%203h4z'/%3E%3C/svg%3E")
        no-repeat right 0.35rem center / 0.4rem 0.5rem;
      padding-right: $control-icon-size + $control-padding-x;
    }
  }

  // Form Icons
  .has-icon-left,
  .has-icon-right {
    position: relative;

    .form-icon {
      height: $control-icon-size;
      margin: 0 $control-padding-y;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: $control-icon-size;
      z-index: $zindex-0 + 1;
    }
  }

  .has-icon-left {
    .form-icon {
      left: $border-width;
    }

    .form-input {
      padding-left: $control-icon-size + $control-padding-y * 2;
    }
  }

  .has-icon-right {
    .form-icon {
      right: $border-width;
    }

    .form-input {
      padding-right: $control-icon-size + $control-padding-y * 2;
    }
  }

  // Form element: Checkbox and Radio
  .form-checkbox,
  .form-radio,
  .form-switch {
    display: block;
    line-height: $line-height;
    margin: ($control-size - $control-size-sm) / 2 0;
    min-height: $control-size-sm;
    padding: (($control-size-sm - $line-height) / 2) $control-padding-x
      (($control-size-sm - $line-height) / 2)
      ($control-icon-size + $control-padding-x);
    position: relative;

    input {
      clip: rect(0, 0, 0, 0);
      height: 1px;
      margin: -1px;
      overflow: hidden;
      position: absolute;
      width: 1px;
      &:focus + .form-icon {
        border-color: $primary-color;
      }
      &:checked + .form-icon {
        background: $primary-color;
        border-color: $primary-color;
      }
    }

    .form-icon {
      border: $border-width solid $border-color-dark;
      cursor: pointer;
      display: inline-block;
      position: absolute;
      transition: background 0.2s, border 0.2s, box-shadow 0.2s, color 0.2s;
    }

    // Input checkbox, radio and switch sizes
    &.input-sm {
      font-size: $font-size-sm;
      margin: 0;
    }

    &.input-lg {
      font-size: $font-size-lg;
      margin: ($control-size-lg - $control-size-sm) / 2 0;
    }
  }

  .form-checkbox,
  .form-radio {
    .form-icon {
      background: $bg-color-light;
      height: $control-icon-size;
      left: 0;
      top: ($control-size-sm - $control-icon-size) / 2;
      width: $control-icon-size;
    }

    input {
      &:active + .form-icon {
        background: $bg-color-dark;
      }
    }
  }
  .form-checkbox {
    .form-icon {
      border-radius: $border-radius;
    }

    input {
      &:checked + .form-icon {
        &::before {
          background-clip: padding-box;
          border: $border-width-lg solid $light-color;
          border-left-width: 0;
          border-top-width: 0;
          content: "";
          height: 9px;
          left: 50%;
          margin-left: -3px;
          margin-top: -6px;
          position: absolute;
          top: 50%;
          transform: rotate(45deg);
          width: 6px;
        }
      }
      &:indeterminate + .form-icon {
        background: $primary-color;
        border-color: $primary-color;
        &::before {
          background: $bg-color-light;
          content: "";
          height: 2px;
          left: 50%;
          margin-left: -5px;
          margin-top: -1px;
          position: absolute;
          top: 50%;
          width: 10px;
        }
      }
    }
  }
  .form-radio {
    .form-icon {
      border-radius: 50%;
    }

    input {
      &:checked + .form-icon {
        &::before {
          background: $bg-color-light;
          border-radius: 50%;
          content: "";
          height: 6px;
          left: 50%;
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 6px;
        }
      }
    }
  }

  // Form element: Switch
  .form-switch {
    padding-left: ($unit-8 + $control-padding-x);

    .form-icon {
      background: $gray-color;
      background-clip: padding-box;
      border-radius: $unit-2 + $border-width;
      height: $unit-4 + $border-width * 2;
      left: 0;
      top: ($control-size-sm - $unit-4) / 2 - $border-width;
      width: $unit-8;
      &::before {
        background: $bg-color-light;
        border-radius: 50%;
        content: "";
        display: block;
        height: $unit-4;
        left: 0;
        position: absolute;
        top: 0;
        transition: background 0.2s, border 0.2s, box-shadow 0.2s, color 0.2s,
          left 0.2s;
        width: $unit-4;
      }
    }

    input {
      &:checked + .form-icon {
        &::before {
          left: 14px;
        }
      }
      &:active + .form-icon {
        &::before {
          background: $bg-color;
        }
      }
    }
  }

  // Form element: Input groups
  .input-group {
    display: flex;

    .input-group-addon {
      background: $bg-color;
      border: $border-width solid $border-color-dark;
      border-radius: $border-radius;
      line-height: $line-height;
      padding: $control-padding-y $control-padding-x;
      white-space: nowrap;

      &.addon-sm {
        font-size: $font-size-sm;
        padding: $control-padding-y-sm $control-padding-x-sm;
      }

      &.addon-lg {
        font-size: $font-size-lg;
        padding: $control-padding-y-lg $control-padding-x-lg;
      }
    }

    .form-input,
    .form-select {
      flex: 1 1 auto;
      width: 1%;
    }

    .input-group-btn {
      z-index: $zindex-0;
    }

    .form-input,
    .form-select,
    .input-group-addon,
    .input-group-btn {
      &:first-child:not(:last-child) {
        border-bottom-right-radius: 0;
        border-top-right-radius: 0;
      }
      &:not(:first-child):not(:last-child) {
        border-radius: 0;
        margin-left: -$border-width;
      }
      &:last-child:not(:first-child) {
        border-bottom-left-radius: 0;
        border-top-left-radius: 0;
        margin-left: -$border-width;
      }
      &:focus {
        z-index: $zindex-0 + 1;
      }
    }

    .form-select {
      width: auto;
    }

    &.input-inline {
      display: inline-flex;
    }
  }

  // Form validation states
  .form-input,
  .form-select {
    .has-success &,
    &.is-success {
      background: lighten($success-color, 53%);
      border-color: $success-color;
    }

    .has-error &,
    &.is-error {
      background: lighten($error-color, 53%);
      border-color: $error-color;

    }
  }

  .form-checkbox,
  .form-radio,
  .form-switch {
    .has-error &,
    &.is-error {
      .form-icon {
        border-color: $error-color;
      }

      input {
        &:checked + .form-icon {
          background: $error-color;
          border-color: $error-color;
        }

        &:focus + .form-icon {
          border-color: $error-color;
        }
      }
    }
  }

  .form-checkbox {
    .has-error &,
    &.is-error {
      input {
        &:indeterminate + .form-icon {
          background: $error-color;
          border-color: $error-color;
        }
      }
    }
  }

  // validation based on :placeholder-shown (Edge doesn't support it yet)
  .form-input {
    &:not(:placeholder-shown) {
      &:invalid {
        border-color: $error-color;
        &:focus {
          background: lighten($error-color, 53%);
        }

        & + .form-input-hint {
          color: $error-color;
        }
      }
    }
  }

  // Form disabled and readonly
  .form-input,
  .form-select {
    &:disabled,
    &.disabled {
      background-color: $bg-color-dark;
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  .form-input {
    &[readonly] {
      background-color: $bg-color;
    }
  }

  input {
    &:disabled,
    &.disabled {
      & + .form-icon {
        background: $bg-color-dark;
        cursor: not-allowed;
        opacity: 0.5;
      }
    }
  }

  .form-switch {
    input {
      &:disabled,
      &.disabled {
        & + .form-icon::before {
          background: $bg-color-light;
        }
      }
    }
  }

  // Form horizontal
  .form-horizontal {
    padding: $layout-spacing 0;

    .form-group {
      display: flex;
      flex-wrap: wrap;
    }
  }

  // Form inline
  .form-inline {
    display: inline-block;
  }
</style>

<div>
  <div class="mcontent">
    <!-- <h1>
      {$_("dialogAddonDispatchDialog.setAddonParameters", {
        values: { n: numSelected },
      })}
    </h1> -->

    {#if schema}
      <h1>{$_("addonsMenu.addon")}: {layout.addonDispatchOpen.name} <span id="repository-detail">by MuckRock <a target="_new" href="https://www.github.com/{layout.addonDispatchOpen.repository}">(View Source)</a></span></h1>
      <Form
        {schema}
        {components}
        {value}
        {validator}
        on:submit={(e) => {
          console.log("submits", e);
          /* for search query, look at paginator for an example*/
          dispatchAddon(
            parseInt(layout.addonDispatchOpen.id, 10),
            e.detail,
            search &&
              search.params &&
              search.params.params &&
              search.params.params.q,
            selected,
          );
          emit.dismiss();
        }}
        on:reset={(e) => {
          console.log("reset", e);
        }}
      >
      <div class="form-group"></div>
        <div class="buttonpadded">
          <!-- <Button secondary={true} type="reset">Reset</Button> -->

          <!-- disable button when invalid, maybe -->
          <Button type="submit">{$_("dialog.dispatch")}</Button>
          <Button secondary={true} on:click={emit.dismiss}
            >{$_("dialog.cancel")}</Button
          >
        </div>
      </Form>
    {/if}
    <!-- <div class="buttonpadded">
        {#if valid}
          <Button on:click={applyAction}>{$_("dialog.dispatch")}</Button>
        {:else}
          <Tooltip caption={invalidReason} delay={500}>
            <Button disabled={true}>{$_("dialog.dispatch")}</Button>
          </Tooltip>
        {/if}
        <Button secondary={true} on:click={emit.dismiss}
          >{$_("dialog.cancel")}</Button
        >
      </div> -->
  </div>
</div>
