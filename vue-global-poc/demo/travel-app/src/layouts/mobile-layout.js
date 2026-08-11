/**
 * @wireframe-skill multi-screen-wireframe-vue-global@1.8.0
 * 创建基于 v1.8.0
 * 修改基于 v1.8.0
 */
(function defineMobileLayout({ defineComponent }) {
  defineComponent('WfMobileLayout', ({ useScreenId }) => ({
    setup() {
      return {
        screenId: useScreenId(),
        tabs: [{ label: '发现', to: 'discover' }, { label: '行程', to: 'trips' }, { label: '我的', to: 'profile' }],
      }
    },
    template: `<WfMobileShell class="weekend-shell weekend-layout" :tabs="tabs" :active-id="screenId" aria-label="周末出发旅行助手"><slot /></WfMobileShell>`,
  }))
})(window.WireframeVue)
