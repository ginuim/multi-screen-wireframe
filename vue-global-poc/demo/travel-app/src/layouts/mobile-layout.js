/**
 * @wireframe-skill multi-screen-wireframe@1.8.0
 * Vue Global 多文件 PoC
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
