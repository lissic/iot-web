<template>
  <div class="top_box">
    <el-card>
      <div class="btn_back">
        <el-button class="btn_back" type="primary" size="mini" icon="el-icon-arrow-left" @click="goBack">返 回</el-button>
      </div>
      <div class="title_header">
        <h1><span>{{questionInfo.title}}</span></h1>
      </div>
      <el-card>
        <div class="info_header">
          <el-form>
            <el-row>
              <el-col :span="4">
                <el-form-item>
                  <label class="info_label">提问者：</label>
                  <span>{{questionInfo.createUser}}</span>
                </el-form-item>
              </el-col>
              <el-col :span="3">
                <el-form-item>
                  <label class="info_label"><i class="el-icon-view el-icon--left"></i>浏览量：</label>
                  <span>{{questionInfo.reviewCount}}</span>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item>
                  <template>
                    <label class="info_label">类别：</label>
                    {{ questionInfo.category|getCategory }}
                  </template>
                </el-form-item>
              </el-col>
              <el-col :span="7">
                <el-form-item>
                  <label class="info_label">问题创建时间：</label>
                  <span>{{questionInfo.createTime}}</span>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item>
                  <label class="info_label">答案更新时间：</label>
                  <span>{{questionInfo.updateTime}}</span>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </el-card>
      <el-divider></el-divider>
      <div>
        <div class="label_answer"><label>回复答案：</label></div>
        <el-card>
          <el-form>
            <el-form-item>
              <div class="answer_display" v-for="item in this.json_list">
                <el-card class="card_answer">
                  <div><span v-html="item.replace(/\#[\u4E00-\u9FA5]{1,3}\;/gi, emotion)"></span></div>
                </el-card>
                <divider class="answer_divider"></divider>
              </div>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
      <el-divider></el-divider>
      <el-card class="card_bottom">
        <el-row>
          <el-col :span="1">
            <div class="imgBox">
              <img class="avatar" :src="imgUrl">
            </div>
          </el-col>
          <el-col :span="16">
            <div>
              <el-input v-model="addition_content" size="small" type="textarea" :rows="8" maxlength="500" show-word-limit placeholder="请发布您的优质答案(不超过500字哦！)" clearable></el-input>
              <!--表情包-->
              <div class="emotionBox">
                <emotion v-if="openEmotion == true" @emotion="handleEmotion" :height="200" :width="100"></emotion>
                <emotion v-else v-show="false" @emotion="handleEmotion" :height="200" :width="100"></emotion>
              </div>
              <div class="btn_send">
                <el-button v-if="openEmotion == false" type="info" size="mini" @click="onEmotion">插入表情</el-button>
                <el-button v-else type="info" size="mini" @click="onEmotion">收起表情</el-button>
                <el-button size="mini" type="success" @click="sendAnswer(questionInfo)">发 布</el-button>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-divider></el-divider>
      </el-card>
    </el-card>
  </div>
</template>

<script>
  import { knowledgeDetails, knowledgeSave, knowledgeUpdate } from '@/api/knowledge'
  import { getInfo } from '@/api/user'
  import Emotion from '@/components/Emotion/emIndex'
  export default {
    components: {
      Emotion
    },
    filters: {
      getCategory(key) {
        const categoryMap = new Map([
          [0, '网络硬件类'],
          [1, '软件类'],
          [2, '工程类'],
          [3, '其他类']
        ])
        return categoryMap.get(key)
      }
    },
    data() {
      return{
        json_list:[],
        questionInfo: [],
        addition_content: '',
        before_content: '',
        commentArray:[],
        commentJson: {
          _name: '',
          _comment: '',
          _commentTime: '',
        },
        openEmotion: false,
        review: null,
        isShow: false,
        userInfo: [],
        form: {
          id: null,
          title: null,
          category: null,
          status: 1,
          content: '',
          updateUser: null,
        },
        imgUrl: '',
      }
    },
    created() {
      this.getKnowledgeInfo(this.$route.query.id)
      this.getUserInfo()
    },
    methods:{
      getKnowledgeInfo(id){
        this.questionInfo = ''
        let tip = '暂无回答'
        knowledgeDetails(id).then(res => {
          this.questionInfo = res.data
          if (this.questionInfo.content != null && this.questionInfo.content != '' ){
            this.getComment(this.questionInfo.content)
          }else {
            this.json_list.push(tip)
          }
        }).catch(e =>{
          console.log(e)
        })
      },
      getUserInfo(){
        getInfo().then(res =>{
          if(res.code==='0'){
            this.userInfo = res.data
            this.imgUrl = this.userInfo.photo
          }
        }).catch( e =>{
          console.log(e)
        })
      },
      handleCancel(){
        this.dialogVisible = false
      },
      getComment(content){
        this.json_list = []
        let array = JSON.parse(content)
        for (let i=0;i<array.length;i++){
          this.json_list.push('【'+array[i]._commentTime+'】 '+array[i]._name+' ：'+array[i]._comment)
        }
      },
      goBack(){
        this.$router.go(-1)
      },
      onEmotion(){
        if (this.openEmotion == false){
          this.openEmotion = true
        }else {
          this.openEmotion = false
        }
      },
      handleEmotion (i) {
        this.addition_content += i
      },
      // 将匹配结果替换表情图片
      emotion (res) {
        let word = res.replace(/\#|\;/gi,'')
        const list = ['微笑', '撇嘴', '色', '发呆', '得意', '流泪', '害羞', '闭嘴', '睡', '大哭', '尴尬', '发怒', '调皮', '呲牙', '惊讶', '难过', '酷', '冷汗', '抓狂', '吐', '偷笑', '可爱', '白眼', '傲慢', '饥饿', '困', '惊恐', '流汗', '憨笑', '大兵', '奋斗', '咒骂', '疑问', '嘘', '晕', '折磨', '衰', '骷髅', '敲打', '再见', '擦汗', '抠鼻', '鼓掌', '糗大了', '坏笑', '左哼哼', '右哼哼', '哈欠', '鄙视', '委屈', '快哭了', '阴险', '亲亲', '吓', '可怜', '菜刀', '西瓜', '啤酒', '篮球', '乒乓', '咖啡', '饭', '猪头', '玫瑰', '凋谢', '示爱', '爱心', '心碎', '蛋糕', '闪电', '炸弹', '刀', '足球', '瓢虫', '便便', '月亮', '太阳', '礼物', '拥抱', '强', '弱', '握手', '胜利', '抱拳', '勾引', '拳头', '差劲', '爱你', 'NO', 'OK', '爱情', '飞吻', '跳跳', '发抖', '怄火', '转圈', '磕头', '回头', '跳绳', '挥手', '激动', '街舞', '献吻', '左太极', '右太极']
        let index = list.indexOf(word)
        return `<img src="https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/${index}.gif" align="middle">`
      },
      // 获取日期时间
      getNowFormatDate() {
        const date = new Date()
        const seperator1 = '-'
        const seperator2 = ':'
        let month = date.getMonth() + 1
        let strDate = date.getDate()
        let hours = date.getHours()
        let minutes = date.getMinutes()
        let seconds = date.getSeconds()
        if   (month >= 1 && month <= 9) {
          month =  "0"   + month;
        }
        if   (strDate >= 0 && strDate <= 9) {
          strDate =  "0"   + strDate;
        }
        if (hours >= 0 && hours <= 9){
          hours = "0" + hours;
        }
        if (minutes >= 0 && minutes <= 9){
          minutes = "0" + minutes;
        }
        if (seconds >= 0 && seconds <= 9){
          seconds = "0" + seconds;
        }
        const currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
          + ' ' +hours + seperator2 + minutes
          + seperator2 + seconds
        return   currentdate;
      },
      sendAnswer(row){
        if (this.addition_content != null&&this.addition_content != ''){
          this.form.id = row.id
          this.form.title = row.title
          this.form.updateUser = this.userInfo.nickName
          this.before_content = row.content
          this.commentJson._name = this.userInfo.nickName
          this.commentJson._comment = this.addition_content
          this.commentJson._commentTime = this.getNowFormatDate()
          if (this.questionInfo.content !=null && this.questionInfo.content !=''){
            this.commentArray = JSON.parse(row.content)
            this.commentArray.push(this.commentJson)
            this.form.content = JSON.stringify(this.commentArray)
          }else {
            this.commentArray.push(this.commentJson)
            this.form.content = JSON.stringify(this.commentArray)
          }
          knowledgeUpdate(this.form).then(res =>{
            if (res.code == '0'){
              this.$message({
                type: 'success',
                message: '发布成功！'
              })

              this.addition_content = ''
              this.getKnowledgeInfo(this.form.id)
            }else {
              this.$Message({
                type: 'warning',
                message: '发布失败！'
              })
            }
            this.before_content = ''
          })
        }else {
          this.$message({
            type: 'warning',
            message: '答案内容不能为空！'
          })
        }
      }
    }
  }
</script>

<style scoped>
  .title_header{
    margin-bottom: 10px;
  }
  .info_label:hover .btn_hover{
    display: inline-block;
  }
  .btn_send {
    margin-top: 10px;
    float: right;
  }
  .info_header {
    height: 40px;
  }
  .info_label {
    font-size: 5px;
    float: left;
  }
  .label_answer {
    margin-bottom: 10px;
    font-style: italic;
    font-size: 16px;
    color: #d28686;
  }
  .card_answer {
    margin-bottom: 00px;
    border-bottom: #F56C6C;
  }
  .answer_divider {
    margin-top: 10px;
    height: 2px;
  }
  .btn_back {
    margin-bottom: 10px;
  }
  .avatar{
    width: 50px;
    height: 50px;
    border-radius: 50%;
    overflow: hidden;
  }
  .emotionBox{
    float: left;
    width: 400px;
    height: 200px;
  }
</style>
