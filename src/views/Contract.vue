<template>
  <div class="contract-container">
    <a-card class="card" :bordered="false">
      <template #title>
        <div class="card-title">
          <span class="title-text">合同管理</span>
          <a-tag color="blue">企业级</a-tag>
        </div>
      </template>
      
      <!-- 搜索区域 -->
      <a-form layout="inline" :model="searchForm" class="search-form">
        <a-row :gutter="16" style="width: 100%">
          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-form-item label="合同名称">
              <a-input v-model:value="searchForm.name" placeholder="请输入合同名称" allowClear />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-form-item label="客户名称">
              <a-select
                v-model:value="searchForm.customerId"
                style="width: 100%"
                placeholder="请选择客户"
                allowClear
                :fieldNames="{ label: 'name', value: 'id' }"
                :options="customerOptions"
                @focus="getCustomerOptions"
              >
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-form-item label="合同状态">
              <a-select v-model:value="searchForm.status" style="width: 100%" placeholder="请选择状态" allowClear>
                <a-select-option :value="1">
                  <a-badge status="success" text="已签" />
                </a-select-option>
                <a-select-option :value="2">
                  <a-badge status="warning" text="未签" />
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-form-item label="签订日期">
              <a-range-picker v-model:value="searchForm.dateRange" style="width: 100%" format="YYYY-MM-DD" valueFormat="YYYY-MM-DD" />
            </a-form-item>
          </a-col>
        </a-row>
        <div class="search-buttons">
          <a-button type="primary" @click="searchContracts">
            <template #icon><search-outlined /></template>
            查询
          </a-button>
          <a-button style="margin-left: 8px" @click="resetSearch">
            <template #icon><reload-outlined /></template>
            重置
          </a-button>
        </div>
      </a-form>

      <a-divider style="margin: 16px 0" />

      <!-- 操作按钮区域 -->
      <div class="table-operations">
        <div class="left-operations">
          <a-button type="primary" @click="showAddModal">
            <template #icon><plus-outlined /></template>
            新增合同
          </a-button>
          <a-button style="margin-left: 8px" @click="exportContracts">
            <template #icon><export-outlined /></template>
            导出
          </a-button>
        </div>
        <div class="right-operations">
          <a-tooltip title="刷新数据">
            <a-button shape="circle" @click="fetchContractList">
              <template #icon><sync-outlined /></template>
            </a-button>
          </a-tooltip>
        </div>
      </div>

      <!-- 表格区域 -->
      <a-table
        :columns="columns"
        :data-source="contractList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        rowKey="id"
        :scroll="{ x: 1200 }"
        :bordered="false"
        size="middle"
        class="contract-table"
      >
        <!-- 客户名称列 -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'customerName'">
            <a @click="onEdit(record)">{{ record.customerName }}</a>
          </template>
          
          <!-- 合同金额列 -->
          <template v-if="column.dataIndex === 'amount'">
            <span class="amount">¥ {{ formatAmount(record.amount) }}</span>
          </template>
          
          <!-- 合同状态列 -->
          <template v-if="column.dataIndex === 'status'">
            <a-tag :color="record.status === 1 ? 'success' : 'warning'" class="status-tag">
              <template v-if="record.status === 1">
                <check-circle-outlined /> 已签
              </template>
              <template v-else>
                <clock-circle-outlined /> 未签
              </template>
            </a-tag>
          </template>
          
          <!-- 操作列 -->
          <template v-if="column.dataIndex === 'operation'">
            <div class="operation-buttons">
              <a-button type="link" size="small" @click="editContract(record)">
                <template #icon><edit-outlined /></template>
                编辑
              </a-button>
              <a-divider type="vertical" />
              <a-button 
                type="link" 
                size="small" 
                @click="changeStatus(record)"
                :disabled="record.status === 1"
              >
                <template #icon><check-outlined /></template>
                {{ record.status === 1 ? '已签订' : '标记为已签' }}
              </a-button>
              <a-divider type="vertical" />
              <a-popconfirm
                title="确定要删除此合同吗?"
                ok-text="是"
                cancel-text="否"
                @confirm="deleteContractItem(record.id)"
              >
                <a-button type="link" size="small" danger>
                  <template #icon><delete-outlined /></template>
                  删除
                </a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
        
        <!-- 空数据显示 -->
        <template #emptyText>
          <div class="empty-container">
            <inbox-outlined style="font-size: 48px; color: #ccc" />
            <p>暂无合同数据</p>
            <a-button type="primary" @click="showAddModal">添加合同</a-button>
          </div>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑合同弹窗 -->
    <a-modal
      :title="modalTitle"
      :visible="modalVisible"
      :confirm-loading="confirmLoading"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      width="800px"
      :maskClosable="false"
      :destroyOnClose="true"
    >
      <a-form
        ref="contractFormRef"
        :model="contractForm"
        :rules="rules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-tabs default-active-key="1">
          <a-tab-pane key="1" tab="基本信息">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="合同名称" name="name">
                  <a-input v-model:value="contractForm.name" placeholder="请输入合同名称" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="客户" name="customerId">
                  <a-select
                    v-model:value="contractForm.customerId"
                    placeholder="请选择客户"
                    :fieldNames="{ label: 'name', value: 'id' }"
                    :options="customerOptions"
                    @focus="getCustomerOptions"
                    :disabled="isEditing"
                  >
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="签订日期" name="signDate">
                  <a-date-picker
                    v-model:value="contractForm.signDate"
                    placeholder="选择日期"
                    style="width: 100%"
                    format="YYYY-MM-DD"
                    valueFormat="YYYY-MM-DD"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="到期日期" name="expireDate">
                  <a-date-picker
                    v-model:value="contractForm.expireDate"
                    placeholder="选择日期"
                    style="width: 100%"
                    format="YYYY-MM-DD"
                    valueFormat="YYYY-MM-DD"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="合同金额" name="amount">
                  <a-input-number
                    v-model:value="contractForm.amount"
                    placeholder="请输入金额"
                    style="width: 100%"
                    :precision="2"
                    :min="0"
                    :formatter="value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                    :parser="value => value.replace(/\¥\s?|(,*)/g, '')"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="合同状态" name="status">
                  <a-select v-model:value="contractForm.status" placeholder="请选择状态">
                    <a-select-option :value="1">
                      <a-badge status="success" text="已签" />
                    </a-select-option>
                    <a-select-option :value="2">
                      <a-badge status="warning" text="未签" />
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
          </a-tab-pane>
          <a-tab-pane key="2" tab="详细信息">
            <a-form-item label="合同描述" name="description">
              <a-textarea
                v-model:value="contractForm.description"
                placeholder="请输入合同描述"
                :rows="4"
              />
            </a-form-item>
            <a-form-item label="备注" name="remarks">
              <a-textarea
                v-model:value="contractForm.remarks"
                placeholder="请输入备注信息"
                :rows="2"
              />
            </a-form-item>
          </a-tab-pane>
        </a-tabs>
      </a-form>
      <template #footer>
        <a-space>
          <a-button @click="handleModalCancel">取消</a-button>
          <a-button type="primary" :loading="confirmLoading" @click="handleModalOk">
            {{ isEditing ? '保存修改' : '创建合同' }}
          </a-button>
        </a-space>
      </template>
    </a-modal>
    <!-- 客户详情弹窗 -->
    <a-modal v-model:visible="customervisible" :title="title" :footer="null" width="800px" :centered="true">
      <div style="height: 55vh;overflow-y: scroll;padding: 0 15px;">
        <a-form layout="vertical">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="客户名称">
                <a-input v-model:value="customer.name" disabled />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="客户来源">
                <a-select v-model:value="customer.source" disabled>
                  <a-select-option :value="1">官网</a-select-option>
                  <a-select-option :value="2">搜索引擎</a-select-option>
                  <a-select-option :value="3">广告</a-select-option>
                  <a-select-option :value="4">社交媒体</a-select-option>
                  <a-select-option :value="5">电话咨询</a-select-option>
                  <a-select-option :value="6">邮件咨询</a-select-option>
                  <a-select-option :value="7">客户介绍</a-select-option>
                  <a-select-option :value="8">合作伙伴</a-select-option>
                  <a-select-option :value="9">其他</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="手机号">
                <a-input v-model:value="customer.phone" disabled />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="邮箱">
                <a-input v-model:value="customer.email" disabled />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="客户行业">
                <a-select v-model:value="customer.industry" disabled>
                  <a-select-option :value="1">IT/互联网/通信</a-select-option>
                  <a-select-option :value="2">金融/银行/保险</a-select-option>
                  <a-select-option :value="3">教育/培训</a-select-option>
                  <a-select-option :value="4">医疗/健康</a-select-option>
                  <a-select-option :value="5">制造/生产</a-select-option>
                  <a-select-option :value="6">零售/消费品</a-select-option>
                  <a-select-option :value="7">能源/环保</a-select-option>
                  <a-select-option :value="8">政府/非营利组织</a-select-option>
                  <a-select-option :value="9">其他</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="客户级别">
                <a-select v-model:value="customer.level" disabled>
                  <a-select-option :value="1">A（重要）</a-select-option>
                  <a-select-option :value="2">B（普通）</a-select-option>
                  <a-select-option :value="3">C（低价值）</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="所在地区">
                <a-cascader v-model:value="customer.region" :options="regionData" disabled />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="详细地址">
                <a-input v-model:value="customer.address" disabled />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="备注">
                <a-textarea v-model:value="customer.remarks" :auto-size="{ minRows: 3, maxRows: 3 }" disabled />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="成交状态">
                <a-select v-model:value="customer.status" disabled>
                  <a-select-option :value="1">
                    <a-badge status="success" text="已成交" />
                  </a-select-option>
                  <a-select-option :value="2">
                    <a-badge status="warning" text="未成交" />
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
        <div style="text-align: center; margin-top: 20px;">
          <a-button @click="customervisible = false">关闭</a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, createVNode } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  PlusOutlined, 
  ExportOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  SyncOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  InboxOutlined
} from '@ant-design/icons-vue';
import { 
  queryContractList, 
  queryContractInfo, 
  createContract, 
  updateContract, 
  deleteContract, 
  contractExport,
  updateContractStatus
} from '../api/contract';
import { queryAllCustomerIdsAndNames,queryCustomerInfo} from '../api/customer';
import moment from 'moment';
import regionData from '../assets/region'; // 导入地区数据

// 表格列定义
const columns = [
  {
    title: '合同编号',
    dataIndex: 'id',
    width: 100,
    sorter: true,
  },
  {
    title: '合同名称',
    dataIndex: 'name',
    width: 200,
    ellipsis: true,
  },
  {
    title: '客户名称',
    dataIndex: 'customerName',
    width: 180,
    ellipsis: true,
  },
  {
    title: '合同金额',
    dataIndex: 'amount',
    width: 120,
    sorter: true,
  },
  {
    title: '签订日期',
    dataIndex: 'signDate',
    width: 120,
    sorter: true,
  },
  {
    title: '到期日期',
    dataIndex: 'expireDate',
    width: 120,
    sorter: true,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    filters: [
      { text: '已签', value: 1 },
      { text: '未签', value: 2 },
    ],
  },
  {
    title: '创建时间',
    dataIndex: 'created',
    width: 150,
    sorter: true,
    customRender: ({ text }) => {
      return text ? moment(text).format('YYYY-MM-DD HH:mm') : '';
    }
  },
  {
    title: '操作',
    dataIndex: 'operation',
    fixed: 'right',
    width: 220,
  },
];

// 状态变量
const loading = ref(false);
const contractList = ref([]);
const customerOptions = ref([]);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条记录`,
});

// 搜索表单
const searchForm = reactive({
  name: '',
  customerId: undefined,
  status: undefined,
  dateRange: [],
});

// 合同表单
const contractFormRef = ref();
const contractForm = reactive({
  id: undefined,
  name: '',
  customerId: undefined,
  signDate: '',
  expireDate: '',
  amount: 0,
  description: '',
  remarks: '',
  status: 2, // 默认未签
});

// 弹窗控制
const modalVisible = ref(false);
const confirmLoading = ref(false);
const modalTitle = ref('新增合同');
const isEditing = ref(false);

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入合同名称', trigger: 'blur' }],
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  signDate: [{ required: true, message: '请选择签订日期', trigger: 'change' }],
  expireDate: [{ required: true, message: '请选择到期日期', trigger: 'change' }],
  amount: [{ required: true, message: '请输入合同金额', trigger: 'blur' }],
  status: [{ required: true, message: '请选择合同状态', trigger: 'change' }],
};

// 生命周期钩子
onMounted(() => {
  fetchContractList();
  getCustomerOptions();
});

// 获取合同列表
const fetchContractList = () => {
  loading.value = true;
  
  // 处理日期范围
  let params = { ...searchForm };
  if (params.dateRange && params.dateRange.length === 2) {
    params.startDate = params.dateRange[0]; // 已经是 'YYYY-MM-DD' 格式
    params.endDate = params.dateRange[1];   // 已经是 'YYYY-MM-DD' 格式
  }
  delete params.dateRange;
  
  // 添加分页参数
  params.page = pagination.current;
  params.pageSize = pagination.pageSize;
  
  queryContractList(params).then(res => {
    console.log(params);
    loading.value = false;
    if (res.data.code === 200) {
      contractList.value = res.data.info.list;
      pagination.total = res.data.info.total;
    } else {
      message.error('获取合同列表失败');
    }
  }).catch(() => {
    loading.value = false;
    message.error('获取合同列表出错');
  });
};

// 获取客户选项
const getCustomerOptions = () => {
  if (customerOptions.value.length > 0) return;
  
  queryAllCustomerIdsAndNames().then(res => {
    if (res.data.code === 200) {
      customerOptions.value = res.data.info;
    }
  });
};

// 搜索合同
const searchContracts = () => {
  pagination.current = 1;
  fetchContractList();
};

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    if (key === 'dateRange') {
      searchForm[key] = [];
    } else {
      searchForm[key] = undefined;
    }
  });
  pagination.current = 1;
  fetchContractList();
};

// 表格变化处理
const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  
  // 处理排序
  if (sorter && sorter.field) {
    searchForm.sortField = sorter.field;
    searchForm.sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';
  } else {
    searchForm.sortField = undefined;
    searchForm.sortOrder = undefined;
  }
  
  // 处理筛选
  if (filters && filters.status && filters.status.length > 0) {
    searchForm.status = filters.status[0];
  }
  
  fetchContractList();
};
// 客户属性
let customer = reactive({
    id: undefined,
    name: undefined,
    source: undefined,
    phone: undefined,
    email: undefined,
    industry: undefined,
    level: undefined,
    remarks: undefined,
    region: undefined,
    address: undefined,
    status: undefined,
});
const title = ref('');
const customervisible = ref(false);
const disabled = ref(true)
const operation = ref(0);
const customerFormRef = ref();
const visibleMail = ref(false)
// 点击客户名称
const onEdit = (row) => {
    title.value = '查看客户'
    operation.value = 2
    let param = { id: row.customerId }
    queryCustomerInfo(param).then((res) => {
        if (res.data.code == 200) {
            let p = res.data.info
            customer.id = p.id
            customer.name = p.name
            customer.source = p.source
            customer.phone = p.phone
            customer.email = p.email
            customer.industry = p.industry
            customer.level = p.level
            customer.remarks = p.remarks
            customer.region = p.region
            customer.region = p.region.split(',')
            customer.address = p.address
            customer.status = p.status
        }
    })
    customervisible.value = true
}
// 显示新增弹窗
const showAddModal = () => {
  resetContractForm();
  modalTitle.value = '新增合同';
  isEditing.value = false;
  modalVisible.value = true;
};

// 编辑合同
const editContract = (record) => {
  resetContractForm();
  modalTitle.value = '编辑合同';
  isEditing.value = true;
  
  // 获取合同详情
  queryContractInfo({ id: record.id }).then(res => {
    if (res.data.code == 200) {
      const contractData = res.data.info;
      contractForm.id = contractData.id;
      contractForm.name = contractData.name;
      contractForm.customerId = contractData.customerId;
      contractForm.signDate = contractData.signDate;
      contractForm.expireDate = contractData.expireDate;
      contractForm.amount = contractData.amount;
      contractForm.description = contractData.description;
      contractForm.remarks = contractData.remarks;
      contractForm.status = contractData.status;
      
      modalVisible.value = true;
    } else {
      message.error('获取合同详情失败');
    }
  }).catch(() => {
    message.error('获取合同详情出错');
  });
};

// 重置合同表单
const resetContractForm = () => {
  if (contractFormRef.value) {
    contractFormRef.value.resetFields();
  }
  
  contractForm.id = undefined;
  contractForm.name = '';
  contractForm.customerId = undefined;
  contractForm.signDate = '';
  contractForm.expireDate = '';
  contractForm.amount = 0;
  contractForm.description = '';
  contractForm.remarks = '';
  contractForm.status = 2; // 默认未签
};

// 弹窗确认
const handleModalOk = () => {
  contractFormRef.value.validate().then(() => {
    confirmLoading.value = true;
    
    // 构建请求参数
    const params = { ...contractForm };
    
    // 根据是否编辑模式选择API
    const apiCall = isEditing.value 
      ? updateContract(params) 
      : createContract(params);
    
    apiCall.then(res => {
      confirmLoading.value = false;
      if (res.data.code === 200) {
        message.success({
          content: isEditing.value ? '合同更新成功' : '合同创建成功',
        });
        modalVisible.value = false;
        fetchContractList();
      } else {
        message.error(res.data.msg || (isEditing.value ? '合同更新失败' : '合同创建失败'));
      }
    }).catch(error => {
      confirmLoading.value = false;
      message.error(error.message || (isEditing.value ? '合同更新出错' : '合同创建出错'));
    });
  }).catch(error => {
    console.log('表单验证失败:', error);
  });
};

// 弹窗取消
const handleModalCancel = () => {
  modalVisible.value = false;
};

// 删除合同
const deleteContractItem = (id) => {
  deleteContract({ id }).then(res => {
    if (res.data.code === 200) {
      message.success({
        content: '合同删除成功',
      });
      fetchContractList();
    } else {
      message.error(res.data.msg || '合同删除失败');
    }
  }).catch(() => {
    message.error('合同删除出错');
  });
};

// 更改合同状态
const changeStatus = (record) => {
  Modal.confirm({
    title: '确认操作',
    icon: createVNode(ExclamationCircleOutlined),
    content: '确定要将此合同标记为已签吗？',
    okText: '确定',
    cancelText: '取消',
    onOk() {
      updateContractStatus({ id: record.id, status: 1 }).then(res => {
        if (res.data.code === 200) {
          message.success({
            content: '合同状态更新成功',
          });
          fetchContractList();
        } else {
          message.error(res.data.msg || '合同状态更新失败');
        }
      }).catch(() => {
        message.error('合同状态更新出错');
      });
    },
  });
};


// 格式化金额
const formatAmount = (amount) => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 导出合同数据
const exportContracts = () => {
  // 处理日期范围
  let params = { ...searchForm };
  if (params.dateRange && params.dateRange.length === 2) {
    params.startDate = params.dateRange[0] ? moment(params.dateRange[0]).format('YYYY-MM-DD') : undefined;
    params.endDate = params.dateRange[1] ? moment(params.dateRange[1]).format('YYYY-MM-DD') : undefined;
  }
  delete params.dateRange;
  
  contractExport().then((res) => {
        console.log('后端返回数据:', ); // 调试用，检查实际返回结构

        try {
            const { data: base64Data, fileName } = res.data.info
            
            if (!base64Data || !fileName) {
                throw new Error('返回数据中缺少data或fileName')
            }

            // 解码Base64
            const byteCharacters = atob(base64Data)
            const byteNumbers = new Array(byteCharacters.length)
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i)
            }
            const byteArray = new Uint8Array(byteNumbers)
            
            // 创建Blob，使用更精确的MIME类型
            const blob = new Blob([byteArray], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            })
            
            // 下载文件
            const a = document.createElement('a')
            a.setAttribute("download", fileName)
            a.href = window.URL.createObjectURL(blob)
            a.click()
            window.URL.revokeObjectURL(a.href)
            
            message.success('导出成功')
        } catch (error) {
            console.error('导出处理错误:', error)
            message.error('导出失败：' + error.message)
        }
    }).catch((error) => {
        console.error('请求失败:', error)
        message.error('导出失败：' + error.message)
    })
};
</script>

<style scoped>
.contract-container {
  padding: 20px;
}

.card {
  margin-bottom: 20px;
  box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16), 
              0 3px 6px 0 rgba(0, 0, 0, 0.12), 
              0 5px 12px 4px rgba(0, 0, 0, 0.09);
}

.card-title {
  display: flex;
  align-items: center;
}

.title-text {
  font-size: 16px;
  font-weight: 600;
  margin-right: 10px;
}

.search-form {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.search-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  width: 100%;
}

.table-operations {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.left-operations, .right-operations {
  display: flex;
  align-items: center;
}

.contract-table {
  margin-top: 16px;
}

.status-tag {
  display: flex;
  align-items: center;
  gap: 4px;
}

.operation-buttons {
  display: flex;
  align-items: center;
}

.amount {
  font-family: 'Arial', sans-serif;
  font-weight: 500;
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.empty-container p {
  margin: 16px 0;
  color: #999;
}

:deep(.ant-table-pagination.ant-pagination) {
  margin: 16px 0;
}

:deep(.ant-form-item) {
  margin-bottom: 16px;
}

:deep(.ant-tabs-nav) {
  margin-bottom: 16px;
}

:deep(.ant-card-head) {
  border-bottom: 1px solid #f0f0f0;
  padding: 0 16px;
}

:deep(.ant-card-body) {
  padding: 16px;
}
</style>
