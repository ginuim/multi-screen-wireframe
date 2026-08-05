import { ClaimApplyScreen } from './screens/claim-apply.jsx'
import { ClaimsScreen } from './screens/claims.jsx'
import { HomeScreen } from './screens/home.jsx'
import { LoginScreen } from './screens/login.jsx'
import { ProfileScreen } from './screens/profile.jsx'

export const project = {
  name: '理赔服务应用',
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
      links: ['home'],
      edgeCases: [],
    },
    {
      id: 'home',
      title: '首页',
      component: HomeScreen,
      links: ['home', 'claims', 'claim-apply', 'profile'],
      edgeCases: [],
    },
    {
      id: 'claims',
      title: '我的理赔',
      component: ClaimsScreen,
      links: ['home', 'claims', 'claim-apply', 'profile'],
      edgeCases: [],
    },
    {
      id: 'claim-apply',
      title: '理赔申请',
      component: ClaimApplyScreen,
      links: ['home', 'claims', 'profile'],
      edgeCases: [],
    },
    {
      id: 'profile',
      title: '个人中心',
      component: ProfileScreen,
      links: ['home', 'claims', 'profile'],
      edgeCases: [],
    },
  ],
}
