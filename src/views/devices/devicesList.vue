<template>
  <div class="devicelistBox">
    <el-row class="table_row contentBox">
      <div class="areaBox">
        <h6 class="area-title">选择站点</h6>
        <el-tree
          ref="search"
          class="myTree"
          :data="area_data"
          accordion
          node-key="id"
          :check-strictly="true"
          :highlight-current="true"
          :default-checked-keys="checkedIds"
          :expand-on-click-node="false"
          :default-expand-all="true"
          :props="defaultProps"
          @node-click="stationClick"
        />
      </div>
      <div class="tableBox">
        <el-row class="top" style="padding:0px 10px;">
          <el-col :span="24" class="search_col">
            <span>设备名称：</span>
            <el-input v-model="params.name" clearable @keyup.enter.native="handleSearch" />
            <span>设备型号：</span>
            <el-input v-model="params.devType" clearable @keyup.enter.native="handleSearch" />
            <span>设备状态：</span>
            <el-select v-model="params.status" clearable @keyup.enter.native="handleSearch">
              <el-option label="离线" :value="0" />
              <el-option label="在线" :value="1" />
              <el-option label="休眠" :value="2" />
              <el-option label="充电" :value="3" />
              <el-option label="放电" :value="4" />
              <el-option label="故障" :value="5" />
            </el-select>
            <span>放电类型：</span>
            <el-select v-model="params.dischargeType" clearable @keyup.enter.native="handleSearch">
              <el-option label="逆变放电" :value="0" />
              <el-option label="升压放电" :value="1" />
              <el-option label="PTC放电" :value="2" />
              <el-option label="第三方放电" :value="3" />
            </el-select>

            <el-button size="small" type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            <el-button size="small" type="primary" icon="el-icon-refresh" @click="handleRefresh">重置</el-button>

            <el-dropdown style="margin:0px 10px;" v-if="isAdmin">
              <el-button type="primary">
                <i class="el-icon-arrow-down" /> 新增
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>
                  <el-button size="small" type="success" plain @click="addDevices">新增设备</el-button>
                </el-dropdown-item>
                <el-dropdown-item style="margin-top:10px;">
                  <el-button size="small" type="success" plain @click="batchImport">批量导入</el-button>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>

            <el-button
              v-if="isAdmin"
              size="small"
              type="danger"
              icon="el-icon-delete"
              :disabled="deletDis"
              @click="handleDelete"
            >删除</el-button>
          </el-col>
        </el-row>
        <el-table
          ref="multipleTable"
          v-loading="loading"
          class="tableData"
          :data="list"
          stripe
          border
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="30" />
          <el-table-column prop="name" label="设备名称">
            <template slot-scope="scope">
              <span class="devicesName" @click="handleDetails(scope.row)">{{ scope.row.name }}</span>
            </template>
          </el-table-column>

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
                <span class="bg1" /> 离线
              </span>
              <span v-show="scope.row.status==1">
                <span class="dot bg2" /> 在线
              </span>
              <span v-show="scope.row.status==2">
                <span class="dot bg3" /> 休眠
              </span>
              <span v-show="scope.row.status==3">
                <span class="dot bg4" /> 充电
              </span>
              <span v-show="scope.row.status==4">
                <span class="dot bg5" /> 放电
              </span>
              <span v-show="scope.row.status==5">
                <span class="dot bg6" /> 故障
              </span>
            </template>
          </el-table-column>
          <el-table-column label="所属站点" width="140" prop="createTime">
            <template slot-scope="scope">
              <span>{{ getName(area_data ,scope.row.stationId) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="190">
            <template slot-scope="scope">
              <el-button
                type="success"
                title="编辑"
                icon="el-icon-edit"
                size="mini"
                @click="handleEdit(scope.row)"
              />
              <el-button
                type="primary"
                icon="el-icon-mobile-phone"
                size="mini"
                title="添加配置"
                @click="handleconfig(scope.row)"
              />
              <el-button
                type="warning"
                icon="el-icon-money"
                size="mini"
                title="电池组配置"
                @click="handleBatteryPack(scope.row)"
              />
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                title="删除"
                @click="handleDelOne(scope.row)"
              />
            </template>
          </el-table-column>
        </el-table>
        <el-row class="page">
          <el-pagination
            background
            :current-page="params.pageNo"
            :page-size="params.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </el-row>
      </div>
    </el-row>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="50%"
      :before-close="handleCancel"
    >
      <el-form ref="form" :rules="formRule" :model="form" label-width="145px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备名称:" prop="name">
              <!-- oninput="if(value.length>16)value=value.slice(0,16)" -->
              <el-input v-model="form.name" placeholder="请输入设备名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备编号:" prop="cardId">
              <el-input
                v-model="form.cardId"
                placeholder="请输入15位IMEI数字、字母或数字字母组合"
                onkeyup="value=value.replace(/[^\w\.\/]/ig,'')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备型号:" prop="devType">
              <el-input v-model="form.devType" placeholder="请输入设备型号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电压级别:" prop="volLevel">
              <el-select v-model="form.volLevel" class="input-w">
                <el-option label="220V" :value="0" />
                <el-option label="110V" :value="1" />
                <el-option label="48V" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="放电类型:" prop="dischargeType">
              <el-select v-model="form.dischargeType" class="input-w">
                <el-option label="逆变放电" :value="0" />
                <el-option label="升压放电" :value="1" />
                <el-option label="PTC放电" :value="2" />
                <el-option label="第三方放电" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备站点:" prop="stationId">
              <el-tree-select
                ref="treeSelect"
                v-model="form.stationId"
                :select-params=" {
                  multiple: false,
                  clearable: true,
                  placeholder: '请选择设备站点'
                }"
                :tree-params="treeParams"
                @searchFun="_searchFun"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电池组数:">
              <el-input
                v-model="form.batteryGrpNum"
                class="input-w"
                type="number"
                min="0"
                placeholder="请输入电池组数"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电池个数:">
              <el-input
                v-model="form.batteryNum"
                class="input-w"
                type="number"
                min="0"
                placeholder="请输入电池个数"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="充电子模块个数:">
              <el-input
                v-model="form.chargeNum"
                class="input-w"
                type="number"
                min="0"
                placeholder="请输入充电子模块个数"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="放电子模块个数:">
              <el-input
                v-model="form.dischargeNum"
                class="input-w"
                type="number"
                min="0"
                placeholder="请输入放电子模块个数"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单体监控子模块个数:">
              <el-input
                v-model="form.monitorNum"
                class="input-w"
                type="number"
                min="0"
                placeholder="请输入单体监控子模块个数"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备地址:">
              <el-input v-model="form.address" placeholder="请输入设备地址" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注:">
              <el-input
                v-model="form.remarks"
                type="textarea"
                placeholder="请输入备注"
                @input="widthCheck($event.target, 200)"
              />
              <div>提示：不能超过200个字符！</div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleDetermine">确 定</el-button>
      </span>
    </el-dialog>

    <el-drawer
      :size=" &quot;38.5%&quot; "
      class="detail_drawer"
      title="设备详情"
      :visible.sync="drawer"
      direction="rtl"
    >
      <el-collapse v-model="activeName" style="padding:0px 15px;" accordion>
        <el-collapse-item title="基本信息" name="1">
          <el-form :model="deviceDetailData">
            <el-row class="border" :gutter="10">
              <el-col :span="12">
                <el-form-item label="设备名称:">
                  <span>{{ deviceDetailData.name }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="设备编号:">
                  <span>{{ deviceDetailData.cardId }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="设备型号:">
                  <span>{{ deviceDetailData.devType }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="放电类型:">
                  <span v-show="deviceDetailData.dischargeType==0">逆变放电</span>
                  <span v-show="deviceDetailData.dischargeType==1">升压放电</span>
                  <span v-show="deviceDetailData.dischargeType==2">PTC放电</span>
                  <span v-show="deviceDetailData.dischargeType==3">第三方放电</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="电池组数:">
                  <span>{{ deviceDetailData.batteryGrpNum }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="电压级别:">
                  <span v-show="deviceDetailData.volLevel==0">220V</span>
                  <span v-show="deviceDetailData.volLevel==1">110V</span>
                  <span v-show="deviceDetailData.volLevel==2">48V</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="充电子模块个数:">
                  <span>{{ deviceDetailData.chargeNum }} 个</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="放电子模块个数:">
                  <span>{{ deviceDetailData.dischargeNum }} 个</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="单体监控子模块个数: ">
                  <span>{{ deviceDetailData.monitorNum }} 个</span>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="创建时间:">
                  <span>{{ deviceDetailData.createTime }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="最后连接时间:">
                  <span>{{ deviceDetailData.lastConnTime }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="设备地址:  ">
                  <span>{{ deviceDetailData.address }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="备注:">
                  <span>{{ deviceDetailData.remarks }}</span>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-collapse-item>
        <el-collapse-item title="配置信息" name="2">
          <div class="configBox">
            <div class="border">
              <p class="center">网络配置</p>
              <el-form :mode="netForm" label-width="90px">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="设备IP:">
                      <span>{{ netForm.configContent.ip }}</span>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="设备端口号:">
                      <span>{{ netForm.configContent.port }}</span>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="用户名:">
                      <span>{{ netForm.configContent.username }}</span>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="密码:">
                      <span>{{ netForm.configContent.password }}</span>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="通讯波特率:">
                      <span>{{ netForm.configContent.baudrate }}</span>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>
            <div class="border">
              <p class="center">充电配置</p>
              <el-form :mode="chargeForm" label-width="160px">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="电池组启动充电电压:">
                      <span>{{ chargeForm.configContent.MinChargStartBatteryVoltage/1000 }}</span>
                      <span>V</span>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="电池单体启动充电电压:">
                      <span>{{ chargeForm.configContent.MinChargStartCellBatteryVoltage/1000 }}</span>
                      <span>V</span>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="电池组充电超时时间:">
                      <span>{{ chargeForm.configContent.ChargingOvertime }}</span>
                      <span>h</span>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="电池组电压上限:">
                      <span>{{ chargeForm.configContent.MaxChargStartBatteryVoltage/1000 }}</span>
                      <span>V</span>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="电池单体电压上限:">
                      <span>{{ chargeForm.configContent.MaxChargStartCellBatteryVoltage/1000 }}</span>
                      <span>V</span>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>
            <div class="border">
              <p class="center">核容配置</p>
              <el-form :mode="dischargeForm" label-width="160px">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="当前核容方式:">
                      <span v-show="dischargeForm.configContent.CurrentConfirmCapacityMode==0">容量测试</span>
                      <span v-show="dischargeForm.configContent.CurrentConfirmCapacityMode==1">突发测试</span>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="慢速放电电流:">
                      <span>{{ dischargeForm.configContent.CapacityTestDischargeCurrent/1000 }} AH</span>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="慢速放电单体电压下限:">
                      <span>{{ dischargeForm.configContent.MinCapacityTestDischargeBatteryCellValtage/1000 }}</span>
                      <span>V</span>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="慢速放电电池电压下限:">
                      <span>{{ dischargeForm.configContent.MinCapacityTestDischargeBatteryValtage/1000 }}</span>
                      <span>V</span>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="慢速放电放电量上限:">
                      <span>{{ dischargeForm.configContent.MaxCapacityTestDischargeCapacity/1000 }}</span>
                      <span>AH</span>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="慢速放电时间上限:">
                      <span>{{ dischargeForm.configContent.CapacityTestDischargeDuration }}</span>
                      <span>h</span>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="快速放电放电电流:">
                      <span>{{ dischargeForm.configContent.BurstTestDischargeCurrent/1000 }}</span>
                      <span>A</span>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="快速放电放电时间:">
                      <span>{{ dischargeForm.configContent.BurstTestDistchargeTime }}</span>
                      <span>s</span>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="快速放电单体告警电压:">
                      <span>{{ dischargeForm.configContent.BurstTestDischargeBatteryCellAlertingValtage/1000 }}</span>
                      <span>V</span>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>
            <div class="border">
              <p class="center">时间配置</p>
              <el-form :mode="monitorForm" label-width="160px">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="每日上报周期:">
                      <span>{{ monitorForm.configContent.PeriodReportTimes }}</span>
                      <span>次</span>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="定期充电周期:">
                      <span>{{ monitorForm.configContent.ConfirmCapacityPeriod }}</span>
                      <span>天</span>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="核容周期:">
                      <span>{{ monitorForm.configContent.MinConfirmCapacityInterval }}</span>
                      <span>天</span>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="两次核容最小间隔周期:">
                      <span>{{ monitorForm.configContent.ChargingPeriod }}</span>
                      <span>天</span>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>
            <div class="border">
              <p class="center">固件配置</p>
              <el-form :mode="hardwareForm" label-width="160px">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="软件版本号:">
                      <span>{{ hardwareForm.configContent.SoftVersion }}</span>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="硬件版本号:">
                      <span>{{ hardwareForm.configContent.HardVersion }}</span>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="生产序列号:">
                      <span>{{ hardwareForm.configContent.EquipmentProductNum }}</span>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>
            <div class="border">
              <p class="center">温度配置</p>
              <el-form :mode="temperatureForm" label-width="160px">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="环境（电池）温度上限:">
                      <span>{{ temperatureForm.configContent.MaxEnvTemperature }}</span>
                      <span>℃</span>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="MOS 温度上限:">
                      <span>{{ temperatureForm.configContent.MaxBatteryTemperature }}</span>
                      <span>℃</span>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>
            <div class="border">
              <p class="center">现场参数</p>
              <el-form :mode="othersForm" label-width="180px">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="标称电池电压（Vbc）:">
                      <span>{{ othersForm.configContent.NominalBatteryVoltage/1000 }}</span>
                      <span>V</span>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="电池容量（C）:">
                      <span>{{ othersForm.configContent.BatteryCapacity/1000 }}</span>
                      <span>AH</span>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="标称单体电池电压（Vdt）:">
                      <span>{{ othersForm.configContent.NominalCellBatteryVoltage/1000 }}</span>
                      <span>V</span>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-drawer>

    <el-dialog
      title="批量导入设备"
      :visible.sync="dialogImport"
      width="30%"
      :before-close="cancelImport"
      :close-on-click-modal="false"
    >
      <el-form label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="文件格式:">xls</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="文件上传:" class="uploadItem">
              <!-- action="http://172.168.10.61:8180/netservice/net/device/batchSave" -->
              <!-- :http-request="uploadHttpRequest" -->
              <el-upload
                ref="upload"
                class="upload-demo"
                action="#"
                :on-remove="handleRemove"
                :file-list="fileList"
                :limit="1"
                accept=".xls"
                :on-exceed="handleExceed"
                :on-success="handleSuccess"
                :before-upload="handleBefore"
                :http-request="uploadHttpRequest"
                :on-change="handleChange"
                :on-error="handleError"
                :auto-upload="false"
              >
                <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
                <!--<div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div> -->
              </el-upload>
              <span class="download-btn" @click="downloadModel">下载.xls模板</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item style="text-align:center;">
              <el-button @click="cancelImport">取 消</el-button>
              <el-button type="primary" @click="handleImport">确 定</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
// 设备状态：0-离线;1-在线;2-休眠;3-充电;4-放电;5-故障
import {
  devicePage,
  deviceSave,
  deviceDelete,
  deviceUpdate,
  deviceDetail,
  downloadExcel,
  batchSave,
  stationPage,
  stationTree
} from "@/api/devices";
import { areaPage } from "@/api/sys";
import myMap from "@/components/map";
import {
  cardIdReg2,
  remarksReg,
  addressReg,
  devnameReg,
  devtypeReg
} from "@/utils/exp";

export default {
  name: "DeviceList",
  components: {
    myMap
  },
  data() {
    const val_cardId = (rule, value, callback) => {
      if (value.length != 15) {
        callback(new Error("请输入15位字符！"));
      } else {
        callback();
      }
    };

    return {
      params: {
        cardId: "",
        name: "",
        devType: "",
        volLevel: "",
        dischargeType: "",
        status: "",
        area: "",
        stationIds: [],
        pageNo: 1,
        pageSize: 10
      },
      treeParams: {
        clickParent: false,
        filterable: true,
        "check-strictly": true,
        "default-expand-all": true,
        "expand-on-click-node": false,
        data: [],
        props: {
          children: "childNode",
          label: "name",
          disabled: "disabled",
          value: "id"
        }
      },
      checkedIds: [],
      list: [],
      loading: false,
      total: 0,
      current: 1,
      size: 10,
      dialogTitle: "新增设备",
      dialogVisible: false,
      dialogType: "add",
      form: {
        cardId: "",
        name: "",
        devType: "",
        stationId: undefined,
        batteryGrpNum: null,
        volLevel: null,
        batteryNum: null,
        chargeNum: null,
        dischargeNum: null,
        dischargeType: null,
        monitorNum: null,
        address: "",
        remarks: ""
      },
      formRule: {
        cardId: [
          { required: true, message: "不能为空！", trigger: "blur" },
          { required: true, validator: val_cardId, trigger: "blur" }
        ],
        name: [
          { required: true, message: "不能为空！", trigger: "blur" },
          {
            required: true,
            max: 16,
            min: 2,
            message: "名称应在2-16位字符之间！",
            trigger: "blur"
          }
        ],
        stationId: [
          { required: true, message: "请选择设备站点!", trigger: "blur" }
        ],
        volLevel: [
          { required: true, message: "请输入电压级别！", trigger: "blur" }
        ],
        dischargeType: [
          { required: true, message: "请输入放电类型！", trigger: "blur" }
        ],
        devType: [{ required: true, message: "不能为空！", trigger: "blur" }]
      },
      area_params: {
        parentId: null,
        parentIds: null,
        name: null,
        code: null,
        type: null,
        remarks: null,
        pageNo: 1,
        pageSize: 30
      },
      area_data: [],
      defaultProps: {
        label: "name",
        children: "childNode"
      },
      treeChecked: [],
      areaType: null, // 选择某一站点，判断区域选中区域树的类型

      dialogMap: false,
      multipleSelection: [], // 表格多选
      updateId: "",
      drawer: false,
      deviceDetailData: {},
      activeName: "1",
      netForm: {
        deviceId: "",
        configType: 0,
        configContent: {
          ip: "",
          port: "",
          username: "",
          password: "",
          baudrate: ""
        }
      },
      chargeForm: {
        deviceId: "",
        configType: 1,
        configContent: {
          MinChargStartBatteryVoltage: "",
          MinChargStartCellBatteryVoltage: "",
          ChargingOvertime: "",
          MaxChargStartBatteryVoltage: "",
          MaxChargStartCellBatteryVoltage: ""
        }
      },
      dischargeForm: {
        deviceId: "",
        configType: 2,
        configContent: {
          CurrentConfirmCapacityMode: "",
          CapacityTestDischargeCurrent: "",
          MinCapacityTestDischargeBatteryCellValtage: "",
          MinCapacityTestDischargeBatteryValtage: "",
          MaxCapacityTestDischargeCapacity: "",
          CapacityTestDischargeDuration: "",
          BurstTestDischargeCurrent: "",
          BurstTestDistchargeTime: "",
          BurstTestDischargeBatteryCellAlertingValtage: ""
        }
      },
      monitorForm: {
        deviceId: "",
        configType: 3,
        configContent: {
          PeriodReportTimes: "",
          ConfirmCapacityPeriod: "",
          MinConfirmCapacityInterval: "",
          ChargingPeriod: ""
        }
      },
      hardwareForm: {
        deviceId: "",
        configType: 4,
        configContent: {
          SoftVersion: "",
          HardVersion: "",
          EquipmentProductNum: ""
        }
      },
      temperatureForm: {
        deviceId: "",
        configType: 5,
        configContent: {
          MaxEnvTemperature: 55,
          MaxBatteryTemperature: 80
        }
      },
      othersForm: {
        deviceId: "",
        configType: 99,
        configContent: {
          NominalBatteryVoltage: "",
          BatteryCapacity: "",
          NominalCellBatteryVoltage: ""
        }
      },

      dialogImport: false, //
      fileList: [],
      isAdmin: "",
      loginName: ""
    };
  },
  computed: {
    deletDis() {
      // 禁用删除按钮
      if (this.multipleSelection.length > 0) {
        return false;
      } else {
        return true;
      }
    }
  },
  created() {
    const obj = JSON.parse(sessionStorage.getItem("userInfo"));
    this.loginName = obj.loginName;
    this.isAdmin = obj.roles.some(item => {
      return item.isAdmin;
    });
  },
  mounted() {
    if (this.$route.query.name) {
      setTimeout(() => {
        const row = this.list.find(item => {
          return item.name == this.$route.query.name;
        });
        this.handleDetails(row);
      }, 600);
    }
    this.getSationTree();
    this.getdevicesList();
  },
  methods: {
    getSationTree() {
      const obj = JSON.parse(sessionStorage.getItem("userInfo"));
      let data = {};
      if (this.loginName !== "admin") {
        const area = obj.area;
        data = {
          area
        };
      }
      stationTree(data).then(res => {
        if (res.code === "0") {
          this.area_data = res.data;
          this.treeParams.data = res.data;
        }
      });
    },
    // 树过滤
    _searchFun(value) {
      console.log(value, "<--_searchFun");
      // 自行判断 是走后台查询，还是前端过滤
      // this.$refs.treeSelect.$refs.tree.filter(value);
      this.$refs.treeSelect.filterFun(value);
      // 后台查询
      // this.$refs.treeSelect.treeDataUpdateFun(treeData);
    },
    getdevicesList() {
      this.loading = true;
      if (this.isAdmin == true) {
        this.params.area = "";
        devicePage(this.params)
          .then(res => {
            if (res.code === "0") {
              this.loading = false;
              this.list = res.data.list;
              this.total = res.data.total;
              this.current = res.data.current;
              this.size = res.data.size;
            }
          })
          .catch(e => {
            this.loading = false;
          });
      } else {
        const obj = JSON.parse(sessionStorage.getItem("userInfo"));
        this.params.area = obj.area;
        if (this.params.area == null || this.params.area == "") {
          this.loading = false;
          return;
        }
        devicePage(this.params)
          .then(res => {
            if (res.code === "0") {
              this.loading = false;
              this.list = res.data.list;
              this.total = res.data.total;
              this.current = res.data.current;
              this.size = res.data.size;
            }
          })
          .catch(e => {
            this.loading = false;
          });
      }
    },
    // 递归-获取表格每项的站点
    getName(list, id) {
      const _this = this;
      for (let i = 0; i < list.length; i++) {
        const a = list[i];
        if (a.id == id) {
          return a.name;
        } else {
          if (a.childNode && a.childNode.length > 0) {
            const res = _this.getName(a.childNode, id);
            if (res) {
              return res;
            }
          }
        }
      }
    },
    // 搜索
    handleSearch() {
      this.params.pageNo = 1;
      this.getdevicesList();
    },
    // 重置
    handleRefresh() {
      this.params = {
        cardId: "",
        name: "",
        devType: "",
        volLevel: "",
        stationIds: [],
        dischargeType: "",
        status: "",
        stationId: "",
        pageNo: 1,
        pageSize: 10
      };
      this.form.stationId = undefined;
      this.$refs.search.setCurrentKey(null); // 取消树的高亮

      this.getdevicesList();
    },
    // 新增
    addDevices() {
      console.log(this.form);
      this.dialogVisible = true;
      this.dialogType = "add";
      this.dialogTitle = "新增设备";
    },
    // 删除多个
    handleDelete() {
      this.$confirm("确定要删除此设备吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const ids = [];
          this.multipleSelection.forEach(item => {
            ids.push(item.id);
          });
          deviceDelete({ ids: ids }).then(res => {
            if (res.code == 0) {
              this.$message({
                type: "success",
                message: "删除成功!"
              });
              this.getdevicesList();
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
    // 删除一个
    handleDelOne(row) {
      this.$confirm("确定要删除此设备吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          const ids = [];
          ids.push(row.id);
          deviceDelete({ ids: ids }).then(res => {
            if (res.code == 0) {
              this.$message({
                type: "success",
                message: "删除成功!"
              });
              this.getdevicesList();
            }
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除！"
          });
        });
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // 编辑
    handleEdit(row) {
      console.log(row);
      this.updateId = row.id;
      this.form.cardId = row.cardId;
      this.form.name = row.name;
      this.form.devType = row.devType;
      this.form.stationId = row.stationId;
      this.form.batteryGrpNum = row.batteryGrpNum;
      this.form.volLevel = row.volLevel;
      this.form.batteryNum = row.batteryNum;
      this.form.chargeNum = row.chargeNum;
      this.form.dischargeNum = row.dischargeNum;
      this.form.dischargeType = row.dischargeType;
      this.form.monitorNum = row.monitorNum;
      this.form.address = row.address;
      this.form.remarks = row.remarks;

      this.dialogVisible = true;
      this.dialogType = "edit";
      this.dialogTitle = "编辑设备";
    },
    // 配置
    handleconfig(row) {
      // console.log(row);
      this.$router.push({
        path: "/config",
        query: {
          id: row.id
        }
      });
    },
    // 电池组
    handleBatteryPack(row) {
      this.$router.push({
        path: "/batteryPack",
        query: {
          id: row.id,
          num: row.batteryGrpNum
        }
      });
    },
    handleSizeChange(val) {
      this.params.pageSize = val;
      this.getdevicesList();
    },
    handleCurrentChange(val) {
      this.params.pageNo = val;
      this.getdevicesList();
    },
    // 取消
    handleCancel() {
      this.form.cardId = "";
      this.form.name = "";
      (this.form.devType = null), (this.form.batteryGrpNum = null);
      this.form.volLevel = null;
      this.form.batteryNum = null;
      this.form.chargeNum = null;
      this.form.dischargeNum = null;
      this.form.dischargeType = null;
      this.form.monitorNum = null;
      this.form.address = "";
      this.form.remarks = "";
      this.form.stationId = undefined;

      this.$refs["form"].resetFields();
      this.dialogVisible = false;
    },
    // 确定
    handleDetermine() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.dialogType == "add") {
            deviceSave(this.form).then(res => {
              if (res.code === "0") {
                this.$message({
                  type: "success",
                  message: "新增设备成功！"
                });
                this.getdevicesList();
                this.handleCancel();
              }
              this.$nextTick(() => {});
            });
          }
          if (this.dialogType == "edit") {
            const data = {
              id: this.updateId,
              ...this.form
            };
            deviceUpdate(data).then(res => {
              if (res.code === "0") {
                this.$message({
                  type: "success",
                  message: "设备更新成功！"
                });
              }
              this.getdevicesList();
              this.handleCancel();
            });
          }
        }
      });
    },
    // 详情
    handleDetails(row) {
      this.drawer = true;
      this.getDeviceDetail(row.id);
    },
    // 批量导入
    batchImport() {
      this.dialogImport = true;
    },
    // 取消导入
    cancelImport() {
      this.dialogImport = false;
      this.fileList = [];
    },
    // 确定导入
    handleImport() {
      if (this.fileList.length == 0) {
        return this.$message({
          type: "warning",
          message: "请先选择文件！"
        });
      } else {
        this.$refs.upload.submit();
      }
    },
    // 自定义上传方法，param是默认参数，可以取得file文件信息
    uploadHttpRequest(param) {
      const formData = new FormData(); // FormData对象，添加参数只能通过append('key', value)的形式添加
      formData.append("file", param.file); // 添加文件对象
      batchSave(formData).then(res => {
        if (res.code === "0") {
          this.$message({
            type: "success",
            message: "上传成功"
          });
          this.cancelImport();
          this.handleRefresh();
        } else {
          this.$message({
            type: "error",
            message: res.msg || res.data
          });
        }
      });
    },
    // 下载模板
    downloadModel() {
      downloadExcel().then(res => {
        const url = window.URL.createObjectURL(
          new Blob([res], { type: "application/vnd.ms-excel" })
        );
        const link = document.createElement("a");
        link.style.display = "none";
        link.href = url;
        link.setAttribute("download", "设备批量导入模板" + ".xls");
        document.body.appendChild(link);
        link.click();
      });
    },
    handleRemove(file, fileList) {
      this.fileList = [];
    },
    handleExceed(files, fileList) {
      this.$message.warning("每次只能上传一个文件！");
    },
    handleSuccess(res, file, fileList) {
      this.$message.success("文件上传成功");
    },
    handleError(err, file, fileList) {
      this.$message.error("文件上传失败");
    },
    handleChange(file, fileList) {
      if (file) {
        this.fileList = fileList.slice(-3);
      }
    },
    handleBefore(file) {
      const extension = file.name.substring(file.name.lastIndexOf(".") + 1);
      const size = file.size / 1024 / 1024;
      if (extension !== "xls") {
        return this.$message.warning("只能上传后缀是.xls的文件");
      }
      // if(size > 10) {
      //     this.$message.warning('文件大小不得超过10M');
      // }
    },

    // 限制输入框输入的字符数
    widthCheck(str, len) {
      var temp = 0;
      for (var i = 0; i < str.value.length; i++) {
        if (/[\u4e00-\u9fa5]/.test(str.value[i])) {
          temp += 2;
        } else {
          temp++;
        }
        if (temp > len) {
          str.value = str.value.substr(0, i);
        }
      }
    },

    // 获取设备详情
    getDeviceDetail(id) {
      deviceDetail(id).then(res => {
        if (res.code === "0") {
          this.deviceDetailData = res.data;
          const list = res.data.configList;
          if (list != null && list.length > 0) {
            list.forEach(item => {
              switch (item.configType) {
                case 0:
                  this.netForm = item;
                  break;
                case 1:
                  this.chargeForm = item;
                  break;
                case 2:
                  this.dischargeForm = item;
                  break;
                case 3:
                  this.monitorForm = item;
                  break;
                case 4:
                  this.hardwareForm = item;
                  break;
                case 5:
                  this.temperatureForm = item;
                  break;
                case 99:
                  this.othersForm = item;
                  break;
              }
            });
          } else {
            this.netForm = {
              deviceId: "",
              configType: 0,
              configContent: {
                ip: "",
                port: "",
                username: "",
                password: "",
                baudrate: ""
              }
            };
            this.chargeForm = {
              deviceId: "",
              configType: 1,
              configContent: {
                MinChargStartBatteryVoltage: "",
                MinChargStartCellBatteryVoltage: "",
                ChargingOvertime: "",
                MaxChargStartBatteryVoltage: "",
                MaxChargStartCellBatteryVoltage: ""
              }
            };
            this.dischargeForm = {
              deviceId: "",
              configType: 2,
              configContent: {
                CurrentConfirmCapacityMode: "",
                CapacityTestDischargeCurrent: "",
                MinCapacityTestDischargeBatteryCellValtage: "",
                MinCapacityTestDischargeBatteryValtage: "",
                MaxCapacityTestDischargeCapacity: "",
                CapacityTestDischargeDuration: "",
                BurstTestDischargeCurrent: "",
                BurstTestDistchargeTime: "",
                BurstTestDischargeBatteryCellAlertingValtage: ""
              }
            };
            this.monitorForm = {
              deviceId: "",
              configType: 3,
              configContent: {
                PeriodReportTimes: "",
                ConfirmCapacityPeriod: "",
                MinConfirmCapacityInterval: "",
                ChargingPeriod: ""
              }
            };
            this.hardwareForm = {
              deviceId: "",
              configType: 4,
              configContent: {
                SoftVersion: "",
                HardVersion: "",
                EquipmentProductNum: ""
              }
            };
            this.temperatureForm = {
              deviceId: "",
              configType: 5,
              configContent: {
                MaxEnvTemperature: 55,
                MaxBatteryTemperature: 80
              }
            };
            this.othersForm = {
              deviceId: "",
              configType: 99,
              configContent: {
                NominalBatteryVoltage: "",
                BatteryCapacity: "",
                NominalCellBatteryVoltage: ""
              }
            };
          }
        }
      });
    },
    async stationClick(item) {
      const arr = [item];
      // 递归展开
      const flatten = arr => {
        return arr.reduce((flat, item) => {
          return flat.concat(
            item,
            item["childNode"] ? flatten(item["childNode"]) : []
          );
        }, []);
      };
      const flatArr = flatten(arr);
      const stationIds = flatArr.filter(x => !x.childNode).map(x => x.id);
      this.params.stationIds = stationIds;
      const res = await devicePage(this.params);
      this.loading = true;
      if (res.code === "0") {
        this.loading = false;
        this.list = res.data.list;
        this.total = res.data.total;
        this.current = res.data.current;
        this.size = res.data.size;
      }
    },

    flattenDeep(arr = [], childs = "children", depth = 0, parent = null) {
      let index = 0;
      return arr.reduce((flat, item) => {
        item._depth = depth;
        item._parent = parent;
        item._index = index;
        index++;

        return flat.concat(
          item,
          item[childs] && !item.collapsed
            ? this.flattenDeep(item[childs], childs, depth + 1, item)
            : []
        );
      }, []);
    }
  }
};
</script>
<style scoped>
@keyframes twinkling {
  0% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.12);
  }
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
}
.bg1 {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  /* animation: twinkling 2s infinite ease-in-out;
  animation-fill-mode: both; */
  background: rgb(153, 150, 150);
}

/*tree 高亮*/
.myTree >>> .is-current > .el-tree-node__content {
  background: #aad8ff;
}
.bg2 {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: twinkling 2s infinite ease-in-out;
  animation-fill-mode: both;
  background: rgb(1, 54, 13);
}
.bg3 {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  /* animation: twinkling 2s infinite ease-in-out;
  animation-fill-mode: both; */
  background: rgb(236, 200, 35);
}
.bg4 {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  /* animation: twinkling 2s infinite ease-in-out;
  animation-fill-mode: both; */
  background: rgb(11, 33, 230);
}
.bg5 {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  /* animation: twinkling 2s infinite ease-in-out;
  animation-fill-mode: both; */
  background: rgb(115, 85, 185);
}
.bg6 {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: twinkling 2s infinite ease-in-out;
  animation-fill-mode: both;
  background: rgb(218, 13, 13);
}

.tableData /deep/ .el-button {
  font-size: 12px;
  padding: 5px;
}
.devicelistBox {
  height: 100%;
  padding: 10px 2px;
}
.area-title {
  text-align: center;
  line-height: 30px;
}
.devicelistBox .top {
  margin-bottom: 10px;
}
.search_col .el-input {
  width: 9%;
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
.devicesName {
  color: #1890ff;
  cursor: pointer;
  text-decoration: underline;
}
.devicesName:hover {
  color: blue;
}
.contentBox {
  display: flex;
  height: 100%;
}
.contentBox .areaBox {
  width: 18%;
  height: 100%;
  border-right: 1px solid #ccc;
  overflow: auto;
}
.contentBox .tableBox {
  width: 82%;
}
.contentBox .tableBox >>> .statusImg {
  vertical-align: middle;
  width: 12px;
  height: 12px;
}

.devicelistBox /deep/ .el-collapse-item__header {
  font-weight: 700;
}
.devicelistBox /deep/ .el-dialog__wrapper .el-dialog__header {
  background: #304156;
}
.devicelistBox /deep/ .el-dialog__wrapper .el-dialog__header span {
  color: #f4f4f4;
  font-size: 16px;
}
.devicelistBox /deep/ .el-dialog {
  border-radius: 5px;
  overflow: hidden;
}

.map_dialog /deep/ .el-dialog__header {
  display: none;
}
.map_dialog /deep/ .el-dialog__body {
  padding: 0px;
}
.map_dialog /deep/ .el-dialog__footer {
  padding-bottom: 10px;
}

.detail_drawer >>> .el-drawer__header {
  background: #304156;
  padding: 10px;
  color: #f4f4f4;
  font-size: 16px;
  margin-bottom: 0px;
}
.detail_drawer >>> .el-drawer__body {
  overflow-y: auto;
}
.detail_drawer >>> .el-form-item {
  margin-bottom: 0px;
}
.detail_drawer >>> .el-form-item .el-form-item__label {
  font-size: 12px;
}

.border {
  border: 1px dashed #ccc;
}
.center {
  text-align: center;
  font-weight: 700;
  line-height: 30px;
}

.areaBox >>> .el-checkbox {
  margin-right: 3px;
}
.areaBox >>> .el-tree-node__label {
  font-size: 13px;
}

.uploadItem {
  position: relative;
}
.download-btn {
  font-size: 12px;
  color: gray;
  position: absolute;
  top: 5px;
  left: 23%;
  cursor: pointer;
  text-decoration: underline;
}
.download-btn:hover {
  color: #1890ff;
}

.input-w {
  width: 50% !important;
}
</style>
