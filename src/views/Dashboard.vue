<template>
    <div :style="{ padding: '20px 20px 12px 20px' }">
        <a-row :gutter="16">
            <a-col :span="6">
                <a-card class="card">
                    <a-statistic :value="data.customers" style="margin-right: 50px">
                        <template #title>
                            <span>全部客户</span>
                            <a-tooltip placement="right">
                                <template #title>
                                    <span>客户数量，单位（人）</span>
                                </template>
                                <question-circle-two-tone style="margin-left: 5px" />
                            </a-tooltip>
                        </template>
                    </a-statistic>
                </a-card>
            </a-col>
            <a-col :span="6">
                <a-card class="card">
                    <a-statistic :value="data.contracts" style="margin-right: 50px">
                        <template #title>
                            <span>全部合同</span>
                            <a-tooltip placement="right">
                                <template #title>
                                    <span>合同数量，单位（份）</span>
                                </template>
                                <question-circle-two-tone style="margin-left: 5px" />
                            </a-tooltip>
                        </template>
                    </a-statistic>
                </a-card>
            </a-col>
            <a-col :span="6">
                <a-card class="card">
                    <a-statistic :value="data.contractAmount" style="margin-right: 50px">
                        <template #title>
                            <span>合同金额</span>
                            <a-tooltip placement="right">
                                <template #title>
                                    <span>已签订的合同金额，单位（元）</span>
                                </template>
                                <question-circle-two-tone style="margin-left: 5px" />
                            </a-tooltip>
                        </template>
                    </a-statistic>
                </a-card>
            </a-col>
            <a-col :span="6">
                <a-card class="card">
                    <a-statistic :value="data.products" style="margin-right: 50px">
                        <template #title>
                            <span>全部产品</span>
                            <a-tooltip placement="right">
                                <template #title>
                                    <span>产品数量，单位（个）</span>
                                </template>
                                <question-circle-two-tone style="margin-left: 5px" />
                            </a-tooltip>
                        </template>
                    </a-statistic>
                </a-card>
            </a-col>
        </a-row>
        <a-row :gutter="16">
            <a-col :span="15">
                <a-card class="card" style="height: 60vh;margin-top: 20px;">
                    <div style="display:flex;align-items: center;justify-content: space-between;">
                        <div style="color: #606266;font-size: 16px;font-weight: 600;">
                            <span>已签订合同金额情况</span>
                            <a-tooltip placement="right">
                                <template #title>
                                    <span>已签订合同金额，单位（元）</span>
                                </template>
                                <question-circle-two-tone style="margin-left: 5px" />
                            </a-tooltip>
                        </div>
                        <a-select v-model:value="daysRange" style="width: 120px" @focus="initChart" @change="initChart">
                            <a-select-option :value="7">最近7天</a-select-option>
                            <a-select-option :value="14">最近14天</a-select-option>
                            <a-select-option :value="30">最近30天</a-select-option>
                        </a-select>
                    </div>
                    <div id="contract" style="width: 100%; height: 360px;"></div>
                </a-card>
            </a-col>
            <a-col :span="9">
                <a-card class="card" style="height: 60vh;margin-top: 20px;">
                    <div style="color: #606266;font-size: 16px;font-weight: 600;">
                        <span>客户行业分布</span>
                        <a-tooltip placement="right">
                            <template #title>
                                <span>客户所在行业，单位（个）</span>
                            </template>
                            <question-circle-two-tone style="margin-left: 5px" />
                        </a-tooltip>
                    </div>
                    <div id="customer" style="width: 100%; height: 360px;"></div>
                </a-card>
            </a-col>
        </a-row>
    </div>
</template>

<script setup>
import { QuestionCircleTwoTone } from '@ant-design/icons-vue'
import * as echarts from "echarts";
import { reactive, ref, onBeforeMount } from 'vue';
import { getSummary } from "../api/dashboard";
import { getSubscribeInfo } from '../api/subscribe';
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue';

const daysRange = ref(7);

const router = useRouter()

const data = reactive({
    customers: 0,
    contracts: 0,
    contractAmount: 0.00,
    products: 0,
})

onBeforeMount(() => {
    subscribeInfo();
    initChart();
});

const initChart = () => {
    let param = {
        daysRange: daysRange.value
    }
    getSummary(param).then((res) => {
        // 处理无权限情况
        if (res.data.code == 403) {
            message.warning({
                content: res.data.info || '您没有权限使用该功能，请订阅专业版',
                duration: 3,
            });
            router.push('/subscribe');
            return;
        }
        
        if (res.data.code == 200) {
            data.customers = res.data.info.customers
            data.contracts = res.data.info.contracts
            data.contractAmount = res.data.info.contractAmount
            data.products = res.data.info.products
            echarts.init(document.getElementById("contract")).setOption({
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross'
                    }
                },
                legend: {
                    data: ['日合同金额','累计金额'],
                    right:10,
                    top:0
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: res.data.info.date,
                    boundaryGap: true
                },
                yAxis: [
                {
                        type: 'value',
                        name: '日合同金额',
                        position: 'left'
                },
                {
                        type: 'value',
                        name: '累计金额',
                        position: 'right'
                }
            ],
            series: [
                {
                    name: '日合同金额',
                    type: 'bar',
                    data: res.data.info.amount,
                    barWidth: '40%',
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#83bff6' },
                            { offset: 0.5, color: '#1890ff' },
                            { offset: 1, color: '#83bff6' },
                        ])
                    }
                },
                {
                    name: '累计金额',
                    type: 'line',
                    yAxisIndex: 1,
                    data: calculateCumulative(res.data.info.amount),
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 8,
                    itemStyle: {
                        width: 3,
                        color: '#ff9f7f'
                    },
                    lineStyle: {
                        color: '#ff9f7f'
                    }
                }
            ]
        });    

            echarts.init(document.getElementById("customer")).setOption({
                title: {
                    text: '客户行业分布',
                    left: 'center',
                    top:0,
                    textStyle: {
                        color: '#333',
                        fontSize: 16,
                    }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c} ({d}%)'
                },
                legend: {
                    type: 'scroll',
                    orient: 'horizontal',
                    bottom: 0,
                    left: 'center',
                    data: res.data.info.customerIndustry.map(item => item.name),
                    // 添加图例选择器
                    selector: [
                        {
                            title: '全选',
                            type: 'all',
                        },
                        {
                            title: '反选',
                            type: 'inverse'
                        }
                    ],
                    // 添加图例选择事件处理
                    selectedMode: true,
                },
                series: [
                    {
                        name: '行业分布',
                        type: 'pie',
                        radius: ['40%', '70%'],
                        center: ['50%', '50%'],
                        avoidLabelOverlap: false,
                        itemStyle: {
                            borderRadius: 10,
                            borderColor: '#fff',
                            borderWidth: 2,
                        },
                        label: {
                            show: true,
                            position: 'outside',
                            formatter: function(params){
                                // 获取当前显示的所有数据
                                const chart = echarts.getInstanceByDom(document.getElementById("customer"));
                                const series = chart.getOption().series[0];
                                const data = series.data;
                                const selected = chart.getOption().legend[0].selected || {};
                                // 计算当前显示的数据总和
                                let total = 0;
                                data.forEach(item => {
                                    if (selected[item.name] !== false) { // 如果没有被隐藏
                                        total += item.value;
                                    }
                                });
                                // 计算当前项的百分比
                                const percentage = ((params.value / total) * 100).toFixed(1);
                                return `${params.name}: ${percentage}%`;
                            },
                            fontSize: 14,
                        },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: 16,
                                fontWeight: 'bold'
                            }
                        },
                        labelLine: {
                            show: true,
                            length: 15,
                            length2: 10
                        },
                        data: res.data.info.customerIndustry,
                    }
                ]
            })
        }
    })
}

// 获取用户订阅信息
const subscribeInfo = () => {
    getSubscribeInfo().then((res) => {
        if (res.data.code == 0 && res.data.info.version == 1) {
            router.push('/result')
        }
    })
}
const calculateCumulative = (data) => {
    let cumulative = [];
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
        sum += data[i];
        cumulative.push(sum);
    }
    return cumulative;
};
</script>

<style scoped>
.card {
    border: none;
    box-shadow: 0 1px 16px 0 rgb(33 41 48 / 5%);
}
</style>