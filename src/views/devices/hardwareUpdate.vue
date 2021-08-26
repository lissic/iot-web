<template>
  <div class="clearBox">
    <el-row class="top">
      <el-col :span="24" class="search_col">
        <span>固件名称：</span>
        <el-input
          v-model="softName"
          @keyup.enter.native="handleSearch"
          placeholder="请输入固件名称"
          clearable
        />
        <span>升级方式：</span>
        <el-select
          v-model="upgradeType"
          clearable
          @keyup.enter.native="handleSearch"
          placeholder="请选择推送方式"
        >
          <el-option label="主动推送" :value="0" />
          <el-option label="设备拉取" :value="1" />
        </el-select>
        <el-button size="small" type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button size="small" type="primary" icon="el-icon-refresh" @click="handleRefresh">重置</el-button>
        <el-button
          size="small"
          type="success"
          icon="el-icon-circle-plus-outline"
          @click="addSoft"
        >新增</el-button>
        <el-button
          size="small"
          type="danger"
          icon="el-icon-delete"
          :disabled="delDis"
          @click="delSoft"
        >删除</el-button>
      </el-col>
    </el-row>
    <el-row class="table_row">
      <el-table
        ref="multipleTable"
        stripe
        border
        highlight-current-row
        style="width: 100%"
        :data="tableData"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        @current-change="handleSelectChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="固件ID"></el-table-column>
        <el-table-column prop="name" label="固件名称"></el-table-column>
        <el-table-column prop="version" label="固件版本" />
        <el-table-column prop="upgradeType" label="推送方式">
          <template slot-scope="scope">{{ scope.row.upgradeType == 0 ? '主动推送':'设备拉取' }}</template>
        </el-table-column>
        <el-table-column prop="filePath" label="软件包地址">
          <template slot-scope="scope">
            <el-link
              :href="scope.row.filePath"
              target="_blank"
              style="color: #20a0ff"
            >{{scope.row.filePath.split("/")[scope.row.filePath.split("/").length-1]}}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="remarks" label="备注" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column width="150" label="操作">
          <template slot-scope="scope">
            <el-tooltip content="编辑">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="editSoft(scope.row)"
              />
            </el-tooltip>
            <el-tooltip content="详情">
              <el-button
                type="info"
                icon="el-icon-document-copy"
                size="mini"
                @click="detailSoft(scope.row)"
              />
            </el-tooltip>
            <el-tooltip content="添加升级任务">
              <el-button
                type="warning"
                icon="el-icon-s-operation"
                size="mini"
                @click="saveRecord(scope.row)"
              />
            </el-tooltip>
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
    <el-divider content-position="center">
      <img src="@/assets/devices/record.png" />升级记录
    </el-divider>
    <div style="text-align:center;" v-show="record.showRecordTip">
      <img src="@/assets/noTasks.png" style="width:80px;margin-top:10%" />
      <div>暂无升级记录，请先添加升级任务~</div>
    </div>
    <el-row class="table_row" v-show="!record.showRecordTip">
      <el-table stripe border style="width: 100%" :data="recordList" v-loading="record.loading">
        <el-table-column prop="id" label="记录ID" />
        <el-table-column prop="softId" label="固件ID" />
        <el-table-column prop="deviceId" label="设备ID" />
        <el-table-column prop="deviceName" label="设备名称" />
        <el-table-column prop="status" label="状态">
          <template slot-scope="scope">
            <span v-show="scope.row.status==0" style="color: black">未开始</span>
            <span v-show="scope.row.status==1" style="color: green">升级中</span>
            <span v-show="scope.row.status==2" style="color: green">升级完成</span>
            <span v-show="scope.row.status==3" style="color: red">升级失败</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column width="150" label="操作">
          <template slot-scope="scope">
            <el-button
              type="success"
              icon="el-icon-document-copy"
              size="mini"
              @click="startUpgrade(scope.row)"
              :disabled="scope.row.status != 0"
            >启动升级</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-row>
    <el-dialog
      :title="record.title"
      :visible.sync="record.visible"
      width="50%"
      :before-close="handleRecordCancel"
    >
      <el-row class="top" style="padding:0px 10px;">
        <el-col :span="24" class="search_col">
          <span>设备名称：</span>
          <el-input
            v-model="record.params.name"
            @keyup.enter.native="handleDeviceSearch"
            clearable
          />
          <span>设备型号：</span>
          <el-input
            v-model="record.params.devType"
            @keyup.enter.native="handleDeviceSearch"
            clearable
          />
          <span>设备状态：</span>
          <el-select
            v-model="record.params.status"
            @keyup.enter.native="handleDeviceSearch"
            clearable
          >
            <el-option label="离线" :value="0"></el-option>
            <el-option label="在线" :value="1"></el-option>
            <el-option label="休眠" :value="2"></el-option>
            <el-option label="充电" :value="3"></el-option>
            <el-option label="放电" :value="4"></el-option>
            <el-option label="故障" :value="5"></el-option>
          </el-select>
          <span>放电类型：</span>
          <el-select
            v-model="record.params.dischargeType"
            @keyup.enter.native="handleDeviceSearch"
            clearable
          >
            <el-option label="逆变放电" :value="0"></el-option>
            <el-option label="升压放电" :value="1"></el-option>
            <el-option label="PTC放电" :value="2"></el-option>
            <el-option label="第三方放电" :value="3"></el-option>
          </el-select>

          <el-button
            size="small"
            type="primary"
            icon="el-icon-search"
            @click="handleDeviceSearch"
          >搜索</el-button>
          <el-button
            size="small"
            type="success"
            icon="el-icon-circle-plus-outline"
            @click="handleSaveRecord"
            :disabled="saveRecordDis"
          >添加</el-button>
        </el-col>
      </el-row>
      <el-table
        class="tableData"
        ref="multipleTable2"
        v-loading="record.loading"
        :data="record.deviceList"
        stripe
        border
        style="width: 100%"
        @selection-change="handleRecordSelectionChange"
      >
        <el-table-column type="selection" width="30" />
        <el-table-column prop="name" label="设备名称" />

        <el-table-column prop="cardId" label="设备编号" />
        <el-table-column prop="devType" label="设备型号" />
        <el-table-column prop="volLevel" label="电压级别">
          <template slot-scope="scope">
            <span v-show="scope.row.volLevel==0">220V</span>
            <span v-show="scope.row.volLevel==1">110V</span>
            <span v-show="scope.row.volLevel==2">48V</span>
          </template>
        </el-table-column>
        <el-table-column prop="dischargeType" label="放电类型">
          <template slot-scope="scope">
            <span v-show="scope.row.dischargeType==0">逆变放电</span>
            <span v-show="scope.row.dischargeType==1">升压放电</span>
            <span v-show="scope.row.dischargeType==2">PTC放电</span>
            <span v-show="scope.row.dischargeType==3">第三方放电</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="设备状态">
          <template slot-scope="scope">
            <span v-show="scope.row.status==0">
              <img class="statusImg" src="../../assets/devices/offline.png" /> 离线
            </span>
            <span v-show="scope.row.status==1">
              <img class="statusImg" src="../../assets/devices/online.png" /> 在线
            </span>
            <span v-show="scope.row.status==2">
              <img class="statusImg" src="../../assets/devices/dormancy.png" /> 休眠
            </span>
            <span v-show="scope.row.status==3">
              <img class="statusImg" src="../../assets/devices/charge.png" /> 充电
            </span>
            <span v-show="scope.row.status==4">
              <img class="statusImg" src="../../assets/devices/discharge.png" /> 放电
            </span>
            <span v-show="scope.row.status==5">
              <img class="statusImg" src="../../assets/devices/fault.png" /> 故障
            </span>
          </template>
        </el-table-column>
        <el-table-column label="所属站点" width="140" prop="createTime">
          <template slot-scope="scope">
            <span>{{ getName(area_data ,scope.row.stationId) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="50%"
      :before-close="handleCancel"
    >
      <el-form ref="form" :rules="formRule" :model="form" label-width="90px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="固件名称:" prop="name">
              <el-input
                v-model="form.name"
                placeholder="请输入固件名称"
                :disabled="this.dialogType === 'detail'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="固件版本:" prop="version">
              <el-input
                v-model="form.version"
                placeholder="请输入固件版本"
                :disabled="this.dialogType === 'detail'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="升级方式:">
              <el-select v-model="form.upgradeType " :disabled="this.dialogType === 'detail'">
                <el-option label="主动推送" :value="0" />
                <el-option label="设备拉取" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="上传软件:" prop="filePath">
              <el-upload
                class="upload-demo"
                drag
                action
                :before-upload="beforeUploadFile"
                :file-list="fileList"
                :disabled="this.dialogType === 'detail'"
              >
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">
                  将文件拖到此处，或
                  <em>点击上传</em>
                </div>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注:" prop="remarks">
              <el-input
                v-model="form.remarks"
                type="textarea"
                :disabled="this.dialogType === 'detail'"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer" v-show="showButton">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleDetermine">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {
  saveSoft,
  delSoft,
  updateSoft,
  querySoft,
  uploadFile,
  stationTree,
  deviceList,
  saveRecord,
  getRecordList,
  startUpgrade,
  devicePage
} from "@/api/devices";

export default {
  name: "hardwareUpdate",
  data() {
    return {
      softName: "",
      upgradeType: "",
      total: 0,
      loading: false,
      tableData: [],
      current: 1,
      size: 10,
      multipleSelection: [], // 表格多选
      dialogTitle: "",
      dialogVisible: false,
      dialogType: "edit", // 弹框类型
      form: {
        name: "",
        version: "",
        filePath: "",
        upgradeType: 1
      },
      formRule: {
        // 表单验证规则
        name: [
          { required: true, message: "请输入固件名称！", trigger: "blur" }
        ],
        version: [
          { required: true, message: "请输入固件版本！", trigger: "blur" }
        ]
      },
      fileList: [],
      showButton: true,
      record: {
        showRecordTip: true,
        title: "添加升级任务",
        visible: false,
        pageNo: 1,
        pageSize: 10,
        loading: false,
        deviceList: [],
        params: {
          cardId: "",
          name: "",
          devType: "",
          volLevel: "",
          dischargeType: "",
          status: "",
          area: "",
          stationId: ""
        },
        devSelections: [],
        id: ""
      },
      isAdmin: "",
      area_data: [],
      recordList: []
    };
  },
  computed: {
    // 禁用删除按钮
    delDis() {
      if (this.multipleSelection.length > 0) {
        return false;
      } else {
        return true;
      }
    },
    saveRecordDis() {
      if (this.record.devSelections.length > 0) {
        return false;
      } else {
        return true;
      }
    }
  },
  created() {
    let obj = JSON.parse(sessionStorage.getItem("userInfo"));
    this.isAdmin = obj.roles.some(item => {
      return item.isAdmin;
    });
    this.querySoftPage();
  },
  methods: {
    handleSearch() {
      this.loading = true;
      let data = {
        name: this.softName,
        upgradeType: this.upgradeType,
        pageNo: 1,
        pageSize: this.size
      };
      console.log(data);
      querySoft(data)
        .then(res => {
          if (res.code == 0) {
            this.loading = false;
            this.tableData = res.data.list;
            this.current = res.data.current;
            this.size = res.data.size;
            this.total = res.data.total;
            this.$refs.multipleTable.setCurrentRow(this.tableData[0]);
            this.handleSelectChange(this.tableData[0]);
          }
        })
        .catch(exp => {
          this.loading = false;
          console.log(exp);
        });
    },
    handleRefresh() {
      this.softName = "";
      this.upgradeType = "";
      this.current = 1;
      this.size = 10;
      this.querySoftPage();
    },
    handleSizeChange(val) {
      this.size = val;
      this.querySoftPage();
    },
    handleCurrentChange(val) {
      this.current = val;
      this.querySoftPage();
    },
    // 表格多选
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    addSoft() {
      this.dialogType = "add";
      this.dialogTitle = "新增固件";
      this.form = {
        name: "",
        version: "",
        filePath: "",
        upgradeType: 1
      };
      this.dialogVisible = true;
    },
    delSoft() {
      const ids = [];
      this.multipleSelection.forEach(item => {
        ids.push(item.id);
      });
      this.$confirm("确定删除固件吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          delSoft({ ids: ids }).then(res => {
            if (res.code == 0) {
              this.$message({
                type: "success",
                message: "删除成功!"
              });
              this.current = 1;
              this.querySoftPage();
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
    editSoft(row) {
      console.log(row);
      this.dialogType = "edit";
      this.dialogTitle = "编辑固件信息";
      this.dialogVisible = true;
      let file = row.filePath.split("/");
      this.fileList.push({ name: file[file.length - 1], url: row.filePath });
      this.form = {
        id: row.id,
        name: row.name,
        version: row.version,
        upgradeType: row.upgradeType,
        remarks: row.remarks
      };
    },
    detailSoft(row) {
      this.dialogVisible = true;
      this.dialogTitle = "固件详情";
      this.dialogType = "detail";
      let file = row.filePath.split("/");
      this.fileList.push({ name: file[file.length - 1], url: row.filePath });
      this.form = {
        id: row.id,
        name: row.name,
        version: row.version,
        upgradeType: row.upgradeType,
        remarks: row.remarks
      };
      this.showButton = false;
    },
    querySoftPage() {
      this.loading = true;
      querySoft({
        name: this.softName,
        upgradeType: this.upgradeType,
        pageNo: this.current,
        pageSize: this.size
      })
        .then(res => {
          if (res.code == 0) {
            this.loading = false;
            this.tableData = res.data.list;
            this.current = res.data.current;
            this.size = res.data.size;
            this.total = res.data.total;
            this.$refs.multipleTable.setCurrentRow(this.tableData[0]);
            this.handleSelectChange(this.tableData[0]);
          }
        })
        .catch(exp => {
          this.loading = false;
          console.log(exp);
        });
    },
    saveRecord(row) {
      this.record.id = row.id;
      this.record.visible = true;
      this.getSationTree();
      this.getdevicesList();
    },
    //取消
    handleCancel() {
      this.form = {
        name: "",
        version: "",
        filePath: "",
        upgradeType: ""
      };
      this.dialogVisible = false;
      this.$refs.form.resetFields();
      this.fileList = [];
    },
    handleDetermine() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.dialogType === "add") {
            saveSoft(this.form)
              .then(res => {
                if (res.code == 0) {
                  this.$message({
                    type: "success",
                    message: "新增固件成功！"
                  });
                  this.dialogVisible = false;
                } else {
                  this.$message({
                    type: "error",
                    message: "新增固件失败！"
                  });
                  this.dialogVisible = false;
                }
                this.querySoftPage();
              })
              .catch(exp => {
                console.error(exp);
              });
          }
          if (this.dialogType === "edit") {
            updateSoft(this.form)
              .then(res => {
                if (res.code === "0") {
                  this.$message({
                    type: "success",
                    message: "更新成功!"
                  });
                } else {
                  this.$message({
                    type: "error",
                    message: "更新失败！"
                  });
                }
                this.dialogVisible = false;
                this.querySoftPage();
              })
              .catch(e => {
                console.warn(e);
              });
          }
        }
      });
    },
    beforeUploadFile(file) {
      this.fd = new FormData();
      this.fd.append("file", file);
      uploadFile(this.fd).then(res => {
        if (res.code === "0") {
          this.$message({
            type: "success",
            message: "上传软件成功！"
          });
          this.form.filePath = res.data;
          let file = res.data.split("/");
          this.fileList.push({ name: file[file.length - 1], url: res.data });
        }
      });
    },
    handleSelectChange(val) {
      getRecordList(val.id).then(res => {
        if (res.code == 0) {
          if (res.data.length > 0) {
            this.record.loading = false;
            this.record.showRecordTip = false;
            this.recordList = res.data;
          } else {
            this.record.showRecordTip = true;
          }
        } else {
        }
      });
    },
    getdevicesList() {
      this.record.loading = true;
      if (this.isAdmin == true) {
        this.record.params.area = "";
        deviceList(this.record.params)
          .then(res => {
            if (res.code === "0") {
              this.record.loading = false;
              this.record.deviceList = res.data;
            }
          })
          .catch(e => {
            this.record.loading = false;
          });
      } else {
        let obj = JSON.parse(sessionStorage.getItem("userInfo"));
        this.record.params.area = obj.area;
        devicePage(this.record.params)
          .then(res => {
            if (res.code === "0") {
              this.record.loading = false;
              this.record.deviceList = res.data;
            }
          })
          .catch(e => {
            this.record.loading = false;
          });
      }
    },
    getSationTree() {
      if (this.isAdmin == true) {
        stationTree().then(res => {
          if (res.code === "0") {
            this.area_data = res.data;
          }
        });
      } else {
        let obj = JSON.parse(sessionStorage.getItem("userInfo"));
        let area = obj.area;
        stationTree({
          area
        }).then(res => {
          if (res.code === "0") {
            this.area_data = res.data;
          }
        });
      }
    },
    //递归-获取表格每项的站点
    getName(list, id) {
      let _this = this;
      for (let i = 0; i < list.length; i++) {
        let a = list[i];
        if (a.id == id) {
          return a.name;
        } else {
          if (a.childNode && a.childNode.length > 0) {
            let res = _this.getName(a.childNode, id);
            if (res) {
              return res;
            }
          }
        }
      }
    },
    handleRecordCancel() {
      this.record.visible = false;
      this.record.params.status = "";
      this.record.params.name = "";
      this.record.params.devType = "";
      this.record.params.dischargeType = "";
    },
    handleRecordSelectionChange(val) {
      this.record.devSelections = val;
    },
    handleDeviceSearch() {
      this.getdevicesList();
    },
    handleSaveRecord() {
      saveRecord({
        softId: this.record.id,
        devices: this.record.devSelections
      })
        .then(res => {
          if (res.code == 0) {
            this.$message({
              type: "success",
              message: "新增任务成功！"
            });
            this.handleSelectChange(this.record);
            this.record.visible = false;
          } else {
            this.$message({
              type: "error",
              message: "新增任务失败！"
            });
            this.record.visible = false;
          }
        })
        .catch(exp => {
          console.log(exp);
        });
    },
    startUpgrade(row) {
      let ids = [row.id];
      startUpgrade({
        ids: ids
      }).then(res => {
        if (res.code == 0) {
          this.$message({
            type: "success",
            message: "启动升级任务成功！"
          });
          let dev = {};
          dev.id = row.softId;
          this.handleSelectChange(dev);
        }
      });
    }
  }
};
</script>
<style scoped>
.table_row /deep/ .el-button {
  font-size: 12px;
  padding: 5px;
}
.clearBox {
  padding: 10px;
}
.clearBox .top {
  margin-bottom: 10px;
}
.search_col .el-input {
  width: 11%;
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

.clearBox .page {
  margin-top: 10px;
}

.clearBox /deep/ .el-dialog__wrapper .el-dialog__header {
  background: #304156;
}
.clearBox /deep/ .el-dialog__wrapper .el-dialog__header span {
  color: #f4f4f4;
  font-size: 16px;
}
.clearBox /deep/ .el-dialog {
  border-radius: 5px;
  overflow: hidden;
}

.detail_drawer >>> .el-drawer__header {
  background: #304156;
  padding: 10px;
  color: #f4f4f4;
  font-size: 16px;
  margin-bottom: 0px;
}
.detail_drawer >>> .el-form-item {
  margin-bottom: 0px;
}
.detail_drawer >>> .el-form-item .el-form-item__label {
  font-size: 12px;
}
.table_row /deep/ .el-table__body tr.current-row > td {
  background-color: #bbcd2973;
}
</style>
