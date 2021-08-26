
<template>
  <div class="deptBox">
    <el-row class="top">
      <el-col class="search_col">
        <span>部门名称：</span>
        <el-input v-model="searchNn" placeholder="请输入部门名称" size="small" clearable @clear="searchNn=null" @keyup.enter.native="handleSearch" />
        <span>邮政编码：</span>
        <el-input v-model="searchZipCode" placeholder="请输入邮政编码" size="small" clearable @keyup.enter.native="handleSearch" />
        <span>负责人：</span>
        <el-input v-model="searchMaster" placeholder="请输入负责人" size="small" clearable @keyup.enter.native="handleSearch" />
        <span>是否可用：</span>
        <el-select v-model="searchAvaliable" placeholder="请选择" size="small" clearable>
          <el-option label="可用" :value="true" />
          <el-option label="不可用" :value="false" />
        </el-select>
        <el-button size="small" type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button size="small" type="primary" icon="el-icon-refresh" @click="handSearchEmpty">重置</el-button>
        <el-button v-if="isAdminRole == true" size="small" type="success" icon="el-icon-plus" @click="addDept">新增</el-button>
        <el-button v-if="isAdminRole == true" size="small" type="danger" icon="el-icon-delete" :disabled="deleteDis" @click="handleDelete(multiple)">删除</el-button>
      </el-col>
    </el-row>

    <el-row class="table_row">
      <el-table
        ref="multipleTable"
        v-loading="loading"
        :data="list"
        stripe
        row-key="id"
        border
        :tree-props="{children: 'childNode', hasChildren: 'hasChildren'}"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="50"
        />
        <el-table-column
          prop="name"
          label="部门名称"
        />
        <el-table-column
          prop="address"
          label="部门地址"
        />
        <el-table-column
          prop="zipCode"
          label="邮政编码"
        />
        <el-table-column
          prop="master"
          label="负责人"
        />
        <el-table-column
          prop="phone"
          label="电话"
        />
        <el-table-column
          prop="avaliable"
          label="是否可用"
        >
          <el-switch
            v-if="isAdminRole == true"
            v-model="scope.row.avaliable"
            slot-scope="scope"
            class="switch"
            active-color="#13ce66"
            inactive-color="#89929AFF"
            :active-value="true"
            :inactive-value="false"
            active-text="是"
            inactive-text="否"
            @change="disableDept(scope.row)"
          />
          <el-switch
            v-else
            disabled
            v-model="scope.row.avaliable"
            slot-scope="scope"
            class="switch"
            active-color="#13ce66"
            inactive-color="#89929AFF"
            :active-value="true"
            :inactive-value="false"
            active-text="是"
            inactive-text="否"
            @change="disableDept(scope.row)"
          />
        </el-table-column>
        <el-table-column label="操作" v-if="showOperation" width="250">
          <template slot-scope="scope">
            <el-button v-if="isAdminRole == true" type="success" size="mini" icon="el-icon-circle-plus-outline" @click="addSubDept(scope.row)">新增下级</el-button>
            <el-button v-if="isAdminRole == true" type="success" size="mini" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button v-if="isAdminRole == true" type="danger" size="mini" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-row>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="50%"
      :before-close="handleCancel"
    >
      <el-form ref="form" :rules="formRule" :model="form" label-width="100px">
        <el-row :gutter="48">
          <el-col :span="10">
            <el-form-item label="上级部门：" prop="parentName">
              <el-input v-model="form.parentName" placeholder="" class="input-with-select" :disabled="disDeptName" />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="部门名称：" prop="name">
              <el-input v-model="form.name" placeholder="请输入部门名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="48">
          <el-col :span="10">
            <el-form-item label="部门地址：" prop="address">
              <el-input v-model="form.address" placeholder="请输入部门地址" />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="邮政编码：" prop="zipCode">
              <el-input v-model="form.zipCode" placeholder="邮政编码" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="48">
          <el-col :span="10">
            <el-form-item label="负责人：" prop="master">
              <el-input v-model="form.master" placeholder="请输入负责人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="电话：" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleDetermine">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>
<script>
  import { deptById, deptDelete, deptList, deptPage, deptSave, deptUpdate, statusUpdate } from '@/api/sys'
  import { getInfo } from '@/api/user'
export default {
  data() {
    // 手机号码验证
    const checkPhone = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const numMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (numMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入正确的电话号码！'))
    }
    // /^[1-9][0-9]{5}$/
    // 邮政编码校验
    const checkZipCode = (rule, value, cb) => {
      // 验证邮编正则表达式
      const checkCode = /^[1-9][0-9]{5}$/
      if (checkCode.test(value)) {
        return cb()
      }
      cb(new Error('请输入正确的邮编！'))
    }
    return {
      list: [],
      deptOneData: [],
      userInfo:[],
      //  dept_list: [],
      loading: true,
      isAdminRole: false,
      showOperation: false,
      current: 1,
      size: 10,
      total: 0,
      searchNn: null,
      searchMaster: null,
      searchZipCode: null,
      searchAvaliable: null,
      multiple: null,
      dialogTitle: '新增用户', // 弹框标题
      dialogVisible: false, // 弹框显示隐藏
      deptName: '', // 新增、修改弹框 上级部门
      disDeptName: false,
      temp: '',
      expandedKeys: [],
      moduleDataList: [],
      expandData: [],
      form: {
        id: '',
        parentId: '',
        parentName: '',
        name: '',
        address: '',
        zipCode: '',
        master: '',
        phone: '',
        avaliable: true
      },
      multipleSelection: [], // 表格多选
      formRule: { // 表单验证规则
        name: [
          { required: true, message: '请输入部门名称！', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入部门地址！', trigger: 'blur' }
        ],
        zipCode: [
          { required: true, message: '请输入邮政编码！', trigger: 'blur' },
          {
            validator: checkZipCode,
            message: '请输入正确的邮政编码！',
            trigger: 'blur'
          }
        ],
        master: [
          { required: true, message: '请输入负责人姓名！', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入联系电话！', trigger: 'blur' },
          {
            validator: checkPhone,
            message: '请输入正确的电话号码',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  computed: {
    // 禁用删除按钮
    deleteDis() {
      if (this.multipleSelection.length > 0) {
        return false
      } else {
        return true
      }
    }
  },
  created() {
    this.getDeptList()
    this.getUserInfo()
  },
  methods: {
    getUserInfo(){
      getInfo().then(res =>{
        if(res.code==='0'){
          this.userInfo = res.data
          this.handleJustifyRole()
        }
      }).catch( e =>{
        console.log(e)
      })
    },
    // 判断当前登录用户是否拥有管理员角色
    handleJustifyRole(){
      this.userInfo.roles.forEach(item =>{
        if (item.isAdmin == true){
          this.isAdminRole = true
          this.showOperation = true
          console.log('是否是管理员角色：'+this.isAdminRole)
          return
        }
      })
    },
    // 根据Id查询
    getOneDept() {
      deptById().then(res => {
        if (res.code === '0') {
          this.deptOneData = res.data
        }
      }).catch(e => {
        console.log(e)
      })
    },
    // 获取用户列表
    getDeptList() {
      this.loading = true
      deptPage({}).then(res => {
        if (res.code === '0') {
          this.loading = false
          this.list = res.data.list
        }
      }).catch(e => {
        console.log(e)
      })
    },
    // 表格多选
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 条件搜索
    handleSearch() {
      this.list= []
      const data_search = {
        name: this.searchNn,
        zipCode: this.searchZipCode,
        master: this.searchMaster,
        avaliable: this.searchAvaliable
      }
      this.loading = true
      deptList(data_search).then(res => {
        this.loading = false
        if (res.code === '0') {
          this.list = res.data
        }
      })
    },
    handSearchEmpty() {
      this.searchNn = null
      this.searchMaster = null
      this.searchZipCode = null
      this.searchAvaliable = null
      this.getDeptList()
    },
    // 每页条数发生变化
    handleSizeChange(val) {
      console.log(val)
      // this.size = val;
      this.size = val
      this.getDeptList()
    },
    // 页码发生变化
    handleCurrentChange(val) {
      console.log(val)
      // this.current = val;
      this.current = val
      this.getDeptList()
    },
    // 可用按钮
    disableDept(row) {
      statusUpdate({
        id: row.id,
        avaliable: row.avaliable
      }).then(res => {
        if (res.code === '0' && row.avaliable === true) {
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
      })
    },
    // 新增部门
    addDept() {
      this.dialogType = 'add'
      this.inputDis = false
      this.dialogTitle = '新增部门'
      this.form = {
        parentId: '0',
        parentName: '',
        name: '',
        address: '',
        zipCode: '',
        master: '',
        phone: '',
        avaliable: 1
      }
      this.disDeptName = true
      this.dialogVisible = true
    },

    // 新增下级部门
    addSubDept(row) {
      console.log(row)
      this.dialogType = 'addSubDept'
      this.dialogTitle = '新增下级部门'
      this.form.id = row.id
      this.form.name = ''
      this.form.zipCode = ''
      this.form.address = ''
      this.form.master = ''
      this.form.phone = ''
      this.form.parentName = row.name
      this.disDeptName = true
      this.form.parentId = row.parentId
      this.dialogVisible = true
    },
    // 取消
    handleCancel(type) {
      this.$refs['form'].resetFields()
      this.form.name = ''
      this.form.address = ''
      this.form.zipCode = ''
      this.form.master = ''
      this.form.phone = ''
      this.dialogVisible = false
    },
    // 确定
    handleDetermine() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.dialogType == 'add') {
            console.log(this.form)
            deptSave(this.form).then(res => {
              if (res.code == 0) {
                this.$message({
                  type: 'success',
                  message: '新增成功'
                })
                this.getDeptList()
                this.dialogVisible = false
              } else {
                this.$message({
                  type: 'warming',
                  message: '新增失败'
                })
                this.dialogVisible = false
              }
            })
          }
          if (this.dialogType == 'addSubDept') {
            console.log(this.form)
            const data = {
              parentId: this.form.id,
              name: this.form.name,
              address: this.form.address,
              zipCode: this.form.zipCode,
              master: this.form.master,
              phone: this.form.phone,
              avaliable: this.form.avaliable
            }
            deptSave(data).then(res => {
              if (res.code == 0) {
                this.$message({
                  type: 'success',
                  message: '新增下级成功'
                })
                this.getDeptList()
                this.dialogVisible = false
              } else {
                this.$message({
                  type: 'warning',
                  message: '新增下级失败'
                })
                this.dialogVisible = false
              }
            })
          }
          if (this.dialogType == 'edit') {
            console.log(this.form)
            const data = {
              parentId: this.form.parentId,
              id: this.form.id,
              name: this.form.name,
              address: this.form.address,
              zipCode: this.form.zipCode,
              master: this.form.master,
              phone: this.form.phone
            }
            deptUpdate(data).then(res => {
              if (res.code == 0) {
                this.$message({
                  type: 'success',
                  message: '修改成功'
                })
                this.getDeptList()
                this.dialogVisible = false
              } else {
                this.$message({
                  type: 'warming',
                  message: '修改失败'
                })
                this.dialogVisible = false
              }
            })
          }
        }
      })
    },
    // 编辑
    handleEdit(row) {
      this.form.parentName = ''
      this.dialogType = 'edit'
      this.dialogTitle = '编辑部门'
      this.form.parentId = row.parentId
      this.form.id = row.id
      this.form.name = row.name
      this.form.address = row.address
      this.form.zipCode = row.zipCode
      this.form.master = row.master
      this.form.phone = row.phone
      this.disDeptName = true
      this.dialogVisible = true
      this.getParent(this.list, row.parentId)
    },
    getParent(nodes, parentId) {
      if (nodes!=null && nodes.length!=0) {
        nodes.forEach(node=>{
          if (node.id == parentId) {
            this.form.parentName=node.name;
          } else if(node.childNode!=null && node.childNode.length != 0) {
            this.getParent(node.childNode, parentId)
          }
        })
      }
    },
    // 删除
    handleDelete(row) {
      this.$confirm('确认删除吗？', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = []
        if (row == null) {
          this.multipleSelection.forEach(item => {
            ids.push(item.id)
          })
        } else {
          ids.push(row.id)
        }
        deptDelete({ ids: ids }).then(res => {
          console.log(res)
          if (res.code === '0') {
            this.$message({
              type: 'success',
              message: '删除成功！'
            })
            this.getDeptList()
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  }
}
</script>
<style scoped>
  /*.search_col /deep/ .el-input {
    width: 14% !important;
  }*/
  .red{
    color: red;
  }
  .el-button{
    font-size: 12px;
    padding: 6px;
  }
  /*显示文字*/
  .deptBox /deep/.switch .el-switch__label.is-active {
    display: block;
  }
  /* switch按钮样式 */
  .deptBox /deep/.switch .el-switch__label {
    position: absolute;
    display: none;
    color: #fff !important;
  }
  /*!*打开时文字位置设置*!*/
  .deptBox /deep/.switch .el-switch__label--right {
    z-index: 1;
  }
  /*!*关闭时文字位置设置*!*/
  .deptBox /deep/.switch .el-switch__label--left {
    z-index: 1;
  }
  /* 调整关闭时文字的显示位子 */
  .deptBox /deep/.switch .el-switch__label--left span{
    margin-left: 19px;
  }
  /* 调整按钮的宽度 */
  .switch.el-switch .el-switch__core,
  .el-switch .el-switch__label {
    width: 45px !important;
    margin: 0;
  }
  .deptBox{
    padding: 10px;
  }
  .deptBox .top{
    margin-bottom: 10px;
  }
  .search_col .el-input,
  .search_col .el-select{
    width: 15%;
    margin-right: 10px;
  }
  .search_col span{
    font-size: 14px;
  }
  .search_col .el-input input{
    height: 28px;
    line-height: 28px;
  }
  .table_row /deep/ .el-table .el-table__header-wrapper th,
  .table_row /deep/ .el-table .el-table__body-wrapper td {
    font-size: 12px ;
    padding: 6px 0px ;
    text-align: center;
  }
  .table_row /deep/ .el-table .el-table__header-wrapper th{
    /* background: #1f2d3d ; */
    background: #304156;
    color: #c8d1db;
  }
  .deptBox .page{
    margin-top: 10px;
  }
  /* switch按钮样式 */
  .table_row /deep/.switch .el-switch__label {
    position: absolute;
    display: none;
    color: #fff !important;
  }
  /*关闭时文字位置设置*/
  .table_row /deep/.switch .el-switch__label--left {
    z-index: 1;
  }
  /* 调整关闭时文字的显示位子 */
  .table_row /deep/.switch .el-switch__label--left span{
    margin-left: 19px;
  }
  /*显示文字*/
  .table_row /deep/.switch .el-switch__label.is-active {
    display: block;
  }
  /* 调整按钮的宽度 */
  .table_row /deep/.switch.el-switch .el-switch__core,
  .el-switch .el-switch__label {
    width: 45px !important;
    margin: 0;
  }
</style>
