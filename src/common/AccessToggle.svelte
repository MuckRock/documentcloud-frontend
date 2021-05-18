<script>
  // SVG assets
  import privateIconSvg from "@/assets/private_icon.svg";
  import publicIconSvg from "@/assets/public_icon.svg";
  import organizationIconSvg from "@/assets/organization_icon.svg";
  import { _ } from "svelte-i18n";

  export let access = "private";
  export let editAccess = true;
  export let stacked = false;

  export let publicName = "Public";
  export let collaboratorName = "Collaborator";
  export let privateName = "Private";

  export let publicMessage = $_("accessToggle.public");
  export let collaboratorMessage = $_("accessToggle.collaborator");
  export let privateMessage = $_("accessToggle.private");
</script>

<style lang="scss">
  .access {
    $spacing: 10px;

    display: table;
    table-layout: fixed;
    width: calc(100% + #{$spacing * 2});
    margin: 0 ($spacing * -1);
    border-spacing: $spacing;
    border-collapse: separate;

    .container {
      display: table-cell;
      vertical-align: top;
      border-radius: $radius;
      border: solid 2px transparent;
      box-shadow: 0 0 2px rgba(0, 0, 0, 0.25);
      cursor: pointer;
      transition: border 0.2s ease;
      opacity: 0.5;
      user-select: none;

      &:hover {
        opacity: 0.9;
      }

      &.selected {
        opacity: 1;
      }

      &.public {
        &:hover {
          border: solid 2px rgba($annotationBorder, 0.4);
        }

        &.selected {
          border: solid 2px $annotationBorder;
        }
      }

      &.organization {
        &:hover {
          border: solid 2px rgba($organizationAnnotation, 0.4);
        }

        &.selected {
          border: solid 2px $organizationAnnotation;
        }
      }

      &.private {
        &:hover {
          border: solid 2px rgba($privateAnnotation, 0.4);
        }

        &.selected {
          border: solid 2px $privateAnnotation;
        }
      }

      .item {
        display: table;
        border-spacing: 0;
        width: 100%;

        .icon {
          display: table-cell;
          vertical-align: top;
          width: 30px;
          text-align: center;
          padding-top: 11px;
        }

        .contents {
          display: table-cell;
          vertical-align: top;
          padding-right: 8px;

          h3 {
            font-size: 14px;
            margin: 8px 0 0 0;
          }

          p {
            margin: 6px 0 12px 0;
          }
        }
      }
    }

    &.stacked {
      display: block;
      margin: 10px 0;
      box-sizing: border-box;
      width: inherit;

      .container {
        display: block;
        margin: 6px 0;
      }
    }
  }
</style>

<div class="access" class:stacked>
  {#if editAccess}
    <div
      class="container public"
      class:selected={access == "public"}
      on:click={() => (access = "public")}
    >
      <div class="item">
        <span class="icon">
          {@html publicIconSvg}
        </span>
        <div class="contents">
          <h3>{publicName}</h3>
          <p>{publicMessage}</p>
        </div>
      </div>
    </div>
    <div
      class="container organization"
      class:selected={access == "organization"}
      on:click={() => (access = "organization")}
    >
      <div class="item">
        <span class="icon">
          {@html organizationIconSvg}
        </span>
        <div class="contents">
          <h3>{collaboratorName}</h3>
          <p>{collaboratorMessage}</p>
        </div>
      </div>
    </div>
  {/if}
  <div
    class="container private"
    class:selected={access == "private"}
    on:click={() => (access = "private")}
  >
    <div class="item">
      <span class="icon">
        {@html privateIconSvg}
      </span>
      <div class="contents">
        <h3>{privateName}</h3>
        <p>{privateMessage}</p>
      </div>
    </div>
  </div>
</div>
