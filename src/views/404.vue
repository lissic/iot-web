<template>
  <div class="wscn-http404-container">
    <div class="wscn-http404">
      <div class="pic-404">
        <img class="pic-404__parent" src="@/assets/404_images/404.png" alt="404" />
        <img class="pic-404__child left" src="@/assets/404_images/404_cloud.png" alt="404" />
        <img class="pic-404__child mid" src="@/assets/404_images/404_cloud.png" alt="404" />
        <img class="pic-404__child right" src="@/assets/404_images/404_cloud.png" alt="404" />
      </div>
      <div class="bullshit">
        <div>
          <img src="@/assets/sad.png" alt srcset />
        </div>
        <h3>暂无访问权限！</h3>
        <el-button type="primary" @click="goBack">返回</el-button>
        <el-button type="primary" @click="goOut">退出</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { removeToken } from "@/utils/auth";
export default {
  name: "Page404",
  computed: {
    message() {
      return "The webmaster said that you can not enter this page...";
    }
  },
  methods: {
    goOut() {
      removeToken();
      this.$store.dispatch("user/logout").then(() => {
        this.$router.push("/login");
      });
    },
    goBack() {
      this.$router.go(-1);
    }
  }
};
</script>
<style scoped>
h3 {
  margin: 20px auto;
}
.back {
  float: none !important;
  margin: 0 auto;
}
</style>

<style lang="scss" scoped>
.wscn-http404-container {
  transform: translate(-50%, -50%);
  position: absolute;
  top: 40%;
  left: 50%;
}
.wscn-http404 {
  position: relative;
  width: 1200px;
  padding: 0 50px;
  overflow: hidden;
  .pic-404 {
    position: relative;
    float: left;
    width: 600px;
    overflow: hidden;
    &__parent {
      width: 100%;
    }
    &__child {
      position: absolute;
      &.left {
        width: 80px;
        top: 17px;
        left: 220px;
        opacity: 0;
        animation-name: cloudLeft;
        animation-duration: 2s;
        animation-timing-function: linear;
        animation-fill-mode: forwards;
        animation-delay: 1s;
      }
      &.mid {
        width: 46px;
        top: 10px;
        left: 420px;
        opacity: 0;
        animation-name: cloudMid;
        animation-duration: 2s;
        animation-timing-function: linear;
        animation-fill-mode: forwards;
        animation-delay: 1.2s;
      }
      &.right {
        width: 62px;
        top: 100px;
        left: 500px;
        opacity: 0;
        animation-name: cloudRight;
        animation-duration: 2s;
        animation-timing-function: linear;
        animation-fill-mode: forwards;
        animation-delay: 1s;
      }
      @keyframes cloudLeft {
        0% {
          top: 17px;
          left: 220px;
          opacity: 0;
        }
        20% {
          top: 33px;
          left: 188px;
          opacity: 1;
        }
        80% {
          top: 81px;
          left: 92px;
          opacity: 1;
        }
        100% {
          top: 97px;
          left: 60px;
          opacity: 0;
        }
      }
      @keyframes cloudMid {
        0% {
          top: 10px;
          left: 420px;
          opacity: 0;
        }
        20% {
          top: 40px;
          left: 360px;
          opacity: 1;
        }
        70% {
          top: 130px;
          left: 180px;
          opacity: 1;
        }
        100% {
          top: 160px;
          left: 120px;
          opacity: 0;
        }
      }
      @keyframes cloudRight {
        0% {
          top: 100px;
          left: 500px;
          opacity: 0;
        }
        20% {
          top: 120px;
          left: 460px;
          opacity: 1;
        }
        80% {
          top: 180px;
          left: 340px;
          opacity: 1;
        }
        100% {
          top: 200px;
          left: 300px;
          opacity: 0;
        }
      }
    }
  }
  .bullshit {
    position: relative;
    float: left;
    width: 300px;
    padding: 30px 0;
    overflow: hidden;
    text-align: center;
  }
}
</style>
