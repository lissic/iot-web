<template>
  <div class="centerBox">
    <div class="title">
      <span class="el-icon-s-custom" /> 个人中心
    </div>
    <div class="box">
      <div class="content">
        <el-tabs class="tabBox" tab-position="top" style="height: 100%;">
          <el-tab-pane label="个人信息">
            <el-row :gutter="20">
              <el-col :span="16" style="border-right:1px solid #ccc;">
                <el-form
                  class="infoForm"
                  label-position="right"
                  :model="info"
                  v-loading="loading"
                  label-width="70px"
                >
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="登录名：">
                        <span>{{ info.loginName }}</span>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="昵称：">
                        <el-input v-model="info.nickName" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="性别：">
                        <el-select v-model="info.sex">
                          <el-option label="男" :value="1" />
                          <el-option label="女" :value="0" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="手机号：">
                        <el-input v-model="info.phone" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="邮箱：">
                        <el-input v-model="info.email" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="状态：">
                        <span>{{ info.status==1?"正常":"锁定" }}</span>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-row :gutter="20">
                    <el-col :span="24">
                      <el-form-item label="部门：">
                        <span>{{ info.deptName===null?'暂无':info.deptName }}</span>
                      </el-form-item>
                    </el-col>
                    <el-col :span="24">
                      <el-form-item label="角色：">
                        <span
                          style="maring-right:10px;"
                          v-for="(item,index) in info.roles"
                          :key="index"
                        >{{item.description}}</span>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-row :gutter="20">
                    <el-col :span="12"></el-col>
                    <el-col :span="12"></el-col>
                  </el-row>

                  <el-form-item label="简介：">
                    <el-input v-model="info.introduction" type="textarea" :rows="2" />
                    <div>提示：不能超过200个字符！</div>
                  </el-form-item>
                  <el-form-item>
                    <el-button size="small" type="success" @click="handleUpdate">确定</el-button>
                    <!-- <el-button
                      size="small"
                      title="返回"
                      style="float:right;"
                      icon="el-icon-back"
                      type="success"
                      @click="goBack"
                    ></el-button>-->
                    <el-button size="small" style="float:right;" type="success" @click="goBack">返回</el-button>
                  </el-form-item>
                </el-form>
              </el-col>
              <el-col :span="8">
                <div class="imgBox">
                  <img class="avatar" :src="imgUrl" />
                </div>
                <div class="uploadBox">
                  <el-upload
                    class="upload-demo"
                    :action="uploadUrl"
                    :on-success="handleAvatarSuccess"
                    :before-upload="beforeAvatarUpload"
                    :limit="1"
                    :show-file-list="false"
                  >
                    <el-button size="small" type="primary">更换图像</el-button>
                    <!-- <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div> -->
                  </el-upload>
                </div>
              </el-col>
            </el-row>
          </el-tab-pane>

          <el-tab-pane label="安全设置">
            <div class="tabContent">
              <el-card class="box-card">
                <div class="item">
                  <el-form ref="pwdForm" :rules="pwdRules" :model="pwdForm" label-width="100px">
                    <el-form-item label="旧密码：" prop="oldPwd">
                      <el-input v-model="pwdForm.oldPwd" type="password" />
                    </el-form-item>
                    <el-form-item label="新密码：" prop="newPwd">
                      <el-input v-model="pwdForm.newPwd" type="password" />
                    </el-form-item>
                    <el-form-item label="确认密码：" prop="derterminePwd">
                      <el-input v-model="pwdForm.derterminePwd" type="password" />
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" size="small" @click="pwdSubmit">修改密码</el-button>
                    </el-form-item>
                  </el-form>
                </div>
              </el-card>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>
<script>
import { userUpdate, getInfo, uploadPhoto } from "@/api/user";
import { changePwd } from "@/api/user";
import { avatarUploadUrl } from "@/utils/commonVariable";
export default {
  name: "PersonalCenter",
  data() {
    // 自定义手机号规则
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^1[34578]\d{9}$/;
      if (regMobile.test(value)) {
        return callback();
      }
      // 返回一个错误提示
      callback(new Error("请输入合法的手机号码"));
    };
    // 自定义邮箱规则
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^\w+@\w+(\.\w+)+$/;
      if (regEmail.test(value)) {
        // 合法邮箱
        return callback();
      }
      callback(new Error("请输入合法邮箱"));
    };
    return {
      info: {},
      imgUrl: require("../../assets/user.png"),
      uploadUrl: avatarUploadUrl, //重要--图片上传地址
      fd: "",

      pwdForm: {
        oldPwd: "",
        newPwd: "",
        derterminePwd: ""
      },
      pwdRules: {
        oldPwd: [
          { required: true, message: "请输入旧密码", trigger: "blur" }
          // {
          //   min: 6,
          //   max: 16,
          //   message: "长度在 6 到 12 个字符",
          //   trigger: "blur"
          // },
          // { pattern: /^(\w){6,16}$/, message: "密码由数字、字母、下划线组成" }
        ],
        newPwd: [
          { required: true, message: "请输入新密码", trigger: "blur" },
          // {
          //   min: 6,
          //   max: 12,
          //   message: "长度在 6 到 16 个字符",
          //   trigger: "blur"
          // },
          // { pattern: /^(\w){6,12}$/, message: "密码由数字、字母、下划线组成" }
          {
            pattern: /(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{6,16}/,
            message: "密码复杂度太低，应为6-16位，包含字母、数字、特殊字符！",
            trigger: "blur"
          }
        ],
        derterminePwd: [
          { required: true, message: "请输入确认密码", trigger: "blur" },
          // {
          //   min: 6,
          //   max: 12,
          //   message: "长度在 6 到 12 个字符",
          //   trigger: "blur"
          // },
          // { pattern: /^(\w){6,12}$/, message: "密码由数字、字母、下划线组成" }
          {
            pattern: /(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{6,16}/,
            message: "密码复杂度太低，应为6-16位，包含字母、数字、特殊字符！",
            trigger: "blur"
          }
        ]
      },
      oVal: {},
      nVal: {}
    };
  },
  created() {
    this.getInfo();
  },
  methods: {
    getInfo() {
      this.loading = true;
      getInfo()
        .then(res => {
          if (res.code === "0") {
            this.loading = false;
            this.info = res.data;
            this.imgUrl = res.data.photo;
            this.oVal = {
              nickName: res.data.nickName,
              sex: res.data.sex,
              phone: res.data.phone,
              email: res.data.email,
              introduction: res.data.introduction
            };
          }
        })
        .catch(e => {
          this.loading = false;
        });
    },
    handleUpdate() {
      if (this.info.nickName.length < 2 || this.info.nickName.length > 16) {
        return this.$message({
          type: "warning",
          message: "格式有误，昵称应在2-16位字符之间！"
        });
      }
      const regMobile = /^1[34578]\d{9}$/;
      const regEmail = /^\w+@\w+(\.\w+)+$/;
      if (this.info.phone != "" && regMobile.test(this.info.phone) == false) {
        return this.$message({
          type: "warning",
          message: "请输入合法的手机号码！"
        });
      }
      if (this.info.email != "" && regEmail.test(this.info.email) == false) {
        return this.$message({
          type: "warning",
          message: "请输入合法的邮箱！"
        });
      }

      if (
        this.info.introduction != null &&
        this.info.introduction.length > 200
      ) {
        return this.$message({
          type: "warning",
          message: "简介不能超过200个字符！"
        });
      }

      this.nVal = {
        nickName: this.info.nickName,
        sex: this.info.sex,
        phone: this.info.phone,
        email: this.info.email,
        introduction: this.info.introduction
      };
      let str1 = JSON.stringify(this.oVal);
      let str2 = JSON.stringify(this.nVal);
      if (str2 == str1) {
        return this.$message({
          type: "warning",
          message: "您未作修改！"
        });
      }
      const data = {
        id: this.info.id,
        loginName: this.info.loginName,
        nickName: this.info.nickName,
        sex: this.info.sex,
        phone: this.info.phone,
        email: this.info.email,
        introduction: this.info.introduction
      };
      userUpdate(data).then(res => {
        if (res.code !== "0") {
          return this.$message({
            type: "warning",
            message: "修改失败！"
          });
        }
        this.$message({
          type: "success",
          message: " 修改成功！"
        });
        this.getInfo();
      });
    },
    handleAvatarSuccess(res, file) {
      console.log(res);
    },
    beforeAvatarUpload(file) {
      // const isJPG = file.type === 'image/jpeg'
      // const isLt2M = file.size / 1024 / 1024 < 2

      // if (!isJPG) {
      // this.$message.error('上传头像图片只能是 JPG 格式!')
      // }
      // if (!isLt2M) {
      // this.$message.error('上传头像图片大小不能超过 2MB!')
      // }
      // return isJPG && isLt2M
      // console.log(file)
      this.fd = new FormData();
      this.fd.append("file", file);
      this.fd.append("userId", this.info.id);
      uploadPhoto(this.fd).then(res => {
        if (res.code === "0") {
          this.$message({
            type: "success",
            message: res.msg
          });
          this.imgUrl = res.data;
          window.location.reload();
        }
      });
    },
    pwdSubmit() {
      this.$refs["pwdForm"].validate(valid => {
        if (valid) {
          if (this.pwdForm.derterminePwd !== this.pwdForm.newPwd) {
            return this.$message({
              type: "warning",
              message: "请确认密码！"
            });
          }
          const data = {
            oldPwd: this.pwdForm.oldPwd.trim(),
            newPwd: this.pwdForm.newPwd.trim()
          };
          changePwd(data).then(res => {
            if (res.code !== "0") {
              return this.$message({
                type: "warning",
                message: res.msg
              });
            }
            this.$message({
              type: "success",
              message: res.msg
            });
            this.pwdForm.derterminePwd = this.pwdForm.newPwd = this.pwdForm.oldPwd =
              "";
          });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    goBack() {
      this.$router.go(-1);
    }
  }
};
</script>
<style scoped>
.centerBox {
  padding: 20px;
  width: 100%;
  height: 100%;
  background: #f0f2f5;
}
.box {
  width: 100%;
  height: 90%;
  background: #fff;
  border-radius: 5px;
  box-shadow: 0 0 5px #333;
  margin: 0 auto;
}
.title {
  font-size: 20px;
  padding: 10px;
  border-bottom: 1px solid #ccc;
}
.content {
  padding: 20px;
  overflow: auto;
}
.infoForm {
  width: 100%;
  height: 100%;
}
.infoForm /deep/ .el-form-item {
  width: 85%;
  margin-bottom: 5px;
}
.imgBox {
  width: 80px;
  height: 80px;
  margin: 20px auto;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 0 5px #333;
}
.imgBox .avatar {
  width: 100%;
  height: 100%;
}
.uploadBox {
  text-align: center;
}

.tabContent {
  width: 50%;
}
</style>

