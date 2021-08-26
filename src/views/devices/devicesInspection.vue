
<template>
  <div class="body_box">
    <el-row class="top">
      <el-col :span="24" class="search_col">
        <span>巡检名称：</span>
        <el-input v-model="searchName" size="small" @keyup.enter.native="handleSearch" placeholder="请输入巡检名称" clearable />
        <span>巡检人：</span>
        <el-input v-model="searchMaster" size="small" @keyup.enter.native="handleSearch" placeholder="请输入巡检人" clearable />
        <span>巡检状态：</span>
        <el-select v-model="searchStatus" placeholder="请选择巡检状态" size="small" clearable>
          <el-option label="未开始" :value="0" />
          <el-option label="进行中" :value="1" />
          <el-option label="已完成" :value="2" />
        </el-select>
        <el-button size="small" type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button size="small" type="primary" icon="el-icon-refresh" @click="handSearchEmpty">重置</el-button>
        <el-button v-if="isAdminRole == true" size="small" type="success" icon="el-icon-plus" @click="addInspection">新增</el-button>
        <el-button v-if="isAdminRole == true" size="small" type="danger" icon="el-icon-delete" :disabled="deleteDis" @click="handleDelete(multiple)">删除</el-button>
      </el-col>
    </el-row>
    <el-row class="table_row">
      <el-table
        ref="multipleTable"
        v-loading="loading"
        :data="list"
        border
        style="width: 100%"
        :row-class-name="highClass"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="50"
        />
        <el-table-column
          width="200"
          prop="name"
          label="巡检名称"
        />
        <el-table-column
          :sortable="true"
          width="200"
          prop="startTime"
          label="开始时间"
        />
        <el-table-column
          :sortable="true"
          width="200"
          prop="endTime"
          label="结束时间"
        />
        <el-table-column
          width="100"
          prop="signIn"
          label="签到方式"
        >
          <template slot-scope="scope">
            {{ scope.row.signIn|getWays }}
          </template>
        </el-table-column>
        <el-table-column
          width="100"
          prop="status"
          label="巡检状态"
        >
          <template slot-scope="scope">
            {{ scope.row.status|getStatus }}
          </template>
        </el-table-column>
        <el-table-column
          :sortable="true"
          width="200"
          prop="realInspectTime"
          label="实际巡检时间"
        />
        <el-table-column
          prop="checkPerson"
          label="巡检人"
        />
        <el-table-column
          show-overflow-tooltip
          prop="checkResult"
          label="巡检结果"
        />
        <el-table-column
          show-overflow-tooltip
          align="center"
          width="150"
          prop="checkPhoto"
          label="巡检照片">
          <template scope="scope">
            <div v-for="item in yieldSplit(scope.row.checkPhoto)">
              <span v-if="scope.row.checkPhoto !=null && scope.row.checkPhoto.length >0" v-for="name in getFileName(item)">
                <a link :href="item" style="color: #2d8cf0" target="_blank">{{name}}</a>
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" :width="widthValue">
          <template slot-scope="scope">
            <div class="rowButton">
              <el-button v-if="scope.row.status == 0 && scope.row.checkPerson == userInfo.loginName" type="primary" size="small" icon="el-icon-edit-outline" @click="handleInspect(scope.row)">开始巡检</el-button>
              <el-button v-if="scope.row.status == 1 && scope.row.checkPerson == userInfo.loginName" type="success" size="small" icon="el-icon-finished" @click="handleEdit(scope.row)">提交结果</el-button>
              <el-button v-else-if="scope.row.status == 2" type="success" size="small" icon="el-icon-edit" @click="handleDetails(scope.row)">查看详情</el-button>
              <el-button v-else-if="scope.row.checkPerson != userInfo.loginName" type="success" size="small" icon="el-icon-finished" @click="handleEdit(scope.row)" v-show="false">提交结果</el-button>
              <el-button v-if="isAdminRole == true" type="danger" size="small" icon="el-icon-delete" @click="handleDelete(scope.row)">删 除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-row>
    <el-dialog
      :title="showTitle"
      :visible.sync="showDialog"
      width="50%"
      :before-close="handleCancel_result"
    >
      <el-form ref="form" :rules="formRule" :model="form" label-width="120px">
        <el-row :gutter="48">
          <el-col :span="20">
            <el-form-item label="巡检名称：" size="small" prop="name">
              <el-input v-model="form.name" placeholder="请输入巡检名称" :readonly="onlyRead" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="48">
          <el-col :span="10">
            <el-form-item label="开始时间：" size="small" prop="startTime">
              <el-date-picker
                v-model="form.startTime"
                type="datetime"
                :readonly="onlyRead"
                placeholder="请选择开始日期"
                aria-setsize="small"
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="结束时间：" size="small" prop="endTime">
              <el-date-picker
                v-model="form.endTime"
                type="datetime"
                :readonly="onlyRead"
                placeholder="请选择结束日期"
                aria-setsize="small"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="48">
          <el-col :span="10">
            <el-form-item label="签到方式：" size="small" prop="signIn">
              <el-select v-model="form.signIn" placeholder="请选择签到方式" :disabled="onlyShow">
                <el-option label="现场定位" :value="0" />
                <el-option label="现场拍照" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="实际巡检日期：" size="small" prop="realInspectTime">
              <el-date-picker
                v-model="form.realInspectTime"
                type="datetime"
                :readonly="onlyShow"
                placeholder="请选择实际巡检日期"
                aria-setsize="small"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="48">
          <el-col :span="20">
            <el-form-item label="巡检结果：" size="small" prop="checkResult">
              <el-input v-model="form.checkResult" placeholder="请输入巡检结果" type="textarea" :rows="3" maxlength="300" show-word-limit :readonly="onlyShow" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="48">
          <el-col :span="20">
            <el-form-item label="巡检照片：" prop="checkPhoto" size="small">
              <el-upload
                :class="{hide:hideUploadEdit}"
                action=""
                :disabled="disUpload"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :before-upload="beforeUpload"
                :on-change="handleChange"
                :on-exceed="handleExceed"
                :before-remove="beforeRemove"
                :limit="4"
                :file-list="fileList"
                list-type="picture-card"
              >
                <i class="el-icon-plus"></i>
              </el-upload>
              <el-dialog :visible.sync="dialogVisibleImg">
                <img width="80%" :src="dialogImageUrl" alt="">
              </el-dialog>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="48">
          <el-col :span="20 ">
            <el-form-item label="备 注：" size="small" prop="remarks ">
              <el-input v-model="form.remarks" type="textarea" :rows="4" maxlength="300" show-word-limit placeholder="备注信息" :readonly="onlyShow" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer" v-show="showFooter">
        <el-button @click="handleCancel_result">取 消</el-button>
        <el-button type="primary" @click="handleDetermine_result">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="开始巡检"
      width="50%"
      :visible.sync="showInspectDialog"
      :before-close="handleCancel_Inspect"
    >
      <el-form ref="form" :rules="formRule" :model="form" label-width="120px">
        <el-row :gutter="48">
          <el-col :span="20">
            <el-form-item label="巡检名称：" size="small" prop="name">
              <el-input v-model="form.name" placeholder="请输入巡检名称" :readonly="onlyRead" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="48">
          <el-col :span="10">
            <el-form-item label="开始时间：" size="small" prop="startTime">
              <el-date-picker
                v-model="form.startTime"
                type="datetime"
                :readonly="onlyRead"
                placeholder="请选择开始日期"
                aria-setsize="small"
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="结束时间：" size="small" prop="endTime">
              <el-date-picker
                v-model="form.endTime"
                type="datetime"
                :readonly="onlyRead"
                placeholder="请选择结束日期"
                aria-setsize="small"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="48">
          <el-col :span="10">
            <el-form-item label="是否转派：" size="small" prop="signIn">
              <el-radio v-model="assign" label="0" value="0" >否</el-radio>
              <el-radio v-model="assign" label="1" value="1" >是</el-radio>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="48">
          <el-col :span="20">
            <el-form-item v-if="assign == 1" label="指派巡检人：" size="small" prop="checkPerson">
              <el-select v-model="form.checkPerson" filterable placeholder="请指派巡检人" clearable>
                <el-option
                  v-for=" (item,index) in userlist "
                  :key=" index "
                  :value=" item.loginName "
                  :label=" item.loginName "
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel_Inspect">取 消</el-button>
        <el-button type="primary" @click="handleDetermine_Inspect">确 定</el-button>
      </span>
    </el-dialog>
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
      <el-form ref="form" :rules="formRule" :model="form" label-width="120px">
        <el-row :gutter="48">
          <el-col :span="20">
            <el-form-item label="巡检名称：" size="small" prop="name">
              <el-input v-model="form.name" placeholder="请输入巡检名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="48">
          <el-col :span="10">
            <el-form-item label="开始时间：" size="small" prop="startTime">
              <el-date-picker
                v-model="form.startTime"
                type="datetime"
                :picker-options="pickerOptions_start"
                placeholder="请选择开始时间"
                aria-setsize="small"
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="截至时间：" size="small" prop="endTime">
              <el-date-picker
                v-model="form.endTime"
                type="datetime"
                :picker-options="pickerOptions_end"
                placeholder="请选择截至时间"
                aria-setsize="small"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="48">
          <el-col :span="20">
            <el-form-item label="指派巡检人：" size="small" prop="checkPerson">
              <el-select v-model="form.checkPerson" filterable placeholder="请指派巡检人" clearable>
                <el-option
                  v-for=" (item,index) in userlist "
                  :key=" index "
                  :value=" item.loginName "
                  :label=" item.loginName "
                />
              </el-select>
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
  import {
    inspectionDelete,
    inspectionPage, inspectionResult,
    inspectionSave, inspectionStart, inspectionUpdate, inspectPicUpload
  } from '@/api/inspection'
import { getInfo, userList } from '@/api/user'
import { mapGetters } from 'vuex'
export default {
  name: 'DevicesInspection',
  filters: {
    getWays(key) {
      const signMap = new Map([
        [0, '现场定位'],
        [1, '现场拍照']
      ])
      return signMap.get(key)
    },
    getStatus(key) {
      const statusMap = new Map([
        [0, '未开始'],
        [1, '进行中'],
        [2, '已完成']
      ])
      return statusMap.get(key)
    }
  },
  props: ['jumpId'],
  watch: {
    jumpId: {
      handler(val, oldVal) {
        console.log('val_jumpId', val)
        if (val) {
          this.rowHighLightId = val
        }
      },
      immediate: true
    },
    highLightId: {
      handler(val, oldVal) {
        if (val) {
          this.changeHighLightIndex(val)
        }
      },
      immediate: true
    },
  },
  data() {
    var start_time
    return {
      list: [],
      userlist: [],
      json_data: [],
      userInfo: [],
      data_all: [],
      data_selected: [],
      excelData: [],
      highLightIndex: -1, // 高亮的index
      rowHighLightId: undefined, // 高亮的index
      loading: false,
      showMore: false,
      current: 1,
      size: 10,
      total: 0,
      widthValue: 150,
      multiple: null,
      deptList: [],
      checkDeptData: {},
      available: true,
      disAdd: true,
      checkPersonId: '',
      searchName: '',
      searchMaster: '',
      searchStatus: '',
      assign: '0',
      onlyRead: false,
      onlyShow: false,
      showDialog: false,
      showInspectDialog: false,
      showTitle: '',
      dialogTitle: '', // 弹框标题
      dialogVisible: false, // 新增、编辑弹框显示隐藏
      dialogVisibleImg: false,
      hideUploadEdit: false,
      showUploadEdit: true,
      noneUploadEdit: false,
      isAdminRole: false,
      disUpload: false,
      showFooter: true,
      dialogImageUrl: '',
      form: {
        id: '',
        name: '',
        startTime: '',
        endTime: '',
        signIn: 1,
        status: '',
        realInspectTime: '',
        checkPerson: '',
        checkResult: '',
        checkPhoto: '',
        createUser: '',
        updateUser: '',
        remarks: ''
      },
      multipleSelection: [], // 表格多选
      fd: '',
      fileList: [],
      formRule: { // 表单验证规则
        name: [
          { required: true, message: '请输入巡检名称！', trigger: 'blur' }
        ],
        checkResult: [
          { required: true, message: '请输入巡检结果！', trigger: 'blur' }
        ],
        startTime: [
          { required: true, message: '请选择开始时间！', trigger: 'blur' }
        ],
        endTime: [
          { required: true, message: '请选择结束时间！', trigger: 'blur' }
        ],
        checkPerson: [
          { required: true, message: '请选择巡检人！', trigger: 'blur' }
        ]
      },
      pickerOptions_start: {
        disabledDate(time) {
          return time.getTime() < Date.now();
        }
      },
      pickerOptions_end: {
        disabledDate(time) {
          return time.getTime() < Date.now();
        }
      },
    }
  },
  computed: {
    ...mapGetters(['highLightId']),
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
    this.getInspectList()
    this.getUserInfo()
    this.getUserList()
  },
  methods: {
    // 高亮某一行
    highRow(index) {
    },
    // 修改 高亮的 index
    changeHighLightIndex(id) {
      const index = this.list.findIndex(x => x.id === id)
      this.highLightIndex = index
    },
    highClass({ row, rowIndex }) { // 给表格某行加上 红色 class
      return rowIndex === this.highLightIndex ? 'warning-row' : ''
    },
    //获取巡检列表
    getInspectList() {
      this.loading = true
      inspectionPage({
        name: this.searchName,
        status: this.searchStatus,
        checkPerson: this.searchMaster,
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
          this.changeHighLightIndex(this.rowHighLightId) // 数据完成后找到高亮的index
        }
      }).catch(e => {
        console.log(e)
      })
    },
    // 获取用户列表
    getUserList() {
      userList({}).then(res => {
        if (res.code == 0) {
          this.userlist = res.data
          console.log(this.userlist)
        }
      }).catch(e => {
        console.log(e)
      })
    },
    // 开始巡检
    handleInspect(row){
      this.form = {
        id: row.id,
        name: row.name,
        checkPerson: row.checkPerson,
        startTime: row.startTime,
        endTime: row.endTime,
      }
      this.onlyRead = true
      this.showInspectDialog = true
    },
    // 巡检详情
    handleDetails(row){
      console.log(row)
      this.fileList = []
      let _temp = []
      let _name = ''
      console.log(row)
      _temp = this.yieldSplit(row.checkPhoto)
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
      this.showTitle = '巡检详情'
      this.form = {
        name: row.name,
        startTime: row.startTime,
        endTime: row.endTime,
        signIn: row.signIn,
        status: row.status,
        realInspectTime: row.realInspectTime,
        checkPerson: row.checkPerson,
        checkResult: row.checkResult,
        remarks: ''
      }
      this.showFooter = false
      this.hideUploadEdit = true
      this.disUpload= true
      this.onlyShow = true
      this.onlyRead = true
      this.showDialog = true
    },
    //获取当前登录用户信息
    getUserInfo(){
      getInfo().then(res =>{
        if(res.code==='0'){
          this.userInfo = res.data
          this.handleJustifyRole()
          console.log(this.userInfo.area)
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
          this.widthValue = 200
          console.log('是否是管理员角色：'+this.isAdminRole)
          return
        }
      })
    },
    handlePreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisibleImg = true;
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    handleExceed(files, fileList) {
      this.$message.warning(`单次只能上传 4个文件，您已选择了 ${files.length + fileList.length} 个文件`);
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${ file.name }？`);
    },
    handleChange(file,fileList){
      this.hideUploadEdit = fileList.length >4
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
      inspectPicUpload(this.fd).then(res => {
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
    // 日期时间转换
    doFormat(datetime) {
      const d = new Date(datetime)
      const formatdatetime = d.getFullYear() + '-' + this.addDateZero(d.getMonth() + 1) + '-'
        + this.addDateZero(d.getDate()) + ' ' + this.addDateZero(d.getHours()) + ':'
        + this.addDateZero(d.getMinutes()) + ':' + this.addDateZero(d.getSeconds())
      return formatdatetime
    },
    addDateZero(num) {
      return (num < 10 ? '0' + num : num)
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
    // 条件搜索
    handleSearch() {
      const data = {
        name: this.searchName,
        checkPerson: this.searchMaster,
        status: this.searchStatus,
      }
      this.loading = true
      inspectionPage(data).then(res => {
        if (res.code === '0') {
          this.loading = false
          this.list = res.data.list
          this.current = res.data.current
          this.size = res.data.size
          this.total = res.data.total
          this.highLightIndex = -1
          this.rowHighLightId = undefined
        }
      })
    },
    // 重置搜索
    handSearchEmpty() {
      this.searchName = null
      this.searchMaster = null
      this.searchStatus = null
      this.multipleSelection.length = 0
      this.getInspectList()
      this.highLightIndex = -1
      this.rowHighLightId = undefined
    },
    // 每页条数发生变化
    handleSizeChange(val) {
      console.log(val)
      this.size = val
      this.loading = true
      this.getInspectList()
    },
    // 页码发生变化
    handleCurrentChange(val) {
      console.log(val)
      this.current = val
      this.loading = true
      this.getInspectList()
    },
    // 新增巡检
    addInspection() {
      this.dialogType = 'add'
      this.dialogTitle = '新增巡检'
      this.form = {
        name: '',
        signIn: 1,
        startTime: '',
        endTime: '',
        createUser: '',
        checkPerson: '',
      }
      this.dialogVisible = true
    },
    // 提交结果/详情
    handleEdit(row) {
      console.log(row)
      this.fileList = []
      this.disUpload = false
      this.dialogType = 'edit'
      this.showTitle = '提交结果'
      this.form = {
        id: row.id,
        name: row.name,
        startTime: row.startTime,
        endTime: row.endTime,
        signIn: 1,
        realInspectTime: row.realInspectTime,
      }
      this.showFooter = true
      this.onlyRead = true
      this.onlyShow = false
      this.showDialog = true
    },
    // 开始巡检弹窗取消
    handleCancel_Inspect(){
      this.showInspectDialog = false
    },
    //开始巡检弹窗确认
    handleDetermine_Inspect(){
      // this.assign ==0 表示没有转派巡检人，默认为创建时的指派的巡检人
      if (this.assign == 0){
        inspectionStart(this.form.id).then(res =>{
          if (res.code == '0'){
            this.$message({
              type: 'warning',
              message: '已开始巡检'
            })
            this.getInspectList()
          }
        }).catch(e=>{
          console.log(e)
        })
      }else {
        let data ={
          id: this.form.id,
          checkPerson: this.form.checkPerson
        }
        inspectionUpdate(data).then(res =>{
          if (res.code == '0'){
            this.$message({
              type: 'warning',
              message: '巡检人已转派成功'
            })
            this.getInspectList()
          }
        }).catch(e=>{
          console.log(e)
        })
      }
      this.showInspectDialog = false
    },
    //提交取消
    handleCancel_result(type) {
      this.$refs['form'].resetFields()
      this.showDialog = false
      this.fileList =[]
      this.$refs.upload.clearFiles()
    },
    // 提交确认
    handleDetermine_result(){
      this.form.checkPhoto = '';
      let tempCheckPhoto = '';
      this.fileList.forEach(res =>{
        if (res.url.length >0){
          tempCheckPhoto = tempCheckPhoto + res.url+';'
        }
        this.form.checkPhoto = tempCheckPhoto
      })
      this.$refs['form'].validate((valid) => {
        if (valid) {
          console.log(this.form)
          inspectionResult(this.form).then(res => {
            if (res.code === '0') {
              this.$message({
                type: 'success',
                message: '提交成功'
              })
              this.getInspectList()
              this.showDialog = false
            } else {
              this.$message({
                type: 'warming',
                message: '提交失败'
              })
              this.showDialog = false
            }
          })
        }
      })
    },
    // 新增取消
    handleCancel(type) {
      this.$refs['form'].resetFields()
      this.form={
        name: '',
        startTime: '',
        endTime: '',
        signIn: '',
        status: '',
        realInspectTime: '',
        checkPerson: '',
        checkResult: '',
        checkPhoto: '',
        createUser: '',
        updateUser: '',
        remarks: ''
      }
      this.dialogVisible = false
      this.$refs.upload.clearFiles()
    },
    // 新增确定
    handleDetermine() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          console.log(this.form)
          if (this.form.startTime != null){
            this.form.startTime = this.doFormat(this.form.startTime)
          }
          if (this.form.endTime != null){
            this.form.endTime = this.doFormat(this.form.endTime)
          }
          this.form.createUser = this.userInfo.loginName
          inspectionSave(this.form).then(res => {
            if (res.code === '0') {
              this.$message({
                type: 'success',
                message: '新增成功'
              })
              this.getInspectList()
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
      })
    },
    // 表格多选
    handleSelectionChange(val) {
      this.multipleSelection = val
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
        inspectionDelete({ ids: ids }).then(res => {
          console.log(res)
          if (res.code === '0') {
            this.$message({
              type: 'success',
              message: '删除成功！'
            })
            this.getInspectList()
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  },
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
  .body_box{
    padding: 10px;
  }
  .body_box .top{
    margin-bottom: 10px;
  }
  .body_box .row_knowledge{
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
  .body_box .page{
    margin-top: 10px;
  }
  .table_row /deep/ .warning-row {
    background: #f89a9a;
  }
  .hide .el-upload-picture-card {
    display: none;
  }
  .table_row /deep/ .warning-row {
    background: #f89a9a;
  }
  .rowButton{
    float: right;
  }
</style>
