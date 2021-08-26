<template>
  <div class="top">
    <el-card class="card_all">
      <div class="btn_back">
        <el-button class="btn_back" type="primary" size="mini" icon="el-icon-arrow-left" @click="goBack">返 回</el-button>
      </div>
      <div class="title_header">
        <h1><span>{{detailsInfo.title}}</span></h1>
      </div>
      <el-card>
        <div class="info_header">
          <el-form>
            <el-row>
              <el-col :span="4">
                <el-form-item>
                  <label class="info_label">作 者：</label>
                  <span>{{detailsInfo.createUser}}</span>
                </el-form-item>
              </el-col>
              <el-col :span="3">
                <el-form-item>
                  <label class="info_label"><i class="el-icon-view el-icon--left"></i>浏览量：</label>
                  <span>{{detailsInfo.reviewCount}}</span>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item>
                  <template>
                    <label class="info_label">类 别：</label>
                    {{ detailsInfo.category|getCategory }}
                  </template>
                </el-form-item>
              </el-col>
              <el-col :span="7">
                <el-form-item>
                  <label class="info_label">更新时间：</label>
                  <span>{{detailsInfo.updateTime}}</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item>
                  <template>
                    <label class="info_label">关键字：</label>
                    <div class="keywords_item" v-for="item in yieldSplit(detailsInfo.keywords)">
                      <el-tag type="danger" size="small"><span>{{item}}</span></el-tag>
                    </div>
                  </template>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item>
                  <label class="info_label">附 件：</label><br>
                  <div v-for="item in pathSplit(detailsInfo.attach)">
                    <span v-if="item !=null && item.length >0" v-for="name in getFileName(item)">
                      <a :href="item" target="_blank" download=""><span>{{name}}</span></a>
                    </span>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </el-card>
      <el-divider class="divider"></el-divider>
      <div>
        <el-card class="synopsis_body">
          <el-form>
            <label class="synopsis_label">简介</label>
            <el-form-item>
              <span>{{detailsInfo.synopsis}}</span>
            </el-form-item>
          </el-form>
        </el-card>
        <el-card class="content_body">
          <el-form>
            <el-form-item>
              <label class="synopsis_label">正文</label>
              <div class="body_content" v-html="detailsInfo.content">
              </div>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
      <el-divider class="divider" content-position="right">页尾</el-divider>
      <el-card class="card_bottom">
        <el-row>
          <el-col :span="1">
            <div class="imgBox">
              <img class="avatar" :src="imgUrl">
            </div>
          </el-col>
          <el-col :span="16">
            <div>
              <el-input v-model="addition_content" size="small" type="textarea" :rows="5" maxlength="300" show-word-limit placeholder="请发布您的评论(不超过300字哦！)"></el-input>
              <!--表情包-->
              <div class="emotionBox">
                <emotion v-if="openEmotion == true" @emotion="handleEmotion" :height="200" :width="100"></emotion>
                <emotion v-else v-show="false" @emotion="handleEmotion" :height="200" :width="100"></emotion>
              </div>
              <div class="btn_send">
                <el-button v-if="openEmotion == false" type="info" size="mini" @click="onEmotion">插入表情</el-button>
                <el-button v-else type="info" size="mini" @click="onEmotion">收起表情</el-button>
                <el-button size="mini" type="success" @click="sendAnswer(detailsInfo)">发 布</el-button>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-divider></el-divider>
        <div class="label_answer"><label>文章评论：</label></div>
        <el-card>
          <el-form>
            <el-form-item>
              <div class="answer_display" v-for="item in this.review_list">
                <div><span v-html="item.replace(/\#[\u4E00-\u9FA5]{1,3}\;/gi, emotion)"></span></div>
                <divider class="answer_divider"></divider>
              </div>
            </el-form-item>
          </el-form>
        </el-card>
      </el-card>
    </el-card>
    <el-backtop target=".top"><i class="el-icon-caret-top"></i></el-backtop>
  </div>
</template>

<script>
  import { knowledgeDetails, knowledgeUpdate } from '@/api/knowledge'
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
          review_list:[],
          detailsInfo: [],
          isShow: false,
          openEmotion: false,
          addition_content: '',
          before_content: '',
          imgUrl: '',
          userInfo: [],
          temp:{
            id: '',
            reviewCount: 0
          },
          form: {
            id: '',
            title: '',
            status: 1,
            updateUser: '',
            remarks: '',
          },
          commentArray:[],
          commentJson: {
            _name: '',
            _comment: '',
            _commentTime: '',
          },
        }
      },
      created() {
        this.getUserInfo()
      },
      mounted() {
        this.knowledgeId = this.$route.query.id
        this.getKnowledgeInfo(this.knowledgeId)
      },
      methods: {
        getKnowledgeInfo(id){
          let tip = '暂无评论'
          knowledgeDetails(id).then(res => {
            this.detailsInfo = res.data
            if (this.detailsInfo.remarks != null && this.detailsInfo.remarks != ''){
              this.getComment(this.detailsInfo.remarks)
            }else {
              this.review_list.push(tip)
              console.log(this.review_list)
            }
          }).catch(e =>{
            console.log(e)
          })
        },
        getUserInfo(){
          getInfo().then(res =>{
            if(res.code ==='0'){
              this.userInfo = res.data
              this.imgUrl = this.userInfo.photo
            }
          }).catch( e =>{
            console.log(e)
          })
        },
        goBack(){
          this.$router.go(-1)
        },
        yieldSplit(name){
          let result = name.split("，")
          return result
        },
        sendAnswer(row){
          if (this.addition_content != null&&this.addition_content !=''){
            this.form.id = row.id
            this.form.title = row.title
            this.form.updateUser = this.userInfo.nickName
            this.commentJson._name = this.userInfo.nickName
            this.commentJson._comment = this.addition_content
            this.commentJson._commentTime = this.getNowFormatDate()
            if (this.detailsInfo.remarks !=null && this.detailsInfo.remarks !=''){
              this.commentArray = JSON.parse(row.remarks)
              this.commentArray.push(this.commentJson)
              this.form.remarks = JSON.stringify(this.commentArray)
            }else {
              this.commentArray.push(this.commentJson)
              this.form.remarks = JSON.stringify(this.commentArray)
            }
            knowledgeUpdate(this.form).then(res =>{
              if (res.code == '0'){
                this.$message({
                  type: 'success',
                  message: '发布成功！'
                })
                // window.location.reload()
                this.addition_content = ''
                this.getKnowledgeInfo(this.form.id)
              }else {
                this.$message({
                  type: 'warning',
                  message: '发布失败！'
                })
              }
            })
          }else {
            this.$message({
              type: 'warning',
              message: '评论内容不能为空！'
            })
          }
        },
        getComment(review){
          this.review_list = []
          let array = JSON.parse(review)
          for (let i=0;i<array.length;i++){
            this.review_list.push('【'+array[i]._commentTime+'】 '+array[i]._name+' ：'+array[i]._comment)
          }
        },
        // 获取附件名称
        getFileName(fullName){
          let result;
          result = fullName.substring(fullName.lastIndexOf("/")+1);
          return decodeURI(result);
        },
        pathSplit(file){
          let result = [];
          if (file != null && file != ''){
            result = file.split(";")
          }
          console.log(result)
          return result
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
      }
    }
</script>

<style scoped>
  .title_header {
    margin-bottom: 10px;
  }
  .info_header {
    margin-top: 20px;
    font-size: 5px;
  }
  .divider {
    color: #85878d;
    height: 2px;
  }
  .info_label {
    font-size: 5px;
    float: left;
  }
  .info_header .el-form-item {
    margin-bottom: 2px;
    margin-top: 0px;
  }
  .synopsis_label {
    font-size: 20px;
    font-style: italic;
  }
  .keywords_item {
    float: left;
    margin-right: 15px;
  }
  .card_bottom{
    height: auto;
  }
  .btn_send {
    margin-top: 10px;
    float: right;
  }
  .card_answer {
    height: 100px;
  }
  .content_body {
    height: auto;
  }
  .synopsis_body {
    height: auto;
  }
  .card_all{
    height: auto;
  }
  .btn_back {
    margin-bottom: 10px;
  }
  .label_answer {
    margin-bottom: 10px;
    font-style: italic;
    font-size: 16px;
    color: #d28686;
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
