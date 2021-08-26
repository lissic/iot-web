
<template>
  <div class="knowledgeBox">
    <el-row class="top">
      <el-col :span="24" class="search_col">
        <span>资产名称：</span>
        <el-input v-model="searchName" size="small" @keyup.enter.native="handleSearch" placeholder="请输入资产名称" clearable />
        <span>资产编码：</span>
        <el-input v-model="searchAssetCode" size="small" @keyup.enter.native="handleSearch" placeholder="请输入资产编码" clearable />
        <span>资产类别：</span>
        <el-select v-model="searchCategory" placeholder="请选择资产类别" size="small" clearable>
          <el-option label="网络硬件" :value="0" />
          <el-option label="软件" :value="1" />
          <el-option label="其他" :value="2" />
        </el-select>
        <el-button size="small" icon="el-icon-more" @click="showMore =!showMore">更多</el-button>
        <el-button size="small" type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button size="small" type="primary" icon="el-icon-refresh" @click="handSearchEmpty">重置</el-button>
        <el-button v-if="isAdminRole == true" size="small" type="success" icon="el-icon-plus" @click="addAsset">新增</el-button>
        <el-button v-if="isAdminRole == true" size="small" type="danger" icon="el-icon-delete" :disabled="deleteDis" @click="handleDelete(multiple)">删除</el-button>
        <download-excel
          class="export-excel-wrapper"
          :fields="json_fields"
          :fetch="downloadExcel"
          name="资产信息表.xls"
        >
          <el-tooltip content="导出当前页面所有数据" placement="bottom" effect="light" :disabled="disShowTip">
            <el-button type="primary" size="small" icon="el-icon-download">导出</el-button>
          </el-tooltip>
        </download-excel>
      </el-col>
    </el-row>
    <el-collapse-transition>
      <el-row v-show="showMore" class="row_knowledge">
        <el-col :span="24" class="search_col">
          <span>资产状态：</span>
          <el-select v-model="searchStatus" placeholder="请选择" size="small" clearable>
            <el-option label="闲置" :value="0" />
            <el-option label="在用" :value="1" />
            <el-option label="借用" :value="2" />
            <el-option label="维修" :value="3" />
            <el-option label="报废" :value="4" />
            <el-option label="停用" :value="5" />
          </el-select>
          <span class="search_font">所属部门：</span>
          <el-input v-model="searchDept" placeholder="请选择部门" clearable @focus="showDept" />
        </el-col>
      </el-row>
    </el-collapse-transition>

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
        <el-table-column
          type="selection"
          width="50"
        />
        <el-table-column
          prop="name"
          label="资产名称"
        />
        <el-table-column
          prop="model"
          label="规格型号"
        />
        <el-table-column
          prop="assetCode"
          label="资产编码"
        />
        <el-table-column
          prop="category"
          label="类别"
        >
          <template slot-scope="scope">
            {{ scope.row.category|getCategory }}
          </template>
        </el-table-column>
        <el-table-column
          prop="brand"
          label="品牌"
        />
        <el-table-column
          prop="source"
          label="来源"
        />
        <el-table-column
          prop="supplier"
          label="供应商"
        />
        <el-table-column
          prop="status"
          label="状态"
        >
          <template slot-scope="scope">
            {{ scope.row.status|getStatus }}
          </template>
        </el-table-column>
        <el-table-column
          prop="departmentName"
          label="所属部门"
        />
        <el-table-column
          width="100"
          prop="usePersonName"
          label="使用人名称"
        />
        <el-table-column
          prop="location"
          label="位置"
        />
        <el-table-column
          prop="procurementTime"
          label="采购日期"
        />
        <el-table-column
          width="150"
          show-overflow-tooltip
          prop="photo"
          label="资产照片">
          <template slot-scope="scope">
            <div v-for="item in yieldSplit(scope.row.photo)">
              <span v-if="scope.row.photo !=null && scope.row.photo.length >0" v-for="name in getFileName(item)">
                <a link :href="item" style="color: #2d8cf0" target="_blank">{{name}}</a>
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" v-if="showOperation" width="200">
          <template slot-scope="scope">
            <el-button v-if="isAdminRole == true" type="success" size="small" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button v-if="isAdminRole == true" type="danger" size="small" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
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
      width="60%"
      :before-close="handleCancel"
    >
      <el-form ref="form" :rules="formRule" :model="form" label-width="100px">
        <el-row :gutter="48">
          <el-col :span="10">
            <el-form-item label="资产名称：" size="small" prop="name">
              <el-input v-model="form.name" placeholder="请输入资产名称" />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="资产编码：" size="small" prop="assetCode">
              <el-input v-model="form.assetCode" placeholder="请输入资产编码" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="48">
          <el-col :span="10">
            <el-form-item label="资产类型：" size="small" prop="category">
              <el-select v-model="form.category" placeholder="请选择资产类别">
                <el-option label="网络硬件" :value="0" />
                <el-option label="软件" :value="1" />
                <el-option label="其他" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="所属部门：" size="small" prop="departmentId">
              <el-input v-model="searchDept" placeholder="请选择部门" clearable @focus="showDept" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="48">
          <el-col :span="10">
            <el-form-item label="资产型号：" size="small" prop="model">
              <el-input v-model="form.model" placeholder="请输入资产型号" />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="资产商标：" size="small" prop="brand">
              <el-input v-model="form.brand" placeholder="请输入资产商标" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="48">
          <el-col :span="10">
            <el-form-item label="资产状态：" size="small" prop="status">
              <el-select v-model="form.status" placeholder="请选择资产状态">
                <el-option label="闲置" :value="0" />
                <el-option label="在用" :value="1" />
                <el-option label="借用" :value="2" />
                <el-option label="维修" :value="3" />
                <el-option label="报废" :value="4" />
                <el-option label="停用" :value="5" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="资产来源：" size="small" prop="source">
              <el-input v-model="form.source" placeholder="请输入资产来源" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row gutter="48">
          <el-col :span="10">
            <el-form-item label="供应商：" size="small" prop="supplier">
              <el-input v-model="form.supplier" placeholder="请输入供应商" />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="使用人：" size="small" prop="usePersonName">
              <el-input v-model="form.usePersonName" size="small" placeholder="请输入使用人名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row gutter="48">
          <el-col :span="10">
            <el-form-item label="资产位置：" size="small" prop="location">
              <el-input v-model="form.location" size="small" placeholder="请输入资产位置" />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="采购日期：" size="small" prop="procurementTime">
              <el-date-picker
                v-model="form.procurementTime"
                type="date"
                placeholder="请选择日期"
                aria-setsize="small"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row gutter="48">
          <el-col :span="20">
            <el-form-item label="资产照片：" prop="photo" size="small">
              <el-upload
                show-file-list
                auto-upload
                list-type="picture-card"
                :file-list="fileList"
                action=""
                :on-preview="handlePictureCardPreview"
                :on-remove="handleRemove"
                :before-upload="beforeUpload"
                :limit="4"
                :on-exceed="handleExceed"
                :before-remove="beforeRemove"
              >
                <i class="el-icon-plus"></i>
              </el-upload>
              <el-dialog :visible.sync="dialogVisibleImg">
                <img width="80%" :src="dialogImageUrl" alt="">
              </el-dialog>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleDetermine">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="部门"
      :visible.sync="dialogDept"
      width="20%"
      :before-close="handleCancel_dept"
    >
      <div>
        <el-tree
          ref="deptTree_search"
          :data="deptList"
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
    assetPage,
    assetSave,
    assetUpdate,
    assetDelete,
    assetPicUpload,
    assetExport,
    assetDetails
  } from '@/api/assets'
import { deptPage } from '@/api/sys'
import { getInfo } from '@/api/user'
  import { assetCategory } from '@/utils/enum'
export default {
  name: 'MultiUpload',
  filters: {
    getCategory(key) {
      const categoryMap = new Map([
        [0, '网络硬件'],
        [1, '软件'],
        [2, '其他']
      ])
      return categoryMap.get(key)
    },
    getStatus(key) {
      const statusMap = new Map([
        [0, '闲置'],
        [1, '在用'],
        [2, '借用'],
        [3, '维修'],
        [4, '报废'],
        [5, '停用']
      ])
      return statusMap.get(key)
    }
  },
  watch: {
    multipleSelection: {
      handler(val, oldVal) {
        if (val.length > oldVal) {
          this.disShowTip = true
        }else {
          this.disShowTip = false
        }
      },
      immediate: true
    }
  },
  data() {
    return {
      assetId: '',
      dialogImageUrl: '',
      limitNum: 3,
      disabled: false,
      list: [],
      photoPath:[],
      userInfo: [],
      json_data: [],
      data_all: [],
      data_selected: [],
      excelData: [],
      loading: true,
      showMore: false,
      current: 1,
      size: 10,
      total: 0,
      multiple: null,
      deptList: [],
      checkDeptData: {},
      assetInfo:{},
      available: true,
      checkDeptId: '',
      searchDeptId: '',
      searchName: '',
      searchAssetCode: '',
      searchCategory: '',
      searchStatus: '',
      searchDept: '',
      isAdminRole: false,
      showOperation: false,
      dialogVisibleImg: false,
      disShowTip: false,
      dialogTitle: '新增用户', // 弹框标题
      dialogVisible: false, // 新增、编辑弹框显示隐藏
      dialogDept: false, // 部门选择弹框
      form: {
        name: '',
        assetCode: '',
        category: '',
        model: '',
        source: '',
        supplier: '',
        brand: '',
        status: '',
        departmentId: '',
        departmentName: '',
        usePersonId: '',
        usePersonName: '',
        location: '',
        procurementTime: '',
        photo: ''
      },
      multipleSelection: [], // 表格多选
      treeChecked_search: [],
      defaultProps: {
        label: 'name',
        children: 'childNode'
      },
      treeChecked: [],
      fd: '',
      fileList: [],
      json_fields: {
        资产名称: 'name',
        资产编码: 'assetCode',
        资产类别: 'category',
        资产型号: 'model',
        资产来源: 'source',
        品牌: 'brand',
        供应商: 'supplier',
        状态: 'status',
        资产所在位置: 'location',
        资产照片: 'photo',
        采购日期: 'procurementTime',
        所属部门名: 'departmentName',
        使用人: 'usePersonName'
      },
      formRule: { // 表单验证规则
        name: [
          { required: true, message: '请输入资产名称！', trigger: 'blur' }
        ],
        assetCode: [
          { required: true, message: '请输入资产编码！', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请输入资产类别！', trigger: 'blur' }
        ],
        model: [
          { required: true, message: '请输入资产型号！', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择状态！', trigger: 'blur' }
        ],
        departmentId: [
          { required: true, message: '请选择部门！', trigger: 'blur' }
        ],
        source: [
          { required: true, message: '请输入资产来源！', trigger: 'blur' }
        ],
        supplier: [
          { required: true, message: '请输入供应商名称！', trigger: 'blur' }
        ],
        usePersonName: [
          { required: true, message: '请输入使用者姓名！', trigger: 'blur' }
        ],
        location: [
          { required: true, message: '请输入资产位置！', trigger: 'blur' }
        ],
        procurementTime: [
          { required: true, message: '请选择采购时间！', trigger: 'blur' }
        ],
      }
    }
  },
  computed: {
    // 禁用删除按钮
    deleteDis() {
      if (this.multipleSelection.length > 0) {
        this.disShowTip = true
        return false
      } else {
        return true
      }
    }
  },
  created() {
    this.getUserInfo()
    this.getAssetList()
    this.getDeptList()
  },
  methods: {
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisibleImg = true;
    },
    handleExceed(files, fileList) {
      this.$message.warning(`单次只能上传 4个文件，您已选择了 ${files.length + fileList.length} 个文件`);
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${ file.name }？`);
    },
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

    // 获取资产详情
    getAssetsDetails(){
      assetDetails(this.assetId).then(res =>{
        if (res.code === '0'){
          this.assetInfo= res.data
        }
      }).catch(e =>{
        console.log(e)
      })
    },
    async downloadExcel() {
      const ids = this.multipleSelection.map(x => x.id)
      // 啥都没有选择 返回所有 数据
      if (ids.length === 0) {
        this.list.forEach(x => {
          const category = x.category
          const status = x.status
          x.category = assetCategory[category]
          x.status = assetCategory[status]
        })
        return this.list
      }
      const res = await assetExport({ ids: ids })
      if (res.code === '0') {
        res.data.forEach(x => {
          const category = x.category
          const status = x.status
          x.category = assetCategory[category]
          x.status = assetCategory[status]
        })
        return res.data
      } else {
        return []
      }
    },
    // 分割照片路径
    yieldSplit(photo){
      let result = [];
      if (photo != null && photo != ''){
        result = photo.split(";")
      }
      return result
    },
    // 获取照片名称
    getFileName(fullName){
      let result;
      result = fullName.substring(fullName.lastIndexOf("/")+1);
      return result;
    },
    // 调用后端上传接口
    beforeUpload(file) {
      console.log('上传文件：'+file)
      let tempPhoto = '';
      const picExtension = file.name.substring(file.name.lastIndexOf('.')+1)
      const isSize = file.size/1024<500
      if (picExtension != 'jpg' && picExtension != 'png' && picExtension != 'jpeg'){
        this.$message({
          type: 'warning',
          message: '只能上传jpg/jpeg/png格式的图片',
        })
        this.fileList = []
        return
      }
      if (!isSize){
        this.$message({
          type: 'warning',
          message: '上传图片大小不能超过500KB'
        })
        this.fileList = []
        return
      }
      this.fd = new FormData()
      this.fd.append('file', file)
      assetPicUpload(this.fd).then(res => {
        if (res.code === '0') {
          tempPhoto = res.data
          this.$message({
            type: 'success',
            message: '上传成功'
          })
          this.fileList.push({url:decodeURI(tempPhoto)})
        }else {
          this.$message({
            type: 'warning',
            message: '上传失败'
          })
        }
      })
    },
    // 获取资产列表
    getAssetList() {
      this.loading = true
      assetPage({
        name: this.searchName,
        category: this.searchCategory,
        assetCode: this.searchAssetCode,
        status: this.searchStatus,
        departmentId: this.form.departmentId,
        pageNo: this.current,
        pageSize: this.size
      }).then(res => {
        if (res.code === '0') {
          this.multipleSelection.length = 0
          this.loading = false
          this.list = res.data.list
          this.data_all = res.data.list
          this.current = res.data.current
          this.size = res.data.size
          this.total = res.data.total
        }
      }).catch(e => {
        console.log(e)
      })
    },
    // 获取部门列表
    getDeptList() {
      deptPage({
        available: this.available
      }).then(res => {
        if (res.code === '0') {
          this.deptList = res.data.list
        } else {
          console.log('deptlist 获取数据失败！')
        }
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
    // 条件搜索
    handleSearch() {
      const data = {
        name: this.searchName,
        category: this.searchCategory,
        assetCode: this.searchAssetCode,
        status: this.searchStatus,
        departmentId: this.checkDeptId
      }
      this.loading = true
      assetPage(data).then(res => {
        if (res.code === '0') {
          this.loading = false
          this.list = res.data.list
          this.current = res.data.current
          this.size = res.data.size
          this.total = res.data.total
        }
      })
    },
    // 重置搜索
    handSearchEmpty() {
      this.searchName = ''
      this.searchAssetCode = ''
      this.searchCategory = ''
      this.searchDept = ''
      this.searchStatus = ''
      this.multipleSelection.length = 0
      this.getAssetList()
    },
    // 部门列表——搜索
    handleCheckChange_search(data, checked, indeterminate) {
      if (checked) {
        this.$refs.deptTree_search.setCheckedKeys([data.id])
      }
    },
    handleCheck_search(data) {
      if (!data.childNode || data.childNode.length == 0) {
        this.checkDeptData = data
      }
    },
    // 选择部门确定
    handleDetermine_dept() {
      console.log(this.searchDeptId)
      this.dialogDept = false
      this.checkDeptId = this.checkDeptData.id
      this.searchDept = this.checkDeptData.name
      this.form.departmentId = this.checkDeptData.id
      this.form.departmentName = this.checkDeptData.name
    },
    handleCancel_dept() {
      this.checkDeptData = null
      this.dialogDept = false
    },
    // 搜索-显示部门列表
    showDept() {
      this.dialogDept = true
      this.$nextTick(() => {
        this.$refs.deptTree_search.setCheckedKeys([])
      })
    },
    // 每页条数发生变化
    handleSizeChange(val) {
      this.size = val
      this.loading = true
      this.getAssetList()
    },
    // 页码发生变化
    handleCurrentChange(val) {
      console.log(val)
      this.current = val
      this.loading = true
      this.getAssetList()
    },
    // 新增资产
    addAsset() {
      this.dialogType = 'add'
      this.inputDis = false
      this.dialogTitle = '新增资产'
      this.form = {
        name: null,
        assetCode: null,
        category: null,
        model: null,
        source: null,
        supplier: null,
        brand: null,
        status: null,
        departmentName: null,
        departmentId: null,
        usePersonName: null,
        location: null,
        photo: null
      }
      this.dialogVisible = true
    },
    // 取消
    handleCancel(type) {
      this.fileList = []
      this.$refs['form'].resetFields()
      this.form.name = ''
      this.form.assetCode = ''
      this.form.model = ''
      this.form.category = ''
      this.form.source = ''
      this.form.supplier = ''
      this.form.brand = ''
      this.form.status = ''
      this.form.departmentId = ''
      this.form.departmentName = ''
      this.form.usePersonName = ''
      this.searchDept = ''
      this.dialogVisible = false
      this.$refs.upload.clearFiles()
    },
    // 确定
    handleDetermine() {
      this.form.photo = '';
      let laterFile = '';
      this.fileList.forEach(res =>{
        if (res.url.length >0){
          laterFile = laterFile + res.url+';'
        }
        this.form.photo = laterFile
      })
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.dialogType === 'add') {
            console.log(this.form)
            assetSave(this.form).then(res => {
              if (res.code === '0') {
                this.$message({
                  type: 'success',
                  message: '新增成功',
                })
                this.searchDeptId = ''
                this.getAssetList()
                this.dialogVisible = false
              } else {
                this.$message({
                  type: 'warming',
                  message: '新增失败',
                })
                this.dialogVisible = false
              }
            })
            this.photoPath = [];
          }
          if (this.dialogType === 'edit') {
            const data = {
              id: this.form.id,
              name: this.form.name,
              assetCode: this.form.assetCode,
              category: this.form.category,
              model: this.form.model,
              supplier: this.form.supplier,
              brand: this.form.brand,
              status: this.form.status,
              source: this.form.source,
              departmentName: this.form.departmentName,
              departmentId: this.form.departmentId,
              usePersonName: this.form.usePersonName,
              procurementTime: this.form.procurementTime,
              location: this.form.location,
              photo: this.form.photo
            }
            assetUpdate(data).then(res => {
              if (res.code === '0') {
                this.$message({
                  type: 'success',
                  message: '修改成功！',
                })
                console.log('文件列表：'+this.fileList.length)
                this.getAssetList()
                this.getAssetsDetails()
                this.dialogVisible = false
              } else {
                this.$message({
                  type: 'warming',
                  message: '修改失败！',
                })
                this.dialogVisible = false
              }
            })
            this.photoPath = [];
          }
        }
        this.fileList = []
      })
    },
    // 编辑
    handleEdit(row) {
      this.fileList = []
      let _temp = []
      let _name = ''
      console.log(row)
      this.assetId = row.id
      _temp = this.yieldSplit(row.photo)
      _temp.forEach(res =>{
        if (res.length >0){
          _name = this.getFileName(res)
          let photoJson ={
            name: _name,
            url: res,
          }
          this.fileList.push(photoJson)
        }
      })
      this.dialogType = 'edit'
      this.dialogTitle = '编辑资产'
      this.form = {
        id: row.id,
        name: row.name,
        assetCode: row.assetCode,
        category: row.category,
        model: row.model,
        status: row.status,
        departmentId: row.departmentId,
        departmentName: row.departmentName,
        usePersonName: row.usePersonName,
        source: row.source,
        supplier: row.supplier,
        brand: row.brand,
        location: row.location,
        procurementTime: row.procurementTime,
        photo: row.photo
      }
      this.getAssetsDetails()
      this.searchDept = row.departmentName
      this.dialogVisible = true
    },
    // 表格多选
    async handleSelectionChange(val) {
      console.log('val', val.map(x => x.name))
      this.multipleSelection = val
      this.disShowTip = true
    },
    // 删除
    handleDelete(row) {
      this.$confirm('确认删除所选资产吗？', '提示', {
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
        assetDelete({ ids: ids }).then(res => {
          console.log(res)
          if (res.code === '0') {
            this.$message({
              type: 'success',
              message: '删除成功！'
            })
            this.getAssetList()
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
  .red{
    color: red;
  }
  .el-button{
    font-size: 12px;
    padding: 6px;
  }
  .knowledgeBox{
    padding: 10px;
  }
  .knowledgeBox .top{
    margin-bottom: 10px;
  }
  .knowledgeBox .row_knowledge{
    margin-bottom: 10px;
  }
  .search_col .el-input,
  .search_col .el-select{
    width: 15%;
    margin-right: 10px;
  }
  .search_col .el-input input{
    height: 28px;
    line-height: 28px;
  }
  .search_col span{
    font-size: 14px;
  }
  .search_col .export-excel-wrapper {
    display: inline-block;
    margin-left: 10px;
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
  .knowledgeBox .page{
    margin-top: 10px;
  }
</style>
