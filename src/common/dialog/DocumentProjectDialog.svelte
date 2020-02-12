<script>
  import Button from "@/common/Button";
  import Loader from "@/common/Loader";
  import Dropdown from "@/common/Dropdown";
  import Menu from "@/common/Menu";
  import MenuItem from "@/common/MenuItem";
  import Image from "@/common/Image";

  import { layout } from "@/manager/layout";
  import { handlePlural } from "@/util/string";
  import { pageImageUrl } from "@/api/viewer";
  import emitter from "@/emit";

  const emit = emitter({
    dismiss() {}
  });
</script>

<style lang="scss">
  .doctable {
    display: table;
    width: 100%;

    .docrow {
      display: table-row;

      > * {
        vertical-align: middle;
        display: table-cell;
        height: 50px;

        :global(img) {
          width: 25px;
          box-shadow: 0 0 2px #0000003b;
          margin: 5px 12px 0 0;
        }
      }

      &.final {
        > * {
          border-top: solid 1px $gray;
        }
      }

      .title {
        color: $gray;
        text-transform: uppercase;
        font-size: 12px;
        height: inherit;
      }

      .dropdown {
        padding: 0 15px;
      }
    }
  }

  .buttonpadded {
    margin: 50px 0 50px -5px;
  }
</style>

<div>
  <div class="mcontent">
    <h1>
      Manage Project Memberships ({$layout.projectDocuments.project.title})
    </h1>
    <div class="inputpadded">
      <div class="doctable">
        <div class="docrow">
          <span />
          <span class="title">Document</span>
          <span class="title">Default collaborator access</span>
          <span class="title">In Project Already</span>
        </div>
        {#each $layout.projectDocuments.documents as document}
          <div class="docrow">
            <span>
              <Image src={pageImageUrl(document, 0, 25)} />
            </span>
            <span>{document.title}</span>
            <span class="dropdown">
              <Dropdown
                table={true}
                bordered={true}
                horizPadding={15}
                vertPadding={8}>
                <span class="action" slot="title">
                  Edit
                  <span class="dropper">▼</span>
                </span>
                <Menu>
                  <MenuItem>
                    Edit
                    <div class="info">
                      Collaborators with edit access can edit this doc
                    </div>
                  </MenuItem>
                  <MenuItem>
                    View
                    <div class="info">Collaborators can only view this doc</div>
                  </MenuItem>
                </Menu>
              </Dropdown>
            </span>
            <span>No</span>
          </div>
        {/each}
        <div class="docrow final">
          <span />
          <span />
          <span>
            Set all to:
            <span class="padder">
              <Button nondescript={true}>Edit</Button>
            </span>
            /
            <span class="padder">
              <Button nondescript={true}>View</Button>
            </span>
          </span>
          <span />
        </div>
      </div>
    </div>
    <div class="buttonpadded">
      <Button>+ Add</Button>
      <Button secondary={true} on:click={emit.dismiss}>Cancel</Button>
    </div>
  </div>
</div>
