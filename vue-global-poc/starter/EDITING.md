# Vue Global screen 写法

页面文件保持固定外壳：

```js
/**
 * @wireframe-skill multi-screen-wireframe-vue-global@1.8.0
 * 创建基于 v1.8.0
 * 修改基于 v1.8.0
 */
WireframeVue.defineScreen('orders', ({ computed, ref, useScreenId }) => ({
  setup() {
    const screenId = useScreenId()
    const keyword = ref('')
    const orders = ref([
      { id: 'o-101', title: '订单 101' },
      { id: 'o-102', title: '订单 102' },
      { id: 'o-103', title: '订单 103' },
    ])
    const filteredOrders = computed(() => orders.value.filter((item) =>
      item.title.includes(keyword.value),
    ))
    return { filteredOrders, keyword, screenId }
  },
  template: /*html*/ `
    <WfColumn id="orders-page" class="orders-page" :gap="12" :style="{ padding: '24px' }">
      <WfHeading id="orders-title" class="orders-page__title" :level="1">订单</WfHeading>
      <WfTextInput
        id="orders-search"
        v-model="keyword"
        class="orders-page__search"
        placeholder="搜索订单"
      ></WfTextInput>
      <WfCell
        v-for="order in filteredOrders"
        :key="order.id"
        :data-wf-key="order.id"
        class="orders-page__item"
        :title="order.title"
        to="order-detail"
      ></WfCell>
    </WfColumn>
  `,
}))
```

可用全局组件：`WfBox`、`WfRow`、`WfColumn`、`WfGrid`、`WfHeading`、`WfText`、`WfCard`、`WfBadge`、`WfAvatar`、`WfImagePlaceholder`、`WfButton`、`WfTextInput`、`WfTextArea`、`WfSelect`、`WfCheckbox`、`WfRadio`、`WfToggle`、`WfFormField`、`WfPageHeader`、`WfSideNav`、`WfTabBar`、`WfBreadcrumbs`、`WfMobileShell`、`WfCell`、`WfDataTable`、`WfTabs`、`WfSteps`、`WfEmptyState`、`WfModal`、`WfConfirmDialog`、`WfToast`、`WfLoadingOverlay`、`WfWireMap`、`WfMapMarker`、`WfMapOverlay`。
