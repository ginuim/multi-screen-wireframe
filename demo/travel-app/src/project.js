import { BudgetScreen } from './screens/budget.jsx'
import { DiscoverScreen } from './screens/discover.jsx'
import { ExploreMapScreen } from './screens/explore-map.jsx'
import { ItineraryScreen } from './screens/itinerary.jsx'
import { LoginScreen } from './screens/login.jsx'
import { ProfileScreen } from './screens/profile.jsx'
import { RouteDetailScreen } from './screens/route-detail.jsx'
import { TripConfirmScreen } from './screens/trip-confirm.jsx'
import { TripCreateScreen } from './screens/trip-create.jsx'
import { TripsScreen } from './screens/trips.jsx'

export const project = {
  name: '周末出发旅行助手',
  viewports: {
    mobile: { width: 375, height: 812 },
  },
  defaultViewport: 'mobile',
  screens: [
    {
      id: 'login',
      title: '登录',
      component: LoginScreen,
      entry: true,
      links: ['discover'],
      edgeCases: [],
    },
    {
      id: 'discover',
      title: '发现',
      description: '超过一屏的路线推荐首页',
      component: DiscoverScreen,
      links: ['discover', 'explore-map', 'route-detail', 'trips', 'profile'],
      edgeCases: [],
    },
    {
      id: 'explore-map',
      title: '目的地地图',
      component: ExploreMapScreen,
      links: ['discover', 'route-detail', 'trips', 'profile'],
      edgeCases: [],
    },
    {
      id: 'route-detail',
      title: '路线详情',
      description: '长内容路线介绍与地点列表',
      component: RouteDetailScreen,
      links: ['discover', 'explore-map', 'itinerary', 'trip-create', 'trips', 'profile'],
      edgeCases: [],
    },
    {
      id: 'itinerary',
      title: '每日行程',
      description: '超过一屏的纵向步骤与日程卡片',
      component: ItineraryScreen,
      links: ['discover', 'route-detail', 'trip-create', 'trips', 'profile'],
      edgeCases: [],
    },
    {
      id: 'trip-create',
      title: '创建行程',
      component: TripCreateScreen,
      links: ['discover', 'route-detail', 'budget', 'trips', 'profile'],
      edgeCases: [],
    },
    {
      id: 'budget',
      title: '预算与同行人',
      component: BudgetScreen,
      links: ['discover', 'trip-confirm', 'trips', 'profile'],
      edgeCases: [],
    },
    {
      id: 'trip-confirm',
      title: '提交确认',
      component: TripConfirmScreen,
      links: ['discover', 'budget', 'trips', 'profile'],
      edgeCases: ['确认弹层', '加载状态', '成功提示'],
    },
    {
      id: 'trips',
      title: '我的行程',
      component: TripsScreen,
      links: ['discover', 'route-detail', 'trip-create', 'trips', 'profile'],
      edgeCases: [],
    },
    {
      id: 'profile',
      title: '个人设置',
      component: ProfileScreen,
      links: ['discover', 'trips', 'profile'],
      edgeCases: [],
    },
  ],
}
