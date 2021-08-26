<template>
  <div class="login-container">
    <div class="title">智慧能源监控管理平台</div>
    <div class="gifbox" />
    <div class="formbox">
      <div class="leftImg" />
      <div class="form">
        <el-form
          ref="loginform"
          :model="loginForm"
          :rules="loginRules"
          class="loginfrom"
          autocomplete="on"
          label-position="left"
        >
          <el-form-item prop="username" class="form-item-bg">
            <span class="svg-container">
              <svg-icon icon-class="user" />
            </span>
            <el-input
              ref="username"
              v-model="loginForm.username"
              placeholder="用户名"
              name="username"
              type="text"
              tabindex="1"
              autocomplete="on"
            />
          </el-form-item>

          <el-tooltip v-model="capsTooltip" content="Caps lock is On" placement="right" manual>
            <el-form-item prop="password" class="form-item-bg">
              <span class="svg-container">
                <svg-icon icon-class="password" />
              </span>
              <el-input
                :key="passwordType"
                ref="password"
                v-model="loginForm.password"
                :type="passwordType"
                placeholder="密码"
                name="password"
                tabindex="2"
                autocomplete="on"
                @keyup.native="checkCapslock"
                @blur="capsTooltip = false"
                @keyup.enter.native="handleLogin"
              />
              <span class="show-pwd" @click="showPwd">
                <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
              </span>
            </el-form-item>
          </el-tooltip>
          <el-form-item prop="verifyCode" class="form-item-bg verifyCodeItem">
            <!-- <span class="svg-container">
              <svg-icon icon-class="user" />
            </span>-->
            <el-input v-model="loginForm.verifyCode" placeholder="输入验证码" type="text" />
            <img :src="captchaUrl" style="height:25px;margin-right:5px;  " @click="getCaptcha" />
          </el-form-item>

          <el-button
            :loading="loading"
            class="form-item-btn-bg"
            @click.native.prevent="handleLogin"
          >登录</el-button>
        </el-form>
      </div>
    </div>
    <div class="footer">@copyright 北京贺兰云天科技有限公司 2012-2021</div>
  </div>
</template>

<script>
import { validUsername } from "@/utils/validate";
import { captcha } from "@/api/user";

export default {
  name: "Login",
  data() {
    // const validateUsername = (rule, value, callback) => {
    //   if (!validUsername(value)) {
    //     callback(new Error('请输入正确的用户名！'))
    //   } else {
    //     callback()
    //   }
    // }
    const validateUsername = (rule, value, callback) => {
      if (value.trim().length == 0) {
        callback(new Error("用户名不能为空！"));
      } else {
        callback();
      }
    };
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error("密码不能小于6位！"));
      } else {
        callback();
      }
    };
    return {
      loginForm: {
        username: "",
        password: "",
        verifyCode: ""
      },
      loginRules: {
        username: [
          { required: true, trigger: "blur", validator: validateUsername },
          {
            pattern: /^[^\u4e00-\u9fa5]+$/,
            message: "登录名不能为汉字！",
            trigger: "blur"
          }
        ],
        password: [
          { required: true, trigger: "blur", validator: validatePassword }
        ],
        verifyCode: [
          { required: true, trigger: "blur", message: "请输入验证码！" },
          {
            pattern: /^[^\u4e00-\u9fa5]+$/,
            message: "验证码不能为汉字！",
            trigger: "blur"
          }
        ]
      },
      loading: false,
      passwordType: "password",
      redirect: undefined,
      capsTooltip: false,
      captchaUrl: ""
    };
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true
    }
  },
  created() {
    this.getCaptcha();
  },
  mounted() {
    // 按下回车执行登录按钮点击事件
    var _self = this;
    document.onkeydown = function(e) {
      var key = window.event.keyCode;
      if (key === 13) {
        _self.handleLogin();
      }
    };
  },
  methods: {
    getCaptcha() {
      captcha({
        width: 80,
        height: 26
      }).then(res => {
        if (res.code === "0") {
          this.captchaUrl = res.data;
          this.loginForm.verifyCode = "";
        }
      });
    },
    showPwd() {
      if (this.passwordType === "password") {
        this.passwordType = "";
      } else {
        this.passwordType = "password";
      }
      this.$nextTick(() => {
        this.$refs.password.focus();
      });
    },
    handleLogin() {
      this.$refs.loginform.validate(valid => {
        if (valid) {
          this.loading = true;
          this.$store
            .dispatch("user/login", this.loginForm)
            .then(() => {
              // this.$router.push({ path: this.redirect || "/" });
              this.$router.push({ path: "/" });
              this.loading = false;
            })
            .catch(() => {
              this.loading = false;
              this.getCaptcha();
            });
        } else {
          this.getCaptcha();
          // return false
        }
      });
    }
  }
};
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.form-item-bg {
  background: url("~@/assets/login/b.png") no-repeat center;
  background-size: 100% 100%;
  border: none;
}
.form-item-btn-bg {
  width: 100%;
  background: url("~@/assets/login/a.png") no-repeat center;
  background-size: 100% 100%;
  border: none;
  color: #fff;
  letter-spacing: 5px;
}
.form-item-btn-bg:hover {
  color: blue;
}

.login-container {
  min-height: 100%;
  width: 100%;
  // background-color: $bg;
  background: url("~@/assets/login/bj.jpg") no-repeat center;
  background-size: 100% 100%;
  overflow: hidden;

  .title {
    width: 50%;
    height: 50px;
    line-height: 50px;
    text-align: center;
    font-size: 20px;
    color: #fff;
    font-weight: 800;
    margin: 0 auto;
    padding-top: 10px;
  }
  .gifbox {
    position: absolute;
    top: 0;
    left: 50%;
    width: 50%;
    height: 250px;
    margin-left: -25%;
    background: url("~@/assets/login/head.gif") no-repeat center;
    background-size: 100% 100%;
    background-position: 0 -50px;
  }
  .formbox {
    position: absolute;
    left: 50%;
    top: 20%;
    width: 50%;
    height: auto;
    margin-left: -25%;
    padding: 5px;
    display: flex;
    justify-content: space-between;

    .leftImg {
      width: 310px;
      height: 310px;
      background: url("~@/assets/login/d.png") no-repeat center;
      background-size: 100% 100%;
      animation: rotate 20s linear infinite;
    }
    .form {
      width: 50%;
      height: 360px;
      background: url("~@/assets/login/e.png") no-repeat center;
      background-size: 100% 100%;
      .loginfrom {
        width: 75%;
        padding: 5px;
        margin: 0 auto;
        margin-top: 70px;
        .el-form-item__content {
          background: url("~@/assets/login/b.png") no-repeat center;
          background-size: 100% 100%;
        }
      }
    }
  }
  .footer {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    font-size: 12px;
    line-height: 25px;
    color: #eee;
    text-align: center;
    background: rgba(0, 0, 0, 0.5);
  }

  .login-form {
    position: relative;
    // width: 520px;
    // max-width: 100%;
    // padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }
}
</style>
<style scoped>
.verifyCodeItem /deep/ .el-form-item__content {
  display: flex;
  align-items: center;
}
.verifyCodeItem /deep/ .el-form-item__content img {
  cursor: pointer;
}
</style>
