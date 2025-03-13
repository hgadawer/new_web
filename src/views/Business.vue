<template>
  <div>
    <!-- 操作栏 -->
    <div style="margin-bottom: 20px;">
      <a-input
        v-model:value="query.name"
        placeholder="业务名称"
        style="width: 250px; margin-right: 10px;">
        <template #suffix>
          <SearchOutlined style="color: rgba(0, 0, 0, 0.45)" @click="onSearchBusiness" />
        </template>
      </a-input>
      <a-button type="primary" @click="openModalForCreate">
        新增业务
      </a-button>
      <a-button type="primary" danger @click="onDeleteBusiness" :disabled="deleteDisabled" style="margin-left: 10px;">
        删除业务
      </a-button>
      <a-button type="primary" @click="onVisualizeBusiness" style="margin-left: 10px;">
        生成可视化图像
      </a-button>
    </div>

    <!-- 业务列表展示 -->
    <a-table
      rowKey="id"
      :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectedBusinessIds }"
      :columns="columns"
      :data-source="data.businessList"
      :pagination="{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        onChange: onPaginationBusiness
      }"
      :scroll="{ y: '59vh' }"
      class="ant-table-striped"
      bordered>
      <template #bodyCell="{ column, text, record }">
        <!-- 点击业务编号或编辑操作均触发修改 -->
        <template v-if="column.dataIndex === 'id'">
          <a @click="openModalForEdit(record)">{{ text }}</a>
        </template>
        <template v-else-if="column.dataIndex === 'operation'">
          <a @click="openModalForEdit(record)">编辑</a>
        </template>
        <template v-else>
          <span>{{ text }}</span>
        </template>
      </template>
    </a-table>

    <!-- 业务可视化 -->
    <div style="margin-top: 20px;" v-if="chartData">
      <div ref="chartContainer" style="width: 100%; height: 400px;"></div>
    </div>

    <!-- 业务弹出框（新增/修改统一使用） -->
    <a-modal
      v-model:visible="modalVisible"
      :title="isEditing ? '编辑业务' : '新增业务'"
      @ok="onSubmitBusiness"
      @cancel="closeModal"
      okText="保存"
      cancelText="取消"
      width="800px">
      <a-form ref="businessFormRef" :model="business" layout="vertical" :rules="rules">
        <a-row :gutter="16">
          <a-col :span="12">
            <!-- 修改时显示业务编号；新增时为空 -->
            <a-form-item label="业务编号" name="id">
              <a-input v-model:value="business.id" :disabled="true" :placeholder="isEditing ? '' : '自动生成业务编号'" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <!-- 新增时允许输入业务名称，修改时禁用 -->
            <a-form-item label="业务名称" name="name">
              <a-input v-model:value="business.name" :disabled="isEditing" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <!-- 新增时允许选择客户，修改时禁用 -->
            <a-form-item label="客户名称" name="cid">
              <a-select
                v-model:value="business.cid"
                style="width: 100%"
                placeholder="请选择客户"
                :fieldNames="{ label: 'name', value: 'id' }"
                :options="data.customerOption"
                @focus="getCustomerOption"
                :disabled="isEditing">
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="业务金额" name="amount">
              <a-input v-model:value="business.amount" style="width: 100%" :disabled="true" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="业务开始时间" name="beginTime">
              <a-date-picker
                v-model:value="business.beginTime"
                placeholder="选择日期"
                style="width: 100%"
                format="YYYY-MM-DD HH:mm:ss"
                valueFormat="YYYY-MM-DD HH:mm:ss" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="业务结束时间" name="overTime">
              <a-date-picker
                v-model:value="business.overTime"
                placeholder="选择日期"
                style="width: 100%"
                format="YYYY-MM-DD HH:mm:ss"
                valueFormat="YYYY-MM-DD HH:mm:ss" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="业务状态" name="status">
              <a-select v-model:value="business.status" placeholder="请选择">
                <a-select-option :value="1">进行中</a-select-option>
                <a-select-option :value="2">已完成</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="备注" name="remarks">
              <a-input v-model:value="business.remarks" />
            </a-form-item>
          </a-col>
        </a-row>
        <!-- 已选产品列表 -->
        <a-form-item label="已选产品">
          <a-button type="primary" @click="onAddProduct" style="float: right; margin-bottom: 10px;">
            添加产品
          </a-button>
          <a-table rowKey="id" :columns="productColumns" :data-source="business.productlist" bordered>
            <template #bodyCell="{ column, text, record }">
              <template v-if="column.dataIndex === 'name'">
                <span>{{ text }}</span>
              </template>
              <template v-if="column.dataIndex === 'price'">
                <span style="color: #ff991f">{{ text }}</span>
              </template>
              <template v-if="column.dataIndex === 'count'">
                <a-input-number v-model:value="record.count" @change="calculatedAmount" />
              </template>
              <template v-if="column.dataIndex === 'total'">
                <span>{{ (record.price * record.count).toFixed(2) }}</span>
              </template>
              <template v-if="column.dataIndex === 'operation'">
                <a @click="delProduct(record)">删除</a>
              </template>
            </template>
          </a-table>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 产品选择模态框 -->
    <a-modal v-model:visible="productListVisible" title="选择产品" @ok="onConfirmProduct" @cancel="onCancelProductList" okText="确定" cancelText="取消" width="800px">
      <a-table rowKey="id"
        :row-selection="{ selectedRowKeys: selectedProductIds, onChange: onSelectedProductIds }"
        :columns="productListColumns" :data-source="productList"
        :pagination="{ current: 1, pageSize: 10 }"
        :scroll="{ y: '40vh' }"
        bordered>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, createVNode } from 'vue';
import { SearchOutlined } from '@ant-design/icons-vue';
import moment from 'moment';
import { message, Modal } from 'ant-design-vue';
import * as echarts from 'echarts';
// 业务相关接口
import { createBusiness, updateBusiness, deleteBusiness, queryBusinessList, queryBusinessInfo } from '../api/business';
// 获取客户信息接口
import { queryAllCustomerIdsAndNames } from '../api/customer';
// 获取产品列表接口
import { queryProductList } from '../api/product';

const modalVisible = ref(false);
const isEditing = ref(false);

const activeTab = ref("create");

const query = reactive({
  id: undefined,
  name: ''
});

const columns = [
  { title: '业务编号', dataIndex: 'id', width: 100, fixed: 'left', ellipsis: true },
  { title: '业务名称', dataIndex: 'name', width: 150, fixed: 'left', ellipsis: true },
  { title: '客户名称', dataIndex: 'cname', width: 240 },
  { title: '业务金额', dataIndex: 'amount', width: 100 },
  { title: '业务开始时间', dataIndex: 'beginTime', width: 185, customRender: ({ text }) => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '' },
  { title: '业务结束时间', dataIndex: 'overTime', width: 185, customRender: ({ text }) => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '' },
  { title: '备注', dataIndex: 'remarks', width: 240, ellipsis: true },
  { title: '业务状态', dataIndex: 'status', width: 100, ellipsis: true },
  { title: '创建时间', dataIndex: 'created', width: 185, customRender: ({ text }) => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '' },
  { title: '更新时间', dataIndex: 'updated', width: 185, customRender: ({ text }) => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '' }
];

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
});

const data = reactive({
  businessList: [],
  customerOption: []
});

const business = reactive({
  id: undefined,
  name: undefined,
  amount: undefined,
  beginTime: undefined,
  overTime: undefined,
  cid: undefined,
  remarks: undefined,
  status: undefined,
  productlist: []
});

const rules = {
  name: [{ required: true, message: '请输入业务名称', trigger: 'blur' }],
  cid: [{ required: true, message: '请选择客户', trigger: 'blur' }],
  status: [{ required: true, message: '请选择业务状态', trigger: 'change' }]
};

const businessFormRef = ref();
const selectedRowKeys = ref([]);
const deleteDisabled = ref(true);
const chartData = ref(null);
const chartInstance = ref(null);
const chartContainer = ref(null);

// 产品选择相关
const productListVisible = ref(false);
const selectedProductIds = ref([]);
const productList = ref([]);

const productColumns = [
  { title: '产品名称', dataIndex: 'name', width: 150 },
  { title: '产品类别', dataIndex: 'type', width: 100 },
  { title: '单位', dataIndex: 'unit', width: 80 },
  { title: '价格', dataIndex: 'price', width: 100 },
  { title: '数量', dataIndex: 'count', width: 100 },
  { title: '合计', dataIndex: 'total', width: 100 },
  { title: '操作', dataIndex: 'operation', width: 100 }
];

const productListColumns = [
  { title: '产品名称', dataIndex: 'name', width: 150 },
  { title: '产品类别', dataIndex: 'type', width: 100 },
  { title: '单位', dataIndex: 'unit', width: 80 },
  { title: '价格', dataIndex: 'price', width: 100 },
  { title: '产品描述', dataIndex: 'description', width: 200, ellipsis: true }
];

const loadBusinessList = () => {
  let query_params = {
    name: query.name,
    pageNum: pagination.current,
    pageSize: pagination.pageSize
  };
  queryBusinessList(query_params).then(res => {
    if (res.data.code == 200) {
      pagination.total = res.data.info.total;
      data.businessList = res.data.info.list;
    }
  });
};

onMounted(() => {
  loadBusinessList();
});

const onSearchBusiness = () => {
  pagination.current = 1;
  loadBusinessList();
};

// 新增业务：清空表单数据并进入新增状态
const openModalForCreate = () => {
  isEditing.value = false;
  business.id = undefined;
  business.name = '';
  business.cid = undefined;
  business.amount = '';
  business.beginTime = '';
  business.overTime = '';
  business.remarks = '';
  business.status = undefined;
  business.productlist = [];
  modalVisible.value = true;
};

// 修改业务：点击业务编号或编辑时触发，加载指定业务信息
const openModalForEdit = (row) => {
  queryBusinessInfo({ id: row.id }).then(res => {
    if (res.data.code == 200) {
      let b = res.data.info;
      business.id = b.id;
      business.name = b.name;
      business.cid = b.cid;
      business.amount = b.amount;
      business.beginTime = b.beginTime;
      business.overTime = b.overTime;
      business.remarks = b.remarks;
      business.status = b.status;
      business.productlist = typeof b.productlist === 'string' ? JSON.parse(b.productlist) : b.productlist;

      // 确保 productlist 为数组
      // business.productlist = Array.isArray(b.productlist) ? b.productlist : [];
      isEditing.value = true;
      modalVisible.value = true;
      message.info('正在编辑业务信息');
    } else {
      message.error('加载业务信息失败');
    }
  }).catch(() => {
    message.error('加载业务信息出错');
  });
};

const onSubmitBusiness = () => {
  businessFormRef.value.validateFields().then(() => {
    let params = {
      name: business.name,
      cid: business.cid,
      amount: business.amount,
      beginTime: business.beginTime,
      overTime: business.overTime,
      remarks: business.remarks,
      status: business.status,
      productlist: business.productlist
    };
    if (isEditing.value) {
      updateBusiness({
        id: business.id,
        remarks: business.remarks,
        beginTime: business.beginTime,
        overTime: business.overTime,
        status: business.status,
        productlist: business.productlist
      }).then(res => {
        if (res.data.code == 200) {
          message.success('业务修改成功');
          modalVisible.value = false;
          businessFormRef.value.resetFields();
          business.productlist = [];
          loadBusinessList();
        } else {
          message.error('业务修改失败');
        }
      });
    } else {
      createBusiness(params).then(res => {
        if (res.data.code === 200) {
          message.success('业务创建成功');
          modalVisible.value = false;
          businessFormRef.value.resetFields();
          business.productlist = [];
          loadBusinessList();
        } else {
          message.error(res.data.msg);
        }
      }).catch(() => {
        message.error('必填字段未填写或创建失败');
      });
    }
  });
};

const closeModal = () => {
  modalVisible.value = false;
  isEditing.value = false;
  businessFormRef.value.resetFields();
  business.productlist = [];
};

const onDeleteBusiness = () => {
  Modal.confirm({
    title: '确定删除选中的 ' + selectedRowKeys.value.length + ' 项业务吗?',
    icon: createVNode(SearchOutlined),
    centered: true,
    cancelText: '取消',
    okText: '确定',
    onOk() {
      let params = { ids: selectedRowKeys.value };
      deleteBusiness(params).then(res => {
        if (res.data.code == 200) {
          loadBusinessList();
          selectedRowKeys.value = [];
          deleteDisabled.value = true;
          message.success('业务删除成功');
        } else {
          message.error('业务删除失败');
        }
      });
    },
    onCancel() {}
  });
};

const onPaginationBusiness = (page) => {
  pagination.current = page;
  loadBusinessList();
};

const onSelectedBusinessIds = (selectedKeys) => {
  selectedRowKeys.value = selectedKeys;
  deleteDisabled.value = selectedKeys.length === 0;
};

const onVisualizeBusiness = () => {
  chartData.value = {
    regions: ['华东', '华北', '华南', '西南', '西北'],
    expenditures: [12000, 9000, 7000, 5000, 3000]
  };
  nextTick(() => {
    if (chartContainer.value) {
      chartInstance.value = echarts.init(chartContainer.value);
      let option = {
        title: { text: '不同地区用户支出' },
        tooltip: {},
        xAxis: { data: chartData.value.regions },
        yAxis: {},
        series: [{ name: '支出', type: 'bar', data: chartData.value.expenditures }]
      };
      chartInstance.value.setOption(option);
    }
  });
};

const getCustomerOption = () => {
  queryAllCustomerIdsAndNames().then(res => {
    if (res.data.code == 200) {
      data.customerOption = res.data.info;
    }
  });
};

const onAddProduct = () => {
  productListVisible.value = true;
  queryProductList({ pageNum: 1, pageSize: 10 }).then(res => {
    if (res.data.code === 200) {
      productList.value = res.data.info.list.filter(prod => prod.status !== 2);
    }
  });
};

const onSelectedProductIds = (keys) => {
  selectedProductIds.value = keys;
};

const onConfirmProduct = () => {
  const selectedProducts = productList.value.filter(prod => selectedProductIds.value.includes(prod.id));
  selectedProducts.forEach(prod => {
    if (!business.productlist.some(item => item.id === prod.id)) {
      business.productlist.push({ ...prod, count: 1 });
    }
  });
  calculatedAmount();
  productListVisible.value = false;
  selectedProductIds.value = [];
};

const onCancelProductList = () => {
  productListVisible.value = false;
  selectedProductIds.value = [];
};

const delProduct = (record) => {
  const index = business.productlist.findIndex(item => item.id === record.id);
  if (index !== -1) {
    business.productlist.splice(index, 1);
    calculatedAmount();
  }
};

const calculatedAmount = () => {
  let total = 0;
  business.productlist.forEach(prod => {
    total += prod.price * prod.count;
  });
  business.amount = total.toFixed(2);
};
</script>

<style scoped>
.ant-table-striped ::v-deep(.table-striped) td {
  background-color: #fafafa;
}
</style>
