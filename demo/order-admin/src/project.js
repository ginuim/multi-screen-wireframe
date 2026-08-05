import { LoginScreen } from './screens/login.jsx'
import { OrderCancelScreen } from './screens/order-cancel.jsx'
import { OrderDetailScreen } from './screens/order-detail.jsx'
import { OrderListScreen } from './screens/order-list.jsx'

export const project = {
  name: '订单管理后台',
  viewports: {
    desktop: { width: 1280, height: 800 },
  },
  defaultViewport: 'desktop',
  screens: [
    {
      id: 'login',
      title: '登录',
      component: LoginScreen,
      entry: true,
      links: ['order-list'],
      edgeCases: [],
    },
    {
      id: 'order-list',
      title: '订单列表',
      component: OrderListScreen,
      links: ['order-list', 'order-detail'],
      edgeCases: [],
    },
    {
      id: 'order-detail',
      title: '订单详情',
      component: OrderDetailScreen,
      links: ['order-list', 'order-cancel'],
      edgeCases: [],
    },
    {
      id: 'order-cancel',
      title: '取消订单',
      component: OrderCancelScreen,
      links: ['order-list'],
      edgeCases: [],
    },
  ],
}
