<template>
    <div :style="{ padding: '20px 20px 12px 20px' }">
        <a-row :gutter="30">
            <a-col :span="12">
                <a-card :class="activedClass[0]" :bordered="false">
                    <span class="member-tag" style="color: #33B9FE;">基础版</span>
                    <h2 class="title">免费
                        <check-circle-filled v-if="ver == 1" class="icon" />
                    </h2>
                    <div class="content">满足基础功能需求，永久免费</div>
                    <a-divider />
                    <div class="subscribe-list" v-for="item in ['客户管理', '合同管理', '产品管理']">
                        <check-circle-filled style="color: #33B9FE;font-size: 20px;;" />
                        <span style="margin-left: 10px;">{{ item }}</span>
                    </div>
                    <br />
                    <a-button size="large" class="btn-free" shape="round">免费使用</a-button><br />
                </a-card>
            </a-col>
            <a-col :span="12">
                <a-card :class="activedClass[1]" :bordered="false">
                    <span class="member-tag" style="color: #3788FF;">专业版</span>
                    <h2 class="title">按订阅时长付费</h2>
                    <div class="content">能力不设限，新功能优先体验</div>
                    <a-divider />
                    <a-row :gutter="0">
                        <a-col :span="8">
                            <div class="subscribe-list" v-for="item in ['客户管理', '合同管理', '产品管理']">
                                <check-circle-filled style="color: #33B9FE;font-size: 20px;;" />
                                <span style="margin-left: 10px;">{{ item }}</span>
                            </div>
                        </a-col>
                        <a-col :span="8">
                            <div class="subscribe-list" v-for="item in ['仪表盘功能', '邮件服务配置', '邮件发送功能']">
                                <check-circle-filled style="color: #476FFF;font-size: 20px;;" />
                                <span style="margin-left: 10px;">{{ item }}</span>
                            </div>
                        </a-col>
                    </a-row>
                    <br />
                    <a-button v-if="version == 1" type="primary" size="large" class="btn-buy" @click="onBuy"
                        shape="round" :disabled="disabled">立即购买</a-button>
                    <a-button v-if="version == 2" type="primary" size="large" class="btn-buy" shape="round"
                        >
                        当前为专业版，无需再次支付
                    </a-button><br />
                    <!-- 移除到期时间显示 -->
                </a-card>
            </a-col>
        </a-row>
        <a-modal v-model:visible="visible" title="选择订阅类型" @ok="onPay" @cancel="onCancel" cancelText="取消" okText="支付"
            width="600px" :centered="true">
            <div style="height: 45vh;overflow-y: scroll;padding: 0 15px;">
                <a-alert message="支付提示"
                    description="点击支付后，会跳转到支付宝支付页面。您可以使用支付宝沙箱环境的账户名 emrpqt1589@sandbox.com 和 登录密码/支付密码 111111，完成支付。"
                    type="info" show-icon /><br />
                <a-form ref="subscribeFormRef" :model="subscribe" name="subscribe" :rules="rules">
                    <a-row :gutter="16">
                        <a-col :span="24">
                            <!-- 移除订阅时长选择，改为一次性付费 -->
                            <a-form-item label="专业版特权" name="features">
                                <div>永久使用专业版全部功能</div>
                            </a-form-item>
                            <a-form-item label="支付方式" name="payMode">
                                <a-radio-group v-model:value="subscribe.payMode">
                                    <a-radio :value="1">支付宝</a-radio>
                                    <a-radio :value="2">微信</a-radio>
                                </a-radio-group>
                            </a-form-item>
                            <a-form-item label="合计支付" name="payment">
                                <span style="color: #ff991f;font-size: 18px;font-weight: 550;">￥299</span>
                            </a-form-item>
                        </a-col>
                    </a-row>
                </a-form>
            </div>
        </a-modal>
    </div>
</template>

<script setup>
import { ref, reactive, onBeforeMount } from 'vue';
import { CheckCircleFilled } from '@ant-design/icons-vue';
import { subscribePay, getSubscribeInfo } from '../api/subscribe';
import moment from 'moment';
import { message, Modal } from 'ant-design-vue';

const version = ref(0)
// 移除过期时间变量
const visible = ref(false)
const disabled = ref(false)
const activedClass = reactive(['card', 'card', 'card'])

const subscribe = reactive({
    payMode: 1,
    payment: 299.00  // 固定价格
})

// 表单校验
const rules = {
    payMode: [{
        required: true,
        message: '请选择支付方式',
        trigger: 'blur',
    }],
    payment: [{
        required: true,
    }],
};

const payResult = ref(false)
const subscribeFormRef = ref()

// 初始化数据
onBeforeMount(() => { subscribeInfo() })

// 点击购买
const onBuy = () => {
    visible.value = true
}

// 点击支付
const onPay = () => {
    if (subscribe.payMode == 2) {
        message.error('暂不支持微信支付！')
        return
    }
        subscribePay().then((res) => {
            if (res.data.code == 200) {
                // 模拟支付成功
                message.success('支付成功！')
                visible.value = false
                // 刷新订阅信息
                subscribeInfo()
            }
        })
}

// 获取用户订阅信息
const subscribeInfo = () => {
    getSubscribeInfo().then((res) => {
        if (res.data.code == 200) {
            version.value = res.data.info.version
            if (res.data.info.version !== 1) {
                disabled.value = true
            }
            if (res.data.info.version == 1) {
                activedClass[0] = 'selected-free-card'
            }
            if (res.data.info.version == 2 || res.data.info.version == 3) {
                activedClass[res.data.info.version - 1] = 'selected-card'
            }
        }
    })
}
</script>

<style scoped>
.title {
    color: #121212;
    line-height: 47px;
    margin-top: 4px;
    margin-bottom: 16px;
    font-size: 24px;
}

.icon {
    color: #3bc8b6;
    font-size: 30px;
    margin-left: 8px;
}

.content {
    font-size: 14px;
    color: rgba(27, 27, 27, .5);
    line-height: 24px;
}

.price {
    height: 54px;
    font-size: 35px;
    line-height: 54px;
    font-weight: 700;
    color: #212930;
}

.card {
    min-height: 480px;
    box-shadow: 0 1px 10px 0 rgb(33 41 48 / 5%);
}

.selected-free-card {
    min-height: 480px;
    box-shadow: 0 1px 10px 0 rgb(33 41 48 / 5%);
    border: 2px solid #ceebfa;
    background: #f0faff;
}

.selected-card {
    min-height: 480px;
    box-shadow: 0 1px 10px 0 rgb(33 41 48 / 5%);
    border: 2px solid #d6ddf9;
    background: #f3f6fd;
}

.subscribe-list {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 16px;
    padding: 5px;
}

.member-tag {
    font-weight: 500;
    line-height: 24px;
    font-size: 16px;
}

.btn-free {
    width: 100%;
    height: 50px;
    background-color: #33B9FE;
    border-color: #33B9FE;
    display: flex;
    font-size: 20px;
    font-weight: 500;
    color: #fff;
    align-items: center;
    justify-content: center;
}

.btn-buy {
    width: 100%;
    height: 50px;
    display: flex;
    font-size: 20px;
    font-weight: 500;
    align-items: center;
    justify-content: center;
}
</style>