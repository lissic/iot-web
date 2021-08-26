<template>
  <section id="app-main" class="app-main">
    <transition name="fade-transform" mode="out-in">
      <router-view :key="key" />
    </transition>
  </section>
</template>

<script>
import screenfull from "screenfull";
export default {
  name: "AppMain",
  computed: {
    key() {
      return this.$route.path;
    }
  },
  mounted() {
    window.addEventListener("resize", () => {
      setTimeout(() => {
        const appMain = document.getElementById("app-main");
        if (screenfull.isFullscreen) {
          appMain.style.height = "100%";
        } else {
          appMain.style.height = "calc(100vh - 50px)";
        }
      }, 200);
    });
  }
};
</script>

<style scoped>
.app-main {
  /*50 = navbar  */
  /* min-height: calc(100vh - 50px); */
  height: calc(100vh - 50px);
  width: 100%;
  position: relative;
  overflow: auto;
}
.fixed-header + .app-main {
  padding-top: 50px;
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}
</style>
