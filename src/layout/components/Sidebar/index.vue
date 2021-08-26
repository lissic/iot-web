<template>
  <div :class="{'has-logo':showLogo}">
    <div class="logoBox" :collapse="isCollapse">
      <div class="imgbox">
        <img src="@/assets/name.png" />
      </div>
      <div class="text-box" v-show="!isCollapse">
        <span>智慧能源监控平台</span>
        <span>Smart iot,Smart life</span>
      </div>
    </div>
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="true"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item
          v-for="route in permission_routers"
          :key="route.path"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Logo from "./Logo";
import SidebarItem from "./SidebarItem";
import variables from "@/styles/variables.scss";

export default {
  components: { SidebarItem, Logo },
  computed: {
    ...mapGetters(["sidebar", "permission_routers"]),
    routes() {
      return this.$router.options.routes;
    },
    activeMenu() {
      const route = this.$route;
      const { meta, path } = route;
      if (meta.activeMenu) {
        return meta.activeMenu;
      }
      return path;
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo;
    },
    variables() {
      return variables;
    },
    isCollapse() {
      return !this.sidebar.opened;
    }
  }
};
</script>
<style scoped>
.logoBox {
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #1f2d3d;
}
.logoBox .imgbox {
  width: 45px;
  height: 45px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease-in;
}
.logoBox .imgbox img {
  width: 100%;
  height: 100%;
}
.text-box {
  width: 60%;
  height: 100%;
  color: #c8d1db;
  margin-left: 10px;
  font-size: 12px;
  vertical-align: middle;
  padding-top: 4%;
  transition: all 0.3s ease-in;
  letter-spacing: 1px;
}
</style>
