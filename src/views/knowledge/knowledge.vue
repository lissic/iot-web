
<template>
  <div class="knowledgeBox">
    <el-row class="top">
      <el-col :span="24" class="search_col">
        <span>标 题：</span>
        <el-input v-model="searchTitle" size="small" @keyup.enter.native="handleSearch" placeholder="请输入标题名称" clearable />
        <span>关键字：</span>
        <el-input v-model="searchKeywords" size="small" @keyup.enter.native="handleSearch" placeholder="请输入关键字" clearable />
        <span>作 者：</span>
        <el-input v-model="searchAuthor" size="small" @keyup.enter.native="handleSearch" placeholder="请输入作者姓名"></el-input>
        <span>知识类别：</span>
        <el-select v-model="searchCategory" placeholder="请选择类别" size="small" clearable>
          <el-option label="网络硬件类" :value="0" />
          <el-option label="软件类" :value="1" />
          <el-option label="工程类" :value="2" />
          <el-option label="其他类" :value="3" />
        </el-select>
        <el-button size="small" type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button size="small" type="primary" icon="el-icon-refresh" @click="handSearchEmpty">重置</el-button>
        <el-button size="small" type="success" icon="el-icon-plus" title="新增知识" @click="handleKnowledge">新增</el-button>
        <el-button size="small" type="success" icon="el-icon-edit-outline" @click="askQuestion">提问</el-button>
        <el-button size="small" type="danger" icon="el-icon-delete" :disabled="deleteDis" @click="handleDelete(multiple)">删除</el-button>
      </el-col>
    </el-row>
    <el-row class="table_row">
      <el-table
        ref="multipleTable"
        v-loading="loading"
        :data="tempList"
        stripe
        border
        style="width: 100%"
        @row-dblclick="openDetails"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="50"
        />
        <el-table-column
          width="200"
          prop="title"
          label="标 题"
        />
        <el-table-column
          width="100"
          prop="synopsis"
          show-overflow-tooltip
          label="简 介"
        />
        <el-table-column
          width="150"
          prop="keywords"
          show-overflow-tooltip
          label="关键字"
        />
        <el-table-column
          prop="category"
          label="知识分类"
        >
          <template slot-scope="scope">
            {{ scope.row.category|getCategory }}
          </template>
        </el-table-column>
        <el-table-column
          prop="reviewCount"
          label="浏览次数"
        />
        <el-table-column
          width="100"
          prop="status"
          label="状态"
          v-if="showStatus"
        >
          <template slot-scope="scope">
            {{ scope.row.status|getStatus }}
          </template>
        </el-table-column>
        <el-table-column
          prop="createUser"
          label="作者"
        />
        <el-table-column
          prop="updateUser"
          label="更新人"
        />
        <el-table-column
          :sortable="true"
          width="200"
          prop="updateTime"
          label="更新时间"
        />
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button v-if="scope.row.createUser == userInfo.loginName" type="success" size="small" icon="el-icon-edit" @click="handleEdit(scope.row)" v-show="true">编辑</el-button>
            <el-button v-if="scope.row.createUser == userInfo.loginName" type="danger" size="small" icon="el-icon-delete" @click="handleDelete(scope.row)" v-show="true">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-row>
    <el-dialog
      title="提出问题"
      :visible.sync="questionDialog"
      width="60%"
      :before-close="quesCancel"
    >
      <el-form ref="form" :rules="quesFormRule" :model="form" label-width="100px">
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="问题类别：" size="small" prop="category">
              <el-select v-model="form.category" placeholder="请选择问题类别">
                <el-option label="网络硬件类" :value= 0 />
                <el-option label="软件类" :value= 1 />
                <el-option label="工程类" :value= 2 />
                <el-option label="其他类" :value= 3 />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="20">
            <el-form-item label="问题描述：" size="small" prop="title">
              <el-input v-model="form.title" type="textarea" :rows="3" placeholder="请输入问题描述" clearable></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="danger" @click="quesCancel">取 消</el-button>
        <el-button type="primary" @click="quesDetermine">确 定</el-button>
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
      width="60%"
      :before-close="handleCancel"
    >
      <el-form ref="form" :rules="formRule" :model="form" label-width="100px">
        <el-row>
          <el-col :span="20">
            <el-form-item label="标 题：" size="small" prop="title">
              <el-input v-model="form.title" placeholder="请输入知识标题" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item label="关键字：" size="small" prop="keywords">
              <el-input v-model="form.keywords" placeholder="请输入关键字" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item label="简 介：" size="small" prop="synopsis">
              <el-input v-model="form.synopsis" type="textarea" :rows="5" placeholder="请输入知识简介" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-form-item label="知识类别：" size="small" prop="category">
              <el-select v-model="form.category" placeholder="请选择知识类别">
                <el-option label="网络硬件类" :value= 0 />
                <el-option label="软件类" :value= 1 />
                <el-option label="工程类" :value= 2 />
                <el-option label="其他类" :value= 3 />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="知识状态：" size="small" prop="status">
              <el-select v-model="form.status" placeholder="请选择知识状态">
                <el-option label="隐藏" :value="0" />
                <el-option label="显示" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item label="知识内容：" size="small" prop="content">
              <div class="editor_content">
                <quill-editor
                  v-model="content_editor"
                  ref="myQuillEditor"
                  :options="editorOption"
                  @change="onEditorChange($event)">
                </quill-editor>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item class="attachBox" label="知识附件：" label-width="100px">
              <el-upload
                ref="upload"
                class="upload_file"
                multiple
                drag
                action=""
                :before-upload="beforeUpload"
                :on-remove="handleRemove"
                :file-list="fileList"
              >
                <i class="el-icon-upload"></i>
                <div class="upload_text">将文件拖拽到此处，或<em>点击上传</em></div>
                <div class="upload_tip" slot="tip">不能上传.exe或.sh等可执行文件，且文件大小不超过10MB</div>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="danger" @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleDetermine">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  import {
    fileUpload,
    knowledgeDelete,
    knowledgePage,
    knowledgeSave,
    knowledgeUpdate,
    updateCount
  } from '@/api/knowledge'
  import App from '@/App'
  import { getInfo } from '@/api/user'

  export default {
  filters: {
    getCategory(key) {
      const categoryMap = new Map([
        [0, '网络硬件类'],
        [1, '软件类'],
        [2, '工程类'],
        [3, '其他类']
      ])
      return categoryMap.get(key)
    },
    getStatus(key) {
      const statusMap = new Map([
        [0, '隐藏'],
        [1, '显示']
      ])
      return statusMap.get(key)
    }
  },
  data() {
    return {
      multipleSelection: [],
      list: [],
      fileList: [],
      current: 1,
      size: 10,
      total: 0,
      loading: false,
      questionDialog: false,
      disDownload: false,
      dialogDetails: false,
      disDetails: false,
      isAdminRole: false,
      content_editor: '',
      editorOption: {},
      currentCount: 0,
      readonly: true,
      multiple: null,
      userInfo:[],
      tempList: [],
      temp:{
        id: '',
        reviewCount:0
      },
      form: {
        id: '',
        title: '',
        synopsis: '',
        keywords: '',
        category: null,
        status: 1,
        reviewCount: 0,
        content: '',
        attach: '',
        createUser: '',
        createTime: '',
        updateUser: '',
        updateTime: '',
        remarks: ''
      },
      ques_form:{
        title: '',
        category: '',
      },
      dialogTitle: '',
      dialogVisible:false,
      showStatus: false,
      searchTitle: null,
      searchKeywords: null,
      searchCategory: null,
      searchAuthor: null,
      formRule: {
        title: [
          { required: true, message: '请输入文档标题！', trigger: 'blur' }
        ],
        synopsis: [
          { required: true, message: '请输入文档简介！', trigger: 'blur' }
        ],
        keywords: [
          { required: true, message: '请输入关键字！', trigger: 'blur' }
        ]
      },
      quesFormRule: {
        category: [
          { required: true, message: '请选择问题类型！', trigger: 'blur' }
        ],
        title: [
          { required: true, message: '请输入问题描述！', trigger: 'blur' }
        ],
      },
      urlBefore: '',
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
    },
    editor() {
      return this.$refs.myQuillEditor.quill;
    },
  },
  mounted() {
    this.getUserInfo()
    setTimeout(()=>{
      this.getKnowledgePage()
    },200)
  },
  created() {
  },
  methods: {
    // 跳转新页面
    openDetails (row) {
      console.log(row)
      if (row.keywords==null&&row.synopsis==null){
        this.$router.push({
          path: '/questionDetails',
          query: {
            id: row.id
          }
        })
      }else {
        this.$router.push({
          path: '/knowledgeDetails',
          query: {
            id: row.id
          }
        })
      }
      this.temp = {
        id:row.id,
        reviewCount:row.reviewCount+1
      }
      this.updateKnowledge()
    },
    getKnowledgePage() {
      this.loading = true
      knowledgePage({
        title: this.searchTitle,
        keywords: this.searchKeywords,
        category: this.searchCategory,
        createUser: this.searchAuthor,
        pageNo: this.current,
        pageSize: this.size
      }).then(res => {
        if (res.code === '0') {
          this.loading = false
          this.list = res.data.list
          this.current = res.data.current
          this.size = res.data.size
          this.total = res.data.total
          this.getPermission()
        }
      }).catch(e => {
        console.log(e)
      })
    },
    getPermission(){
      this.tempList = []
      for (let i=0; i<this.list.length; i++){
        // 列表的创建人不包含当前用户（当前用户没有发布文章或问题），那么只能看到状态为显示的
        if (this.list[i].createUser != this.userInfo.nickName){
          if (this.list[i].status ==1){
            this.tempList.push(this.list[i])
          }else {
          }
        }else {
          this.tempList.push(this.list[i])
        }
      }
    },
    // 获取当前用户信息
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
          this.showStatus = true
          console.log('是否是管理员角色：'+this.isAdminRole)
          return
        }
      })
    },
    updateKnowledge(){
      updateCount(this.temp).then(res => {
        if (res.code === '0'){}
      }).catch(e => {
        console.log(e)
      })
    },
    askQuestion(){
      this.form = {
        title: null,
        category: 1,
        status: 1,
        updateUser: this.userInfo.nickName,
        createUser: this.userInfo.nickName,
        content: null,
      }
      this.questionDialog= true
    },
    quesCancel(){
      this.questionDialog = false
    },
    quesDetermine(){
      knowledgeSave(this.form).then(res =>{
        if (res.code == '0'){
          this.$message({
            type: 'success',
            message: '提交成功！'
          })
          this.questionDialog = false
          this.getKnowledgePage()
        }else {
          this.$message({
            type: 'warning',
            message: '提交失败！'
          })
          this.questionDialog = false
          this.getKnowledgePage()
        }
      })
    },
    // 条件搜索
    handleSearch() {
      const data = {
        title: this.searchTitle,
        category: this.searchCategory,
        createUser: this.searchAuthor,
        keywords: this.searchKeywords
      }
      this.loading = true
      knowledgePage(data).then(res => {
        if (res.code === '0') {
          this.list = res.data.list
          this.current = res.data.current
          this.size = res.data.size
          this.total = res.data.total
          this.getPermission()
          this.loading = false
        }
      })
    },
    // 重置搜索
    handSearchEmpty() {
      this.searchTitle = ''
      this.searchKeywords = ''
      this.searchCategory = ''
      this.searchAuthor = ''
      this.multipleSelection.length = 0
      this.getKnowledgePage()
    },
    // 每页条数发生变化
    handleSizeChange(val) {
      console.log(val)
      this.size = val
      this.getKnowledgePage()
    },
    // 页码发生变化
    handleCurrentChange(val) {
      console.log(val)
      this.current = val
      this.getKnowledgePage()
    },
    //内容改变事件
    onEditorChange(){
      console.log(this.content)
      $('.text').html(this.content)
    },
    // 文件列表移除文件时的钩子
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    // 分割照片路径
    yieldSplit(file){
      let result = [];
      if (file != null && file != ''){
        result = file.split(";")
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
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')+1)
      const isSize = file.size/1024/1024<10
      if (fileExtension == 'exe' || fileExtension == 'sh'){
        this.$message({
          type: 'warning',
          message: '不能上传.exe或.sh等格式的文件',
        })
        return
      }
      if (!isSize){
        this.$message({
          type: 'warning',
          message: '上传附件大小不能超过10MB',
        })
        return
      }
      this.fd = new FormData()
      this.fd.append('file', file)
      fileUpload(this.fd).then(res => {
        if (res.code === '0') {
          this.$message({
            type: 'success',
            message: '附件上传成功！'
          })
          this.fileList.push({name: decodeURI(file.name),url:decodeURI(res.data)})
        }
      })
    },
    // 新增知识页
    handleKnowledge() {
      this.$router.push({
        path: '/addKnowledge',
        query: {
        }
      })
    },
    // 取消 新增、编辑弹框
    handleCancel(type) {
      this.$refs['form'].resetFields()
      this.form = {
        title: null,
        synopsis: null,
        keywords: null,
        category: null,
        status: null,
        content: null,
        attach: null,
        remarks: null
      }
      this.dialogVisible = false
      this.$refs.upload.clearFiles()
    },
    // 在焦点事件时处理，设置富文本编辑器不可编辑
    focus(event){
      event.enable(false)
    },
    // 确定
    handleDetermine() {
      // this.$refs.upload.clearFiles()
      this.form.attach = '';
      let allFile = '';
      this.fileList.forEach(res =>{
        if (res.url.length >0){
          allFile = allFile + res.url+';'
        }
        this.form.attach = allFile
      })
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.dialogType === 'edit') {
            const data = {
              id: this.form.id,
              title: this.form.title,
              synopsis: this.form.synopsis,
              category: this.form.category,
              keywords: this.form.keywords,
              status: this.form.status,
              content: this.content_editor,
              attach: this.form.attach,
              updateUser: this.userInfo.nickName,
              remarks: this.form.remarks
            }
            knowledgeUpdate(data).then(res => {
              if (res.code === '0') {
                this.$message({
                  type: 'success',
                  message: '修改成功！',
                })
                this.getKnowledgePage()
                this.dialogVisible = false
              } else {
                this.$message({
                  type: 'warming',
                  message: '修改失败！',
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
      console.log(row)
      // 问题类
      if(row.synopsis == null && row.keywords == null){
        // alert("这是一条问题数据，不可编辑！")
        this.$message('此问题不可编辑！')

      }else if (row.synopsis != null && row.keywords != null){
        // 文章类
        this.fileList = []
        let tempFile = []
        let _name = ''
        this.dialogType = 'edit'
        this.dialogTitle = '编辑知识'
        this.content_editor=row.content
        this.form = {
          id: row.id,
          title: row.title,
          synopsis: row.synopsis,
          keywords: row.keywords,
          category: row.category,
          status: row.status,
          attach: row.attach,
          remarks: row.remarks
        }
        tempFile = this.yieldSplit(row.attach)
        tempFile.forEach(res =>{
          if (res.length >0){
            _name = this.getFileName(res)
            let fileJson ={
              name: decodeURI(_name),
              url: res,
            }
            this.fileList.push(fileJson)
          }
        })
        this.dialogVisible = true
      }
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
        const pool = []
        if (row == null) {
          this.multipleSelection.forEach(item => {
            if (item.createUser == this.userInfo.loginName){
              ids.push(item.id)
            }else {
              pool.push(item.id)
            }
          })
          if (pool.length ==0||pool ==[]){
            knowledgeDelete({ ids: ids }).then(res => {
              console.log(res)
              if (res.code === '0') {
                this.$message({
                  type: 'success',
                  message: '删除成功！'
                })
                this.getKnowledgePage()
              }
            }).catch(() => {
              this.$message({
                type: 'info',
                message: '删除失败！'
              })
            })
          }else {
            this.$message({
              type: 'warning',
              message: '无法对别人的文章或问题进行删除！'
            })
          }
        } else {
          ids.push(row.id)
          knowledgeDelete({ ids: ids }).then(res => {
            console.log(res)
            if (res.code === '0') {
              this.$message({
                type: 'success',
                message: '删除成功！'
              })
              this.getKnowledgePage()
            }
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '删除失败！'
            })
          })
        }
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
    cursor: pointer;
  }
  .table_row /deep/ .el-table .el-table__header-wrapper th{
    /* background: #1f2d3d ; */
    background: #304156;
    color: #c8d1db;
  }
  .knowledgeBox .page{
    margin-top: 10px;
  }
  .btn_editor {
    margin-top: 10px;
    margin-left: 450px;
  }
   /*隐藏内容显示样式*/
  .el-tooltip__popper {
    font-size: 14px;
    max-width:60%
  }
  .editor_content {
    margin-top: 10px;
    margin-bottom: 80px;
  }
  .synopsis_item {
    width: 750px;
  }
  .quill-editor {
    height: 200px;
  }
  .attach_edit {
    height: 10px;
    margin-bottom: 40px;
  }
  .item_attach {
    margin-right: 100px;
  }
  .attach_download {
    /*color: #0e47f1;*/
    font-size: 15px;
    font-style:italic;
    margin-right: 10px;
  }
  .dialog-footer {
    margin-right: 80px;
  }
  .attachBox{
    padding-top: 40px;
  }
</style>
