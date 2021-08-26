<template>
  <div class="areaBox">
    <el-row class="top">
      <el-col :span="24" class="search_col">
        <span>所属区域：</span>
        <el-input v-model="searchArea" @keyup.enter.native="handleSearch" @clear='searchArea=null' placeholder="请输入区域名称"  clearable />

        <span>站点名称：</span>
        <el-input v-model="searchName" @keyup.enter.native="handleSearch" @clear='searchName=null' placeholder="请输入站点名称" clearable />

        <el-button size="small" type="primary" icon="el-icon-search" @click=" handleSearch ">搜索</el-button>
        <el-button size="small" type="primary" icon="el-icon-refresh" @click=" handleRefresh ">重置</el-button>
        <el-button v-if="isAdminRole == true" size="small" type="success" icon="el-icon-circle-plus-outline" @click="addArea">新增</el-button>
        <el-button v-if="isAdminRole == true" size="small" type="danger"  icon="el-icon-delete" :disabled="deletDis" @click="handleDelArea" v-show="true">删除</el-button>
      </el-col>
    </el-row>

    <el-row class="table_row">
      <el-table
        class="tableBox"
        v-loading="loading"
        :data="tableData"
        row-key="id"
        stripe
        border
        @selection-change="handleSelectionChange"
        :tree-props="{children: 'childNode', hasChildren: 'children'}">
        <el-table-column
          type="selection"
          width="50"
        />
        <el-table-column
          show-overflow-tooltip
          width="250"
          prop="name"
          label="站点名称"
          >
        </el-table-column>
        <el-table-column
          width="250"
          prop="area"
          label="所属区域">
        </el-table-column>
        <el-table-column
          prop="longitude"
          width="150"
          label="经 度"
        >
        </el-table-column>
        <el-table-column
          prop="latitude"
          width="150"
          label="纬 度"
        >
        </el-table-column>
         <el-table-column
           width="200"
          prop="updateTime"
          label="更新时间">
        </el-table-column>
        <el-table-column
          width="200"
          prop="createTime"
          label="创建时间">
        </el-table-column>
        <el-table-column
          prop="remarks"
          show-overflow-tooltip
          effect="light"
          label="备注信息">
        </el-table-column>
        <el-table-column
          v-if="showOperation"
          label="操 作"
          width="150">
          <template  slot-scope="scope">
            <el-button v-if="isAdminRole == true" type="primary" icon="el-icon-edit" size='mini' @click="modify(scope.row)"> 修改</el-button>
            <el-button v-if="isAdminRole == true" type="danger"  icon="el-icon-delete" size="mini" @click="deleteArea(scope.row)"> 删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-row>

    <el-dialog
      class="map_dialog"
      :show-close="false"
      :visible.sync="dialogMap"
      width="50%"
    >
      <my-map @postLnglat='getLocation'></my-map>
      <span slot="footer" class="dialog_footer">
        <el-button @click="handleCancel_map">取 消</el-button>
        <el-button type="primary" @click="handleDetermine_map">确 定</el-button>
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
      <el-form ref="form" :rules="formRule" :model="form" label-width="120px" label-position="right">
        <el-row :gutter="24">
          <el-col :span="20">
            <el-form-item label="所属区域:" >
              <!--省市区三级联动-->
              <div class="divwrap">
                <v-distpicker
                  :province="this.province"
                  :city="this.city"
                  :area="this.area"
                  @province="onChangeProvince1"
                  @city="onChangeCity"
                  @area="onChangeArea"></v-distpicker>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="20">
            <el-form-item label="站点名称: " prop="name">
              <el-input v-model="form.name" placeholder="请输入站点名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="经度：" prop="longitude" >
              <el-input :value="form.longitude" @focus="chooseAddr" placeholder="请输入经度"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="纬度：" prop="latitude" >
              <el-input :value="form.latitude" @focus="chooseAddr" placeholder="请输入纬度"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="20">
            <el-form-item label="备注: ">
              <el-input type="textarea" :rows="4" v-model="form.remarks" maxlength="100" show-word-limit placeholder="备注" />
              <div>
                提示：最多可输入100个字符！
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
  </div>
</template>
<script>
 // 区域类型： 1-国家，2-省份，3-直辖市，4-地市，5-县区 6-站点
import {areaPage,areaAdd,areaModify,areaDelete,areaList } from '@/api/sys'
 import { v_distpicker } from 'v-distpicker'
 import myMap from '@/components/map'
 import { getInfo } from '@/api/user'
export default {
  components: {v_distpicker},
  name:'area',
  data () {
    //邮编验证规则
    let checkCode = (rule, value, callback) =>{
      const codeReg = /^[1-9][0-9]{5}$/
      if(codeReg.test(value)){
        return callback()
      }
      //错误回调
      callback(new Error('请输入合法邮编！'))
    }

    return {
      searchName:null,
      searchArea:null,
      tableData:[],
      current:1,
      size:10,
      total:0,
      showOperation:false,
      isAdminRole: false,
      dialogVisible:false,
      dialogTitle:'新增区域',
      form:{
        id:'',
        area:'',
        name:'',
        longitude: '',
        latitude: '',
        remarks:'',
      },
      edit_form:{
        id:'',
        area:'',
        name:'',
        longitude: '',
        latitude: '',
        remarks:'',
      },
      formRule: { // 表单验证规则
          name: [
              { required: true, message: '请输入站点名称！', trigger: 'blur' }
          ],
      },
      dialogType:'add',
      loading:false,
      multipleSelection:[] , // 表格多选
      dialogMap:false,
      userInfo: [],
      locationValue: '',
      locationData: {},
      //省市区
      province: '',
      city: '',
      area: '',
      region: '',
    }
  },
  components:{
    myMap
  },
  created(){
    this.getAreaList()
    this.getUserInfo()
  },
  computed: {
      deletDis() { // 禁用删除按钮
          if (this.multipleSelection.length > 0) {
              return false
          } else {
              return true
          }
      }
  },
  methods: {
    getAreaList(){
      this.loading = true
      areaPage({
        name:this.searchName,
        area:this.searchArea,
        pageNo: this.current,
        pageSize: this.size,
      }).then(res =>{
        if(res.code==='0'){
          this.loading = false
          this.tableData = res.data.list;
          this.current = res.data.current;
          this.size = res.data.size;
          this.total = res.data.total;
        }
      }).catch(e =>{
        console.log(e)
        this.loading = false
      })
    },
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
          this.showOperation = true
          console.log('是否是管理员角色：'+this.isAdminRole)
          return
        }
      })
    },
    onChangeProvince1(a){
      this.region = ''
      this.province = a.value;
      if (this.province =='省'){
        this.province = ''
      }else {
        this.region = this.province
      }
      console.log(this.region)
    },
    onChangeCity(a) {
      this.region = ''
      this.city = a.value;
      if (this.province != ''){
        if (this.province == this.city){
          this.region = this.province
        }else if (this.city != '市') {
          this.region = this.province+'-'+this.city
        }else {
          this.city = ''
        }
      }else {
        this.region = ''
      }
      console.log(this.region)
    },
    onChangeArea(a){
      this.area = a.value;
      console.log(this.region)
    },
    handleSizeChange(val){
      this.size = val;
      this.getAreaList()
    },
    handleCurrentChange(val){
      this.current = val;
      this.getAreaList()
    },
    //搜索
    handleSearch(){
      this.loading = true
      areaPage({
        area:this.searchArea,
        name:this.searchName,
      }).then(res =>{
        if(res.code==='0'){
          this.loading = false
          this.tableData = res.data.list;
        }
      }).catch(e =>{
        console.log(e)
      })
    },
    handleDelArea(){
      this.$confirm('确定要删除吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
      }).then(() => {
          const ids = []
          this.multipleSelection.forEach(item => {
              ids.push(item.id)
          })
          areaDelete({ids:ids}).then(res =>{
            if(res.code==='0'){
              this.$message({
                type:'success',
                message:'删除成功！'
              })
              this.getAreaList()
            }
          })
      }).catch(() => {
          this.$message({
              type: 'info',
              message: '已取消删除'
          })
      })
    },
    //取消
    handleCancel(){
      this.dialogVisible = false;
      this.form={
        name:null,
        area:null,
        longitude:null,
        latitude: null,
        remarks:null,
      }
      this.$refs['form'].resetFields()
    },
    //确定
    handleDetermine(){
      this.$refs['form'].validate( (valid) =>{
        if(valid){
          if( this.dialogType == 'add'){
            if (this.province != ''&&this.city != ''&&this.area != ''){
              this.form.area = this.province+'-'+this.city+'-'+this.area
              areaAdd(this.form).then(res => {
                if(res.code==='0'){
                  this.$message({
                    type:'success',
                    message: '新增成功！'
                  })
                  this.dialogVisible = false
                  this.form = {
                    name:'',
                    area: '',
                    longitude: '',
                    latitude: '',
                    remarks:'',
                  }
                  this.getAreaList()
                }
              })
            }else {
              this.$message({
                type: 'warning',
                message: '请将所属区域补充完整！'
              })
            }
          }
          if( this.dialogType == 'modify'){
            this.form.area =this.province+'-'+this.city+'-'+this.area
            const str_form = JSON.stringify(this.form)
            const str_edit = JSON.stringify(this.edit_form)
            console.log(str_form)
            console.log(str_edit)
            if (str_form == str_edit){
              return this.$message({
                type: 'warning',
                message: '内容未作修改！',
              })
            }
            areaModify(this.form).then(res =>{
              if(res.code==='0'){
                this.$message({
                  type:'success',
                  message: '修改成功！'
                })
                this.dialogVisible = false
                this.form = {
                  name:'',
                  area: '',
                  longitude: '',
                  latitude: '',
                  remarks:'',
                }
                this.getAreaList()
              }else {
                this.$message({
                  type:'warning',
                  message: '修改失败！'
                })
                this.dialogVisible = false
              }
            })
          }
        }
      })
    },
    // 新增区域
    addArea(){
      this.disEdit = true
      this.dialogType = 'add'
      this.dialogTitle = '新增站点'
      this.province = ''
      this.city = ''
      this.area = ''
      if (this.userInfo.area != null){
        if (this.userInfo.area.split('-').length==3){
          this.province = this.userInfo.area.split('-')[0]
          this.city = this.userInfo.area.split('-')[1]
          this.area = this.userInfo.area.split('-')[2]
        }
        if (this.userInfo.area.split('-').length==2){
          this.province = this.userInfo.area.split('-')[0]
          this.city = this.userInfo.area.split('-')[1]
        }
        if (this.userInfo.area.split('-').length==1){
          this.province = this.userInfo.area.split('-')[0]
        }
      }
      this.dialogVisible = true
    },
    //经纬度点击事件
    chooseAddr(){
      this.locationValue = ''
      this.locationData = {}
      this.dialogMap = true
    },
    // 点击地图获取值
    getLocation(data){
      console.log(data)
      this.locationData = data
    },
    //地图弹窗取消
    handleCancel_map(){
      this.dialogMap = false
    },
    //地图弹窗确定
    handleDetermine_map(){
      this.locationValue = this.locationData.lng+','+this.locationData.lat
      this.form.latitude = this.locationData.lat
      this.form.longitude = this.locationData.lng
      this.dialogMap = false
    },
    //修改
    modify(row){
      this.dialogType = 'modify'
      this.dialogTitle = '编辑'
      this.province = row.area.split('-')[0]
      this.city = row.area.split('-')[1]
      this.area = row.area.split('-')[2]
      this.region = this.province+'-'+this.city+'-'+this.area
      this.form={
        id: row.id,
        name:row.name,
        area: row.area,
        longitude: row.longitude,
        latitude: row.latitude,
        remarks:row.remarks
      }
      this.edit_form={
        id: row.id,
        name:row.name,
        area: this.region,
        longitude: row.longitude,
        latitude: row.latitude,
        remarks:row.remarks
      }
      this.dialogVisible = true
    },
    //删除
    deleteArea(row){
        this.$confirm('确定要删除吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const ids = []
          ids.push(row.id)
          areaDelete({ids:ids}).then(res =>{
            console.log(res)
            if(res.code==='0'){
              this.$message({
                type:'success',
                message:'删除成功！'
              })
              this.getAreaList()

            }
          })

        }).catch(() => {
            this.$message({
                type: 'info',
                message: '已取消删除'
            })
        })
    },
    // 表格多选
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
  //重置
    handleRefresh(){
      this.searchArea = null;
      this.searchName = null;
      this.getAreaList()
    },
  }
}
</script>
<style scoped>
  .areaBox /deep/ .el-dialog__wrapper .el-dialog__header{
    background: #304156;
  }
  .areaBox /deep/ .el-dialog__wrapper .el-dialog__header span{
    color: #f4f4f4;
    font-size: 16px;
  }
  .areaBox /deep/ .el-dialog{
    border-radius: 5px;
    overflow: hidden;
  }

  .areaBox{
    width: 100%;
    height: 100%;
    padding: 10px;
    background: #f0f2f5;
  }
  .areaBox .top{
        margin-bottom: 10px;
    }
  .table_row /deep/ .el-table .el-table__header-wrapper th,
  .table_row /deep/ .el-table .el-table__body-wrapper td {
      font-size: 12px ;
      padding: 6px 0px ;
      text-align: center;
  }
  .table_row /deep/ .el-table .el-table__header-wrapper th{
      background: #304156;
      color: #c8d1db;
  }
  .search_col .el-input,
  .search_col .el-select{
      width: 15%;
      margin-right: 20px;
  }
  .search_col span{
    font-size: 14px;
  }
  .search_col /deep/ .el-input__inner{
    height: 32px;
    line-height: 32px;
    font-size: 12px;
  }
  .search_col /deep/ .el-input__icon{
    line-height: 32px;
  }
  .tableBox{
    width: 100%;
    margin-bottom: 20px;
  }
  .tableBox .el-button{
    padding: 3px 2px;
    font-size: 12px;
  }
  .tableBox /deep/ .el-button span{
    margin-left: 0px;
    font-size: 12px;
  }
  .divwrap{
    height: 40px;
    overflow: auto;
    width: 100%;
    overflow-x: auto;
    position: fixed;
  }
  .divwrap>>>.distpicker-address-wrapper{
    color: #999;
  }
  .divwrap>>>.address-header{
    position: fixed;
    bottom: 400px;
    width: 100%;
    background: #000;
    color:#fff;
  }
  .divwrap>>>.address-header ul li{
    flex-grow: 1;
    text-align: center;
  }
  .divwrap>>>.address-header .active{
    color: #fff;
    border-bottom:#666 solid 8px
  }
  .divwrap>>>.address-container .active{
    color: #000;
  }

</style>

