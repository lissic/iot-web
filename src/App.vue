<template>
  <div id="app" @click="isTime">
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      lastTime: null, // 最后一次点击的时间
      currentTime: null, // 当前点击的时间
      timeOut: 30 * 60 * 1000 // 设置超时时间:30分钟
    };
  },
  created() {
    this.lastTime = new Date().getTime();
  },
  methods: {
    isTime() {
      this.currentTime = new Date().getTime(); // 记录这次点击的时间
      if (this.currentTime - this.lastTime > this.timeOut) {
        // 判断上次最后一次点击的时间和这次点击的时间间隔是否大于30分钟
        if (sessionStorage.getItem("userInfo")) {
          // 如果是登录状态
          this.$message({
            type: "success",
            message: "您长时间未操作，即将退出！"
          });
          this.$store.dispatch("user/logout").then(() => {
            this.$router.push(`/login?redirect=${this.$route.fullPath}`);
          });
        } else {
          this.lastTime = new Date().getTime();
        }
      } else {
        this.lastTime = new Date().getTime(); // 如果在30分钟内点击，则把这次点击的时间记录覆盖掉之前存的最后一次点击的时间
      }
    }
  }
};
</script>
<style scoped>
</style>
