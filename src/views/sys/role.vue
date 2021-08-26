<template>
  <div class="roleBox">
    <el-row>
      <el-col :span="24" class="role_query_col">
        <span class="search_font">角色名称：</span>
        <el-input
          size="small"
          v-model="roleName"
          @keyup.enter.native="queryRole"
          placeholder="请输入内容"
          clearable
        />
        <span class="search_font">描述：</span>
        <el-input
          size="small"
          v-model="description"
          @keyup.enter.native="queryRole"
          placeholder="请输入内容"
          clearable
        />
        <span class="search_font">备注：</span>
        <el-input
          size="small"
          v-model="remarks"
          @keyup.enter.native="queryRole"
          placeholder="请输入内容"
          clearable
        />
        <span class="search_font">是否可用：</span>
        <el-select
          v-model="usable"
          class="role-select"
          @keyup.enter.native="queryRole"
          placeholder="请选择"
          size="small"
          clearable
        >
          <el-option label="是" :value="1" />
          <el-option label="否" :value="0" />
        </el-select>
        <el-button size="small" type="primary" icon="el-icon-search" @click="queryRole">搜索</el-button>
        <el-button size="small" type="primary" icon="el-icon-refresh" @click="resetParam">重置</el-button>
        <el-button
          v-if="isAdmin"
          size="small"
          type="success"
          icon="el-icon-circle-plus-outline"
          @click="saveRole"
        >新增</el-button>
      </el-col>
    </el-row>
    <el-row class="table_row">
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 95%;margin-left: 10px;"
        size="medium"
        border
        :header-cell-style="{background:'#304156',color:'#c8d1db'}"
      >
        <el-table-column prop="role" label="名称" width="250" />
        <el-table-column prop="description" label="描述" width="250" />
        <el-table-column prop="isAdmin" label="是否为管理员">
          <template slot-scope="scope">{{ scope.row.isAdmin ? '是':'否' }}</template>
        </el-table-column>
        <el-table-column prop="available" label="是否可用">
          <el-switch
            v-model="scope.row.available"
            slot-scope="scope"
            class="switch"
            active-color="#13ce66"
            inactive-color="#89929AFF"
            :active-value="true"
            :inactive-value="false"
            active-text="是"
            inactive-text="否"
            @change="disableRole(scope.row)"
            :disabled="!isAdmin"
          />
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="250"/>
        <el-table-column prop="remarks" label="备注" width="300" />
        <el-table-column label="操作" width="300">
          <template slot-scope="scope">
            <el-button
              v-if="isAdmin"
              type="primary"
              size="small"
              icon="el-icon-edit"
              @click="editRole(scope.row)"
            >修改</el-button>
            <el-button
              v-if="isAdmin"
              type="danger"
              size="small"
              icon="el-icon-delete"
              @click="delRole(scope.row.id)"
            >删除</el-button>
            <el-button
              type="info"
              size="small"
              icon="el-icon-document"
              @click="detailRole(scope.row)"
            >详情</el-button>
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
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" :before-close="cancelSave">
      <el-form ref="form" :model="form" :rules="formRule">
        <el-row :gutter="100">
          <el-col :span="12">
            <el-form-item label="角色名称:" prop="role">
              <el-input
                v-model="form.role"
                placeholder="请输入内容"
                :disabled="this.dialogType === 'detail'"
                style="width: 78%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否为管理员:" prop="isAdmin" style="margin-top: -5px">
              <el-switch
                v-model="form.isAdmin"
                active-color="#13ce66"
                inactive-color="#ff4949"
                :disabled="this.dialogType === 'detail'"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-form-item label="角色描述:" prop="description">
            <el-input
              v-model="form.desc"
              placeholder="请输入内容"
              :disabled="this.dialogType === 'detail'"
            />
          </el-form-item>
        </el-row>
        <el-row>
          <el-form-item label="备注:" prop="remarks">
            <el-input
              type="textarea"
              v-model="form.remarks"
              placeholder="请输入内容"
              :disabled="this.dialogType === 'detail'"
            />
          </el-form-item>
        </el-row>
        <el-row class="menu_tree_class">
          <label>关联菜单：</label>
          <el-col>
            <el-tree
              :data="menuTree"
              show-checkbox
              node-key="id"
              ref="tree"
              highlight-current
              :props="defaultProps"
            ></el-tree>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer" v-show="showButton">
        <el-button @click="cancelSave">取 消</el-button>
        <el-button type="primary" @click="submitSave">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { queryRolePage, updateRole, saveRole, deleteRole } from "@/api/role";
import { menuTree } from "@/api/menu";
export default {
  data() {
    return {
      roleId: '',
      roleName: '',
      description: '',
      remarks: '',
      usable: 1,
      isAdmin: false,
      tableData: [], // 表格数据
      current: 1,
      size: 10,
      total: 0,
      dialogVisible: false,
      form: {
        role: '',
        desc: '',
        remarks: '',
        isAdmin: false,
        menus: []
      },
      formRule: {
        // 表单验证规则
        role: [{ required: true, message: "请输入角色名称！", trigger: "blur" }]
      },
      dialogTitle: '新增角色',
      dialogType: 'add',
      menuTree: [],
      defaultProps: {
        label: 'name',
        children: 'subMenu'
      },
      showButton: true,
      loading: false,
    }
  },
  created() {
    let obj = JSON.parse(sessionStorage.getItem("userInfo"));
    obj.roles.forEach(role => {
      if (role.isAdmin) {
        this.isAdmin = true;
      }
    })
    if (obj.id === '1') {
      this.isAdmin = true
    }
    this.getRolePage();
  },
  methods: {
    getRolePage() {
      this.loading = true;
      queryRolePage({
        role: this.roleName,
        description: this.description,
        remarks: this.remarks,
        available: this.usable,
        pageNo: this.current,
        pageSize: this.size
      }).then(res => {
        if (res.code === '0') {
          this.loading = false
          this.tableData = res.data.list
          this.current = res.data.current
          this.size = res.data.size
          this.total = res.data.total
        } else {
          this.loading = false
          this.$message({
            type: 'warning',
            message: '查询失败！'
          })
        }
      }).catch(e => {
        console.warn(e)
      })
    },
    handleSizeChange(size) {
      this.size = size;
      this.getRolePage();
    },
    handleCurrentChange(no) {
      this.current = no;
      this.getRolePage();
    },
    queryRole() {
      this.loading = true;
      const data = {
        role: this.roleName,
        description: this.description,
        remarks: this.remarks,
        available: this.usable,
        pageNo: this.current,
        pageSize: this.size
      }
      queryRolePage(data).then(res => {
        if (res.code === '0') {
          this.loading = false
          this.tableData = res.data.list
          this.current = res.data.current
          this.size = res.data.size
          this.total = res.data.total
        } else {
          this.loading = false
          this.$message({
            type: 'error',
            message: '查询失败！'
          })
        }
      })
    },
    saveRole() {
      this.getMenuTree();
      if (this.$refs.tree != null) {
        this.$refs.tree.setCheckedKeys([]);
      }
      this.dialogTitle = "新增角色";
      this.dialogType = "add";
      this.dialogVisible = true;
      this.form = {
        role: '',
        remarks: '',
        description: '',
      }
    },
    delRole(roleId) {
      this.$confirm('确定删除此角色吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const params = {
          ids: [roleId]
        }
        deleteRole(params).then(res => {
          if (res.code === '0') {
            this.$message({
              type: 'success',
              message: '删除成功！'
            })
            this.getRolePage()
          } else {
            this.$message({
              type: 'error',
              message: '删除失败！'
            })
          }
        }).catch(e => {
          console.log(e)
        })
      })
    },
    editRole(row) {
      let checkedNode = [];
      if (row.menus !== null) {
        row.menus.forEach(m => {
          checkedNode.push(m.id);
        });
      }
      this.dialogVisible = true
      this.dialogType = 'update'
      this.dialogTitle = '更新角色'
      this.getMenuTree(checkedNode)
      this.form.role = row.role
      this.form.desc = row.description
      this.form.remarks = row.remarks
      this.id = row.id
      this.form.isAdmin = row.isAdmin
    },
    detailRole(row) {
      this.dialogVisible = true
      this.dialogTitle = '角色详情'
      this.dialogType = 'detail'
      let checkedNode = []
      row.menus.forEach(m => {
        checkedNode.push(m.id)
      })
      this.getMenuTree(checkedNode)
      this.form.role = row.role
      this.form.desc = row.description
      this.form.remarks = row.remarks
      this.form.isAdmin = row.isAdmin
      this.showButton = false
    },
    disableRole(row) {
      updateRole({
        role: row.role,
        id: row.id,
        available: row.available
      }).then(res => {
        if (row.available === true && res.code === '0') {
          this.$message({
            type: 'success',
            message: '启用成功！'
          })
        } else {
          this.$message({
            type: 'warning',
            message: '禁用成功！'
          })
        }
      });
    },
    cancelSave() {
      this.$refs['form'].resetFields()
      this.dialogVisible = false
      this.loading = false
    },
    submitSave() {
      this.form.menus = [];
      this.$refs.tree.getCheckedNodes().forEach(node => {
        this.form.menus.push(node.id)
      })
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.dialogType === 'add') {
            saveRole({
              role: this.form.role,
              description: this.form.desc,
              available: this.usable,
              isAdmin: this.form.isAdmin,
              remarks: this.form.remarks,
              menus: this.form.menus
            }).then(res => {
              if (res.code === '0') {
                this.$message({
                  type: 'success',
                  message: '新增成功！'
                })
                this.getRolePage()
                this.dialogVisible = false
              } else {
                this.$message({
                  type: 'error',
                  message: '新增失败！'
                })
                this.dialogVisible = false
              }
            }).catch(e => {
              console.warn(e)
            })
          }
          if (this.dialogType === 'update') {
            updateRole({
              id: this.id,
              role: this.form.role,
              description: this.form.desc,
              available: this.usable,
              isAdmin: this.form.isAdmin,
              remarks: this.form.remarks,
              menus: this.form.menus
            }).then(res => {
              if (res.code === '0') {
                this.$message({
                  type: 'success',
                  message: '更新成功'
                })
              } else {
                this.$message({
                  type: 'error',
                  message: '更新失败！'
                })
              }
              this.dialogVisible = false
              this.getRolePage()
            }).catch(e => {
              console.warn(e)
            })
          }
        }
      });
    },
    getMenuTree(checkedNode) {
      this.loading = true
      menuTree({}).then(res => {
        if (res.code === '0') {
          this.menuTree = res.data
          if (checkedNode != null && checkedNode.length !== 0) {
            this.$refs.tree.setCheckedKeys(checkedNode)
          }
        }
      }).catch(e => {
        console.log(e)
      })
    },
    resetParam() {
      this.roleName = ''
      this.description = ''
      this.remarks = ''
      this.usable = 1
      this.queryRole()
    }
  }
}
</script>
<style scoped>
.roleBox {
  width: 99%;
}
.search_font {
  font-size: 14px;
}
.role-select .el-input {
  width: 85% !important;
}
.role_query_col {
  margin: 10px;
}
.role_query_col .el-input,
.role_query_col .el-select {
  width: 12%;
  margin-right: 2.7%;
}
.roleBox .page {
  margin-top: 10px;
  margin-left: 8px;
}
.menu_tree_class {
  border-width: 5px;
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
/* switch按钮样式 */
.roleBox /deep/.switch .el-switch__label {
  position: absolute;
  display: none;
  color: #fff !important;
}
/*关闭时文字位置设置*/
.roleBox /deep/.switch .el-switch__label--left {
  z-index: 1;
}
/* 调整关闭时文字的显示位子 */
.roleBox /deep/.switch .el-switch__label--left span {
  margin-left: 19px;
}
/*显示文字*/
.roleBox /deep/.switch .el-switch__label.is-active {
  display: block;
}
/* 调整按钮的宽度 */
.roleBox /deep/.switch.el-switch .el-switch__core,
.el-switch .el-switch__label {
  width: 45px !important;
  margin: 0;
}
</style>
