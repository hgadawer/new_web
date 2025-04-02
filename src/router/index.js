import { createRouter, createWebHashHistory } from 'vue-router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import Index from '../views/Index.vue'
import Home from '../views/Home.vue'
import Error from '../views/Error.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Pass from '../views/Pass.vue'
import Dashboard from '../views/Dashboard.vue'
import Customer from '../views/Customer.vue'
import Business from '../views/Business.vue'  // 修改处：由 Contract.vue 改为 Business.vue
import Product from '../views/Product.vue'
import Config from '../views/Config.vue'
import Subscribe from '../views/Subscribe.vue'
import Result from '../views/Result.vue'
import Contract from '../views/Contract.vue' // 导入合同组件
import Welcome from '../views/Welcome.vue'
const routes = [
  {
    path: '/',
    component: Index,
    redirect: '/login',
    children: [
      {
        path: '/login',
        component: Login,
      },
      {
        path: '/register',
        component: Register,
      },
      {
        path: '/pass',
        component: Pass,
      },
    ],
  },
  {
    path: '/home',
    component: Home,
    redirect: '/dashboard',
    children: [
      {
        path: '/welcome',
        name: 'welcome',
        component: Welcome,
      },
      {
        path: '/dashboard',
        name: 'dashboard',
        component: Dashboard,
      },
      {
        path: '/customer',
        name: 'customer',
        component: Customer,
      },
      {
        path: '/business',  // 路由路径保持不变
        name: 'business',
        component: Business,  
      },
      {
        path: '/product',
        name: 'product',
        component: Product,
      },
      {
        path: '/config',
        name: 'config',
        component: Config,
      },
      {
        path: '/subscribe',
        name: 'subscribe',
        component: Subscribe,
      },
      {
        path: '/result',
        name: 'result',
        component: Result,
      },
      // 添加合同模块作为子路由
      {
        path: '/contact',
        name: 'contact',
        component: Contract,
      }
    ],
  },
  {
    path: '/error',
    name: 'error',
    component: Error,
  },
  // 删除独立的合同模块路由
]

const router = createRouter({
  history: createWebHashHistory(), routes
})

NProgress.configure({ easing: 'ease', speed: 500, showSpinner: false });

router.beforeEach((to, from, next) => {
  NProgress.start() // 进度条开始
  next()
})

router.afterEach(() => {
  NProgress.done() // 进度条结束
})

export default router;
