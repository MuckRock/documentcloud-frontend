<template>
  <div>
    <div class="mcontent">
      <div v-if="!uploadMode">
        <h1>Document Upload</h1>
        <p
          v-if="files.length == 0"
        >Select or drag a .pdf document to begin the document upload process. You will then be able to edit document information.</p>
        <p v-else>{{files.length}} file{{files.length == 1 ? '' : 's'}} ready to upload</p>
        <div class="actions">
          <Button @click="upload()" class="padright" v-if="files.length > 0">Begin upload</Button>
          <FilePicker v-if="files.length == 0" :multiselect="true" @files="handleFiles($event)">
            <Button>+ Select files</Button>
          </FilePicker>
        </div>
        <DropZone class="dropper" v-if="files.length == 0" @files="handleFiles($event)">
          <span>Drag and drop files here</span>
        </DropZone>
      </div>
      <div v-if="uploadMode">
        <h1>Uploading... ({{numUploaded}}/{{files.length}})</h1>
        <p>Please leave this page open while your documents upload. This dialog will automatically close when they have finished uploading.</p>
      </div>

      <div class="files" v-if="files.length > 0" :class="{padder: uploadMode}">
        <File
          class="file"
          v-for="file in displayFiles"
          :key="file.index"
          :file="file.file"
          :data="file"
          :uploadMode="uploadMode"
          @name="file.name = $event"
          @delete="removeFile(index)"
        />
      </div>
      <div v-if="!uploadMode">
        <div v-if="files.length > 0 && !uploadAdditional">
          <Button
            class="vpadded"
            :nondescript="true"
            @click="uploadAdditional = true"
          >Upload additional files</Button>
        </div>
        <div v-if="files.length > 0 && uploadAdditional">
          <div class="sectionbreak" v-if="files.length > 0"></div>
          <FilePicker v-if="files.length > 0" :multiselect="true" @files="handleFiles($event)">
            <Button :secondary="true" :small="true">+ Select more files</Button>
          </FilePicker>
          <DropZone
            class="dropper"
            :secondary="true"
            v-if="files.length > 0"
            @files="handleFiles($event)"
          >
            <span>Drag and drop additional files here</span>
          </DropZone>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import File from "./File";
import Button from "../common/Button";
import DropZone from "../common/DropZone";
import FilePicker from "../common/FilePicker";

// import { UploadRequest } from "../api";
import Vue from "vue";

export default {
  components: { Button, DropZone, FilePicker, File },
  data() {
    return {
      files: [],
      id: 0,
      uploadMode: false,
      uploadFiles: [],
      uploadAdditional: false
    };
  },
  computed: {
    displayFiles() {
      if (this.uploadMode == false) return this.files;
      return this.uploadFiles;
    },
    numUploaded() {
      if (!this.uploadMode) return 0;
      let total = 0;
      for (let i = 0; i < this.uploadFiles.length; i++) {
        total += this.uploadFiles[i].done ? 1 : 0;
      }
      return total;
    }
  },
  methods: {
    handleFiles(files) {
      for (let i = 0; i < files.length; i++) {
        this.files.push({
          index: this.id++,
          file: files[i]
        });
      }
    },
    removeFile(index) {
      this.files = this.files.filter(file => file.index != index);
    },
    upload() {
      const uploadFiles = [];
      for (let i = 0; i < this.files.length; i++) {
        uploadFiles.push({
          file: this.files[i].file,
          progress: 0,
          done: false,
          index: i
        });
      }
      this.uploadFiles = uploadFiles;
      this.$emit("setDismissable", false);
      this.uploadMode = true;

      Vue.API.uploadDocuments(
        null,
        this.files,
        (index, progress) => {
          // Progress handler
          this.uploadFiles[index].progress = progress;
        },
        (document, index) => {
          // Complete handler
          this.uploadFiles[index].done = true;
          this.$emit("docUploaded", document);
        },
        () => {
          // All complete handler
          this.$emit("allUploaded");
        }
      );
    }
  }
};
</script>

<style scoped>
.actions {
  margin: 1.5em 0;
}

.hdrawer,
.drawer {
  position: sticky;
  position: -webkit-sticky;
  background: var(--modal);
}

.hdrawer {
  top: 0;
  padding: var(--modal-vert-padding) 0 16px 0;
  margin-top: -42px;
}

.drawer {
  bottom: 0;
  padding-top: 16px;
  padding-bottom: var(--modal-vert-padding);
}

.files {
  display: table;
  width: 100%;
}

.padright {
  margin-right: 12px;
}

.dropper {
  margin: 24px 0;
}

.sectionbreak {
  border-bottom: solid 1px var(--gray);
  margin: 2em 0 1.5em 0;
}

.padder {
  margin: 1.5em 0 2.5em 0;
}

.vpadded {
  margin: 2em 0 2.5em 0;
}
</style>
