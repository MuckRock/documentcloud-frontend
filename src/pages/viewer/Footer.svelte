<script>
  import { layout } from "@/viewer/layout";
</script>

<style lang="scss">
  footer {
    position: absolute;
    bottom: 0;
    width: 100%;
    background: $viewerPaneColor;
    box-shadow: 0px -2px 4px rgba(0, 0, 0, 0.25);
    z-index: $viewerFooterZ;
  }
</style>

<footer style="height: {$layout.footerHeight}px" />
