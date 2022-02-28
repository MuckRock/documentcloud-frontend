<script lang="ts">
  import Button from "@/common/Button";
  import Tooltip from "@/common/Tooltip";
  import HtmlEditor from "@/common/HtmlEditor";
  import { addonDialogs } from "./addonDialogs";
  import { addons, dispatchAddon } from "@/manager/addons";
  import { viewer } from "@/viewer/viewer";
  import emitter from "@/emit";
  import { _ } from "svelte-i18n";

  // Stores
  import { layout } from "@/manager/layout";
  import { layout as viewerLayout } from "@/viewer/layout";

  import Ajv from "ajv";
  import { Form, components } from "@pyoner/svelte-form";
  import { createAjvValidator } from "@pyoner/svelte-form-ajv";

  
  import * as simple from "./samples/simple";
  import * as single from "./samples/single";
  import * as array from "./samples/array";

  import jsonSchemaDraft7 from "ajv/lib/refs/json-schema-draft-07.json";

  let samples = [
    ["Simple", simple],
    ["Single", single],
    ["Array", array],
  ];

  const jsonSchemaDraft4 = {
    id: "http://json-schema.org/draft-04/schema#",
    $schema: "http://json-schema.org/draft-04/schema#",
    description: "Core schema meta-schema",
    definitions: {
      schemaArray: {
        type: "array",
        minItems: 1,
        items: { $ref: "#" },
      },
      positiveInteger: {
        type: "integer",
        minimum: 0,
      },
      positiveIntegerDefault0: {
        allOf: [{ $ref: "#/definitions/positiveInteger" }, { default: 0 }],
      },
      simpleTypes: {
        enum: [
          "array",
          "boolean",
          "integer",
          "null",
          "number",
          "object",
          "string",
        ],
      },
      stringArray: {
        type: "array",
        items: { type: "string" },
        minItems: 1,
        uniqueItems: true,
      },
    },
    type: "object",
    properties: {
      id: {
        type: "string",
      },
      $schema: {
        type: "string",
      },
      title: {
        type: "string",
      },
      description: {
        type: "string",
      },
      default: {},
      multipleOf: {
        type: "number",
        minimum: 0,
        exclusiveMinimum: true,
      },
      maximum: {
        type: "number",
      },
      exclusiveMaximum: {
        type: "boolean",
        default: false,
      },
      minimum: {
        type: "number",
      },
      exclusiveMinimum: {
        type: "boolean",
        default: false,
      },
      maxLength: { $ref: "#/definitions/positiveInteger" },
      minLength: { $ref: "#/definitions/positiveIntegerDefault0" },
      pattern: {
        type: "string",
        format: "regex",
      },
      additionalItems: {
        anyOf: [{ type: "boolean" }, { $ref: "#" }],
        default: {},
      },
      items: {
        anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }],
        default: {},
      },
      maxItems: { $ref: "#/definitions/positiveInteger" },
      minItems: { $ref: "#/definitions/positiveIntegerDefault0" },
      uniqueItems: {
        type: "boolean",
        default: false,
      },
      maxProperties: { $ref: "#/definitions/positiveInteger" },
      minProperties: { $ref: "#/definitions/positiveIntegerDefault0" },
      required: { $ref: "#/definitions/stringArray" },
      additionalProperties: {
        anyOf: [{ type: "boolean" }, { $ref: "#" }],
        default: {},
      },
      definitions: {
        type: "object",
        additionalProperties: { $ref: "#" },
        default: {},
      },
      properties: {
        type: "object",
        additionalProperties: { $ref: "#" },
        default: {},
      },
      patternProperties: {
        type: "object",
        additionalProperties: { $ref: "#" },
        default: {},
      },
      dependencies: {
        type: "object",
        additionalProperties: {
          anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }],
        },
      },
      enum: {
        type: "array",
        minItems: 1,
        uniqueItems: true,
      },
      type: {
        anyOf: [
          { $ref: "#/definitions/simpleTypes" },
          {
            type: "array",
            items: { $ref: "#/definitions/simpleTypes" },
            minItems: 1,
            uniqueItems: true,
          },
        ],
      },
      format: { type: "string" },
      allOf: { $ref: "#/definitions/schemaArray" },
      anyOf: { $ref: "#/definitions/schemaArray" },
      oneOf: { $ref: "#/definitions/schemaArray" },
      not: { $ref: "#" },
    },
    dependencies: {
      exclusiveMaximum: ["maximum"],
      exclusiveMinimum: ["minimum"],
    },
    default: {},
  };

  const ajv = new Ajv({
    schemaId: "auto",
    jsonPointers: true,
    allErrors: true,
    coerceTypes: true,
  });
  ajv.addMetaSchema(jsonSchemaDraft4);

  const validator = createAjvValidator(ajv);

  let schema, value;

  schema = layout.addonDispatchOpen.parameters;

  let data = "";

  const fieldValid = (value, initial) => value != initial;
  const fieldInvalidText = (value, initial, fieldName) =>
    value == initial ? `The document already has this ${fieldName}` : "";

  const emit = emitter({
    dismiss() {},
  });

  $: addonDispatchOpen = JSON.stringify($layout.addonDispatchOpen);
  $: isViewer = $viewer.document != null;
  $: numSelected = isViewer ? 1 : $layout.numSelected;
  $: selected = isViewer ? [$viewer.document] : $layout.selected;

  const initial =
    ($viewer.document != null ? 1 : $layout.numSelected) == 1
      ? addonDialogs.map((x) =>
          x.fieldAccessor(
            ($viewer.document != null
              ? [$viewer.document]
              : $layout.selected)[0],
          ),
        )
      : addonDialogs.map((_) => "");
  let values = initial != null ? initial.slice() : addonDialogs.map((_) => "");

  $: valid = addonDialogs.some((x, i) =>
    (x.fieldValid || fieldValid)(values[i], initial[i]),
  );
  $: invalidReason = addonDialogs
    .map((x, i) =>
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
    )
    .join(", ");

  async function applyAction() {
    if (!valid) return;

    const fields = {};
    for (let i = 0; i < addonDialogs.length; i++) {
      const addonField = addonDialogs[i];
      if ((addonField.fieldValid || fieldValid)(values[i], initial[i])) {
        fields[addonField.apiField] = values[i];
      }
    }
    dispatchAddon(parseInt(layout.addonDispatchOpen.id, 10), fields, selected);
    emit.dismiss();
  }
</script>

<style lang="scss">
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
</style>

<div>
  <div class="mcontent">
    <h1>
      {$_("dialogAddonDispatchDialog.setAddonParameters", {
        values: { n: numSelected },
      })}
    </h1>
    <!-- <table>
      {#each addonDialogs as addonField, i}
        {#if addonField.disabled == null || !addonField.disabled(numSelected)}
          <tr>
            <td>{$_(addonField.fieldNameUppercase)}:</td>
            <td>
              <div class="inputpadded">
                {#if addonField.isTextArea}
                  <HtmlEditor
                    maxlength={addonField.charLimit}
                    bind:value={values[i]}
                  />
                {:else}
                  <input
                    maxlength={addonField.charLimit}
                    bind:value={values[i]}
                  />
                {/if}
              </div>
            </td>
          </tr>
        {/if}
      {/each}
    </table> -->
    <h5>Other form options:</h5>
    <ul>
      {#each samples as [name, module] (name)}
        <li>
          <a
            href="#{name}"
            on:click={() => {
              schema = module.schema;
              value = module.value;
            }}
          >
            {name}
          </a>
        </li>
      {/each}
    </ul>

    {#if schema}
      <h1>Form</h1>
      <Form {schema} {components} {value} {validator}
        on:submit={(e) => {
          console.log("submits", e);
          data = JSON.stringify(e.detail);
          dispatchAddon(
            parseInt(layout.addonDispatchOpen.id, 10),
            data,
            selected,
          );
          emit.dismiss();
        }}
        on:reset={(e) => {
          console.log("reset", e);
        }}
        >
        <div class="buttonpadded">
          <button type="reset">Reset</button>
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