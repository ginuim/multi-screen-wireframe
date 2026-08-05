import { DetailScreen } from './screens/detail.jsx'
import { HomeScreen } from './screens/home.jsx'

export const project = {
  name: '多屏线框原型',
  viewports: {
    mobile: { width: 375, height: 812 },
    desktop: { width: 1280, height: 800 },
  },
  defaultViewport: 'mobile',
  screens: [
    {
      id: 'home',
      title: '首页',
      description: '入口页面',
      component: HomeScreen,
      entry: true,
      links: ['detail'],
      edgeCases: [],
    },
    {
      id: 'detail',
      title: '详情',
      description: '详情页面',
      component: DetailScreen,
      links: [],
      edgeCases: [],
    },
  ],
}
