<template>
  <div class="knowledgeBox">
    <div class="knowledgeBody">
      <el-card class="el-card-define">
        <el-form ref="form" :model="form" :rules="formRule"  label-width="100px">
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
                <el-input v-model="form.keywords" placeholder="请输入关键字 (多个关键字间必须用逗号分割！)"/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="20">
              <el-form-item label="简 介：" size="small" prop="synopsis">
                <el-input v-model="form.synopsis" type="textarea" :rows="3" placeholder="请输入知识简介" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="10">
              <el-form-item label="知识类别：" size="small" prop="category">
                <el-select v-model="form.category" placeholder="请选择知识类别">
                  <el-option label="网络硬件类" :value="0" />
                  <el-option label="软件类" :value="1" />
                  <el-option label="其他" :value="2" />
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
                <quill-editor
                  v-model="form.content"
                  ref="myQuillEditor"
                  :options="editorOption"
                  @change="onEditorChange($event)">
                </quill-editor>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="20">
              <el-form-item class="attachBox" label="知识附件：" label-width="100px">
                <el-upload
                  class="upload_box"
                  multiple
                  drag
                  action=""
                  :before-upload="handleBeforeUpload"
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
        <label class="btn_label">
          <span slot="footer" class="dialog-footer">
            <el-button class="btn_back" type="success" size="small" @click="goBack">返 回</el-button>
            <el-button class="btn_cancel" type="danger" size="small" @click="handleCancel">取 消</el-button>
            <el-button class="btn_ok" type="success" size="small" @click="handleDetermine">确 定</el-button>
          </span>
        </label>
      </el-card>
    </div>
  </div>
</template>

<script>
  import { fileUpload, knowledgeSave } from '@/api/knowledge'
  import { getInfo } from '@/api/user'

  export default {
    data() {
      return{
        fd: '',
        fileList: [],
        content: null,
        editorOption: {},
        userInfo: [],
        form:{
          title: '',
          synopsis: '',
          keywords: '',
          category: 1,
          status: 1,
          content: '',
          attach: '',
          remarks: '',
          createUser: ''
        },
        formRule: {
          title: [
            { required: true, message: '请输入文档标题！', trigger: 'blur' }
          ],
          synopsis: [
            { required: true, message: '请输入文档简介！', trigger: 'blur' }
          ],
          keywords: [
            { required: true, message: '请输入关键字！', trigger: 'blur' }
          ],
          category: [
            { required: true, message: '请选择知识类别！', trigger: 'blur' }
          ],
          status: [
            { required: true, message: '请选择状态！', trigger: 'blur' }
          ],
          content: [
            { required: true, message: '请输入文本内容！', trigger: 'blur' }
          ]
        },
      }
    },
    computed: {
      editor() {
        return this.$refs.myQuillEditor.quill;
      },
    },
    created() {
      this.getUserInfo()
    },
    methods:{
      getUserInfo(){
        getInfo().then(res =>{
          if(res.code==='0'){
            this.userInfo = res.data
          }
        }).catch( e =>{
          console.log(e)
        })
      },
      // 文件列表移除文件时的钩子
      handleRemove(file, fileList) {
        this.fileList = fileList
      },
      // 文件上传前处理
      handleBeforeUpload(file){
        console.log('上传文件：'+file)
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')+1)
        const isSize = file.size/1024/1024<10
        if (fileExtension == 'exe' || fileExtension == 'sh' ){
          this.$message({
            type: 'warning',
            message: '不能上传.exe或.sh等格式的附件',
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
            this.fileList.push({name: decodeURI(file.name), url:decodeURI(res.data)})

          }
        })
      },
      handleCancel(){
        this.form.title = '';
        this.form.synopsis = '';
        this.form.keywords = '';
        this.form.category = null;
        this.form.status = 1;
        this.form.content = '';
        this.form.attach = '';
      },
      goBack(){
        this.$router.go(-1)
      },
      //内容改变事件
      onEditorChange(){
        console.log(this.content)
        $('.text').html(this.content)
      },
      // 确定
      handleDetermine() {
        console.log(this.form)
        this.form.createUser = this.userInfo.nickName
        this.form.updateUser = this.userInfo.nickName
        this.form.attach = '';
        let laterFile = '';
        this.fileList.forEach(res =>{
          if (res.url.length >0){
            laterFile = laterFile + res.url+';'
          }
          this.form.attach = laterFile
        })
        this.$refs['form'].validate((valid) =>{
          if (valid){
            knowledgeSave(this.form).then(res => {
              if (res.code === '0') {
                this.$message({
                  type: 'success',
                  message: '新增成功！'
                })
                this.goBack()
              } else {
                this.$message({
                  type: 'warming',
                  message: '新增失败！'
                })
              }
            })
          }
        })
      },
    }
  }
</script>

<style scoped>
  .el-card-define {
    min-height: 100%;
    height: 100%;
  }
  .btn_cancel {
    margin-left: 30px;
    margin-top: 20px;
    margin-bottom: 20px;
  }
  .btn_ok {
    margin-left: 30px;
  }
  .btn_back {
    margin-left: 400px;
  }
  .btn_editor {
    margin-top: 10px;
    /*margin-left: 600px;*/
  }
  .quill-editor{
    height:300px;
    margin-bottom: 50px;
  }
  .attachBox{
    padding-top: 40px;
  }
</style>
