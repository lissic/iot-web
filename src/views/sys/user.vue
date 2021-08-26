<template>
  <div class="userBox">
    <el-row class="top">
      <el-col :span="24" class="search_col">
        <span>昵称：</span>
        <el-input
          v-model="searchNn"
          placeholder="请输入昵称"
          clearable
          @keyup.enter.native="handleSearch"
        />
        <span>登录名：</span>
        <el-input
          v-model="searchLn"
          placeholder="请输入登录名"
          clearable
          @keyup.enter.native="handleSearch"
        />
        <span>部门：</span>
        <el-input v-model="deptname_search" placeholder="请选择部门" clearable @focus="showDept" />
        <span>状态：</span>
        <el-select
          v-model="searchStatus"
          placeholder="请选择状态"
          clearable
          @keyup.enter.native="handleSearch"
        >
          <el-option label="正常" :value="1" />
          <el-option label="锁定" :value="2" />
        </el-select>
        <span>角色：</span>
        <el-select
          v-model="searchRole"
          placeholder="请选择角色"
          clearable
          @keyup.enter.native="handleSearch"
        >
          <el-option
            v-for=" (item,index) in roleslist"
            :key="index"
            :label="item.description"
            :value="item.id"
          />
        </el-select>
        <el-button size="small" type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button size="small" type="primary" icon="el-icon-refresh" @click="handleRefresh">重置</el-button>
        <el-button
          v-show=" isAdmin "
          size="small"
          type="success"
          icon="el-icon-circle-plus-outline"
          @click="addUser"
        >新增</el-button>
        <el-button
          v-show=" isAdmin "
          size="small"
          type="danger"
          icon="el-icon-delete"
          :disabled="deletDis"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
    </el-row>
    <el-row class="table_row">
      <el-table
        ref="multipleTable"
        v-loading="loading"
        :data="list"
        stripe
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" :selectable="selectHandle" />
        <el-table-column prop="loginName" label="登录名" />
        <el-table-column prop="nickName" label="昵称" />
        <el-table-column prop="roles" label="角色">
          <template slot-scope="scope">
            <span
              style="margin-right:5px;"
              v-for="(item,index) in scope.row.roles"
              :key="index"
            >{{ item.description }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sex" label="性别">
          <template slot-scope="scope">{{ scope.row.sex == 0 ? '女':'男' }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template slot-scope="scope">{{ scope.row.status == 1 ? '正常':'锁定' }}</template>
        </el-table-column>
        <el-table-column prop="phone" label="手机" />
        <el-table-column prop="area" label="所属区域" />
        <el-table-column prop="deptName" label="部门" />
        <el-table-column label="操作" width="180" v-if="isAdmin">
          <template slot-scope="scope">
            <el-button
              v-show="isAdmin"
              type="success"
              icon="el-icon-edit"
              size="mini"
              :disabled="scope.row.loginName =='admin'"
              @click="handleEdit(scope.row)"
            >编辑</el-button>
            <el-button
              v-show="isAdmin"
              type="danger"
              icon="el-icon-delete"
              size="mini"
              :disabled="scope.row.loginName =='admin'"
              @click="handleDelOne(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-row>
    <el-row class="page">
      <el-pagination
        background
        :current-page="current"
        :page-sizes="[10, 20, 30]"
        :page-size="size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-row>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="50%"
      :before-close="handleCancel"
    >
      <el-form ref="form" :rules="formRule" :model="form" label-width="90px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="昵称:" prop="nickName">
              <el-input v-model="form.nickName" placeholder="请输入昵称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="登录名:" prop="loginName">
              <el-input v-model="form.loginName" :disabled="inputDisabled" placeholder="请输入登录名" />
            </el-form-item>
          </el-col>
          <!-- v-show="dialogType==&quot;add&quot; " -->
          <el-col v-show="dialogType=='add' " :span="12">
            <el-form-item label="密码:" prop="password">
              <el-input
                v-model="form.password"
                type="password"
                :disabled="inputDisabled"
                placeholder="请输入密码"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别:">
              <el-select v-model="form.sex" placeholder="请选择性别">
                <el-option label="女" :value="0" />
                <el-option label="男" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱:">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号:">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色:" prop="roles">
              <el-select v-model="form.roles" multiple placeholder="请选择用户角色">
                <el-option
                  v-for=" (item,index) in roleslist"
                  :key="index"
                  :label="item.description"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="所属区域:" class="areaItem">
              <v-distpicker
                class="distpicker"
                :province="sheng"
                :city="shi"
                :area="xian"
                @province="onChangeProvince1"
                @city="onChangeCity"
                @selected="selected"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属部门:">
              <div class="treeBox">
                <el-tree
                  ref="deptTree"
                  :data="deptlist"
                  show-checkbox
                  accordion
                  node-key="id"
                  :default-checked-keys="treeChecked"
                  :props="defaultProps"
                  @check-change="handleCheckChange"
                  @check="handleCheck"
                />
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleDetermine">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="部门" :visible.sync="dialogDept" width="30%" :before-close="handleCancel_dept">
      <div>
        <el-tree
          ref="deptTree_search"
          :data="deptlist"
          show-checkbox
          accordion
          node-key="id"
          :default-checked-keys="treeChecked_search"
          :props="defaultProps"
          @check-change="handleCheckChange_search"
          @check="handleCheck_search"
        />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel_dept">取 消</el-button>
        <el-button type="primary" @click="handleDetermine_dept">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  userList,
  userPage,
  userSave,
  userDelete,
  userUpdate,
  roleList
} from "@/api/user";
import { deptList, deptPage, deptTree } from "@/api/sys";
import VDistpicker from "v-distpicker";

export default {
  components: { VDistpicker },
  data() {
    // 自定义手机号规则
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^1[345678]\d{9}$/;
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
      userInfo: {
        nickName: "admin",
        loginName: "admin",
        sex: 1,
        phone: "123456789",
        deptId: "1",
        status: 1
      },
      deptId: "",
      list: [], // 表格数据
      current: 1,
      size: 10,
      total: 0,
      dialogTitle: "新增用户", // 弹框标题
      dialogVisible: false, // 弹框显示隐藏
      form: {
        // 弹框表单数据
        nickName: "",
        loginName: "",
        password: "",
        sex: 1,
        email: "",
        phone: "",
        area: "",
        deptId: "",
        roles: []
      },
      multipleSelection: [], // 表格多选
      formRule: {
        // 表单验证规则
        nickName: [
          { required: true, message: "请输入昵称！", trigger: "blur" },
          {
            required: true,
            max: 16,
            min: 2,
            message: "格式有误，昵称应在2-16位字符之间！",
            trigger: "blur"
          }
        ],
        loginName: [
          { required: true, message: "请输入登录名！", trigger: "blur" },
          {
            required: true,
            max: 16,
            min: 2,
            message: "格式有误，登录名应在2-16位字符之间！",
            trigger: "blur"
          },
          {
            pattern: /^[^\u4e00-\u9fa5]+$/,
            message: "登录名不能为汉字！",
            trigger: "blur"
          }
        ],
        password: [
          { required: true, message: "请输入密码！", trigger: "blur" },
          {
            min: 6,
            max: 16,
            message: "密码应为6-16位，包含字母、数字、特殊字符！",
            trigger: "blur"
          },
          {
            pattern: /(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{6,16}/,
            message: "密码复杂度太低，应为6-16位，包含字母、数字、特殊字符！",
            trigger: "blur"
          }
        ],
        area: [
          { required: true, message: "请选择所属区域！", trigger: "blur" }
        ],
        roles: [
          {
            required: true,
            message: "请选择角色！",
            trigger: "blur"
          }
        ]
      },
      dialogType: "add", // 弹框类型，新增or编辑
      available: "1", // 是否启用 --部门列表查询
      deptlist: [], // 部门列表
      roleslist: [], // 角色列表
      updateId: "", // 编辑-id
      showPwd: true, // 显示密码
      searchDeptId: "", // 搜索部门
      searchLn: null, // 搜索登录名
      searchNn: null, // 搜索昵称
      loading: false, // 加载动画
      searchStatus: 1, //
      searchRole: "",
      defaultProps: {
        label: "name",
        children: "childNode"
      },
      treeChecked: [],
      treeChecked_search: [],
      dialogDept: false, //
      deptname_search: "",
      checkDeptData: {},
      isEdit: {
        // 是否修改过
        nickName: "",
        loginName: "",
        password: "",
        sex: 1,
        email: "",
        phone: "",
        area: "",
        deptId: "",
        roles: []
      },

      city: "",
      sheng: "",
      shi: "",
      xian: "",
      isAdmin: null
    };
  },
  computed: {
    deletDis() {
      // 禁用删除按钮
      if (this.multipleSelection.length > 0) {
        return false;
      } else {
        return true;
      }
    },
    inputDisabled() {
      if (this.dialogType == "add") {
        return false;
      } else {
        return true;
      }
    }
  },
  created() {
    const obj = JSON.parse(sessionStorage.getItem("userInfo"));
    this.isAdmin = obj.roles.some(item => {
      return item.isAdmin;
    });

    this.getUserList();
    this.getDeptList();
    this.getRoleList();
  },
  mounted() {},
  methods: {
    // 获取用户列表
    getUserList() {
      this.loading = true;
      const data = {
        nickName: this.searchNn,
        loginName: this.searchLn,
        deptId: this.searchDeptId,
        status: this.searchStatus,
        roleId: this.searchRole,
        pageNo: this.current,
        pageSize: this.size
      };
      userPage(data)
        .then(res => {
          if (res.code == 0) {
            this.loading = false;
            this.list = res.data.list;
            this.current = res.data.current;
            this.size = res.data.size;
            this.total = res.data.total;
          }
        })
        .catch(e => {
          console.log(e);
          this.loading = false;
        });
    },
    // 编辑
    handleEdit(row) {
      this.dialogType = "edit";
      this.dialogTitle = "编辑用户";
      this.updateId = row.id;
      const belongArea = row.area;
      if (belongArea) {
        if (belongArea.indexOf("-") > -1) {
          this.sheng = belongArea.split("-")[0];
          this.shi = belongArea.split("-")[1];
          this.xian = belongArea.split("-")[2];
        } else {
          this.sheng = row.area;
        }
      }

      if (this.dialogType == "edit") {
        this.formRule = {
          nickName: [
            { required: true, message: "请输入昵称！", trigger: "blur" }
          ],
          loginName: [
            { required: true, message: "请输入登录名！", trigger: "blur" },
            {
              pattern: /^[^\u4e00-\u9fa5]+$/,
              message: "登录名不能为汉字！",
              trigger: "blur"
            }
          ],
          area: [
            { required: true, message: "请选择所属区域！", trigger: "blur" }
          ],
          roles: [
            {
              required: true,
              message: "请选择角色！",
              trigger: "blur"
            }
          ]
        };
      } else {
        this.formRule = {
          nickName: [
            { required: true, message: "请输入昵称！", trigger: "blur" }
          ],
          loginName: [
            { required: true, message: "请输入登录名！", trigger: "blur" },
            {
              pattern: /^[^\u4e00-\u9fa5]+$/,
              message: "登录名不能为汉字！",
              trigger: "blur"
            }
          ],
          password: [
            { required: true, message: "请输入密码！", trigger: "blur" },
            {
              min: 6,
              max: 16,
              message: "密码应为6-16位，包含字母、数字、特殊字符！",
              trigger: "blur"
            },
            {
              pattern: /(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{6,16}/,
              message: "密码复杂度太低，应为6-16位，包含字母、数字、特殊字符！",
              trigger: "blur"
            }
          ],
          area: [
            { required: true, message: "请选择所属区域！", trigger: "blur" }
          ],
          roles: [
            {
              required: true,
              message: "请选择角色！",
              trigger: "blur"
            }
          ]
        };
      }

      this.form = {
        nickName: row.nickName,
        loginName: row.loginName,
        password: row.password,
        sex: row.sex,
        email: row.email,
        phone: row.phone,
        deptId: row.deptId,
        roles: [],
        area: row.area
      };
      this.isEdit = {
        nickName: row.nickName,
        loginName: row.loginName,
        password: row.password,
        sex: row.sex,
        email: row.email,
        phone: row.phone,
        deptId: row.deptId,
        roles: [],
        area: row.area
      };
      row.roles.forEach(item => {
        this.form.roles.push(item.id);
        this.isEdit.roles.push(item.id);
      });
      if (this.treeChecked.length == 0) {
        this.treeChecked.push(row.deptId);
      }
      if (this.treeChecked.length > 0) {
        this.treeChecked.pop();
        this.treeChecked.push(row.deptId);
      }
      this.dialogVisible = true;
    },
    // 表格多选
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // /删除
    handleDelete() {
      this.$confirm("确定要删除此用户吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const ids = [];
          this.multipleSelection.forEach(item => {
            ids.push(item.id);
          });
          userDelete({ ids: ids }).then(res => {
            if (res.code == 0) {
              this.$message({
                type: "success",
                message: "删除成功!"
              });
              this.current = 1;
              this.getUserList();
            }
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    handleSizeChange(val) {
      this.size = val;
      this.getUserList();
    },
    handleCurrentChange(val) {
      this.current = val;
      this.getUserList();
    },
    // /新增
    addUser() {
      this.dialogType = "add";
      this.inputDis = false;
      this.showPwd = true;
      this.dialogTitle = "新增用户";
      this.form = {
        // // checkPerson: "",
        nickName: "",
        loginName: "",
        password: "",
        sex: 1,
        email: "",
        phone: "",
        area: "",
        deptId: "",
        roles: []
      };
      this.dialogVisible = true;
    },
    // 获取部门列表
    getDeptList() {
      deptPage({
        available: this.available
      }).then(res => {
        if (res.code == 0) {
          this.deptlist = res.data.list;
        } else {
          console.log("deptlist 获取数据失败！");
        }
      });
    },
    // 获取角色列表
    getRoleList() {
      roleList({
        role: "",
        description: "",
        remarks: ""
        // available:'1'
      }).then(res => {
        if (res.code == 0) {
          this.roleslist = res.data;
        } else {
          console.log("roleslist 获取数据失败！");
        }
      });
    },
    handleDialogClose() {
      this.dialogVisible = false;
    },
    // 确定
    handleDetermine() {
      const regEmail = /^\w+@\w+(\.\w+)+$/;
      const regMobile = /^1[34578]\d{9}$/;
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.email.trim().length > 0) {
            if (!regEmail.test(this.form.email.trim())) {
              return this.$message({
                type: "warning",
                message: "请输入合法邮箱!"
              });
            }
          }
          if (this.form.phone.trim().length > 0) {
            if (!regMobile.test(this.form.phone.trim())) {
              return this.$message({
                type: "warning",
                message: "请输入合法的手机号码!"
              });
            }
          }

          if (this.dialogType == "add") {
            console.log(this.form);
            if (this.form.area == "") {
              return this.$message({
                type: "warning",
                message: "请选择所属区域！"
              });
            }
            userSave(this.form).then(res => {
              if (res.code == 0) {
                this.$message({
                  type: "success",
                  message: "新增用户成功！"
                });

                this.handleCancel();
                this.getUserList();
              } else {
                this.$message({
                  type: "warming",
                  message: "新增用户失败！"
                });
                this.dialogVisible = false;
              }
            });
          }

          if (this.dialogType == "edit") {
            const str1 = JSON.stringify(this.isEdit);
            const str2 = JSON.stringify(this.form);
            // 判断是否有修改，如果没有不能提交
            if (str1 == str2) {
              return this.$message({
                type: "warning",
                message: "您未作修改！"
              });
            }
            if (this.sheng == "省") {
              return this.$message({
                type: "warning",
                message: "请选择所属区域！"
              });
            }
            const data = {
              id: this.updateId,
              nickName: this.form.nickName,
              loginName: this.form.loginName,
              sex: this.form.sex,
              email: this.form.email,
              phone: this.form.phone,
              deptId: this.form.deptId,
              roles: this.form.roles,
              area: this.form.area
            };
            userUpdate(data).then(res => {
              if (res.code == 0) {
                this.$message({
                  type: "success",
                  message: "编辑用户成功！"
                });

                this.handleCancel();
                this.getUserList();
              } else {
                this.$message({
                  type: "warming",
                  message: "编辑用户失败！"
                });
                this.dialogVisible = false;
              }
            });
          }
        }
      });
    },
    // 取消
    handleCancel() {
      this.$refs["form"].resetFields();
      this.form = {
        nickName: "",
        loginName: "",
        password: "",
        sex: 1,
        email: "",
        phone: "",
        deptId: "",
        roles: [],
        area: ""
      };
      this.dialogVisible = false;
      this.$refs.deptTree.setCheckedKeys([]);
      this.sheng = "";
      this.shi = "";
      this.xian = "";
    },
    // 搜索
    handleSearch() {
      this.loading = true;
      const data = {
        nickName: this.searchNn,
        loginName: this.searchLn,
        deptId: this.searchDeptId,
        status: this.searchStatus,
        roleId: this.searchRole,
        pageSize: this.size
      };
      userPage(data)
        .then(res => {
          if (res.code == 0) {
            this.list = res.data.list;
            this.loading = false;
            this.current = res.data.current;
            this.size = res.data.size;
            this.total = res.data.total;
          }
        })
        .catch(e => {
          this.loading = false;
        });
    },
    // 部门列表-弹框
    handleCheckChange(data, checked, indeterminate) {
      if (checked) {
        const arr = [data.id];
        this.$refs.deptTree.setCheckedKeys(arr);
      }
    },
    handleCheck(data) {
      if (data.childNode.length == 0) {
        this.form.deptId = data.id;
      }
    },
    // 部门列表——搜索
    handleCheckChange_search(data, checked, indeterminate) {
      if (checked) {
        const arr = [data.id];
        this.$refs.deptTree_search.setCheckedKeys(arr);
      }
    },
    handleCheck_search(data) {
      if (!data.childNode || data.childNode.length == 0) {
        this.checkDeptData = data;
      }
    },
    handleDetermine_dept() {
      this.dialogDept = false;
      this.searchDeptId = this.checkDeptData.id;
      this.deptname_search = this.checkDeptData.name;
    },
    handleCancel_dept() {
      this.checkDeptData = {};
      this.dialogDept = false;
    },
    // 搜索-显示部门列表
    showDept() {
      this.dialogDept = true;
      this.$nextTick(() => {
        this.$refs.deptTree_search.setCheckedKeys([]);
      });
    },
    // 单个删除
    handleDelOne(row) {
      this.$confirm("确定要删除此用户吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const ids = [];
          ids.push(row.id);
          userDelete({ ids: ids }).then(res => {
            if (res.code == 0) {
              this.$message({
                type: "success",
                message: "删除成功!"
              });
              this.current = 1;
              this.getUserList();
            }
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    // 重置
    handleRefresh() {
      this.searchDeptId = this.searchLn = this.searchNn = this.searchRole = "";
      this.searchDeptId = "";
      this.deptname_search = "";
      this.searchStatus = 1;
      this.current = 1;
      this.size = 10;
      this.getUserList();
    },
    // 省市区三级联动 -最后触发
    selected(data) {
      this.form.area =
        data.province.value + "-" + data.city.value + "-" + data.area.value;
    },
    onChangeProvince1(a) {
      this.sheng = a.value;
      this.form.area = a.value;
    },
    onChangeCity(a) {
      this.shi = a.value;
      this.form.area = this.sheng + "-" + this.shi;
    },
    selectHandle(row) {
      if (row.loginName == "admin") {
        return false;
      } else {
        return true;
      }
    }
  }
};
</script>

<style  scoped>
.table_row /deep/ .el-button {
  font-size: 12px;
  padding: 5px;
}
.userBox /deep/ .el-dialog__wrapper .el-dialog__header {
  background: #304156;
}
.userBox /deep/ .el-dialog__wrapper .el-dialog__header span {
  color: #f4f4f4;
  font-size: 16px;
}
.userBox /deep/ .el-dialog {
  border-radius: 5px;
  overflow: hidden;
}

.userBox {
  padding: 10px;
}
.userBox .top {
  margin-bottom: 10px;
}
.search_col .el-input {
  width: 9%;
  margin-right: 15px;
  font-size: 12px;
}
.search_col .el-select {
  width: 10%;
  margin-right: 15px;
  font-size: 12px;
}
.search_col span {
  font-size: 14px;
}
.search_col /deep/ .el-input__inner {
  height: 32px;
  line-height: 32px;
  font-size: 12px;
  padding: 0 5px !important;
}
.search_col /deep/ .el-input__icon {
  line-height: 32px;
}
.select_dept {
  width: 11% !important;
}

.userBox .page {
  margin-top: 10px;
}
.table_row /deep/ .el-table .el-table__header-wrapper th,
.table_row /deep/ .el-table .el-table__body-wrapper td {
  font-size: 12px;
  padding: 6px 0px;
  text-align: center;
}
.table_row /deep/ .el-table .el-table__header-wrapper th {
  background: #304156;
  color: #c8d1db;
}

.distpicker {
  display: inline-block;
}
.userBox >>> .areaItem > label {
  position: relative;
}
.userBox >>> .areaItem > label::before {
  content: "*";
  position: absolute;
  top: 3px;
  left: 8px;
  font-size: 14px;
  color: red;
}
</style>
