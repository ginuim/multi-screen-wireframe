/**
 * @wireframe-skill multi-screen-wireframe@1.8.0
 * 创建基于 v1.5.1
 * 修改基于 v1.8.0
 */
import {
  Button,
  Checkbox,
  Column,
  FormField,
  PageHeader,
  Radio,
  Row,
  Select,
  Steps,
  TextArea,
  TextInput,
  Toggle,
} from '../../../../starter/framework/lib/ui/index.js'
import { MobileLayout } from '../layouts/MobileLayout.jsx'

export function TripCreateScreen() {
  const [reminder, setReminder] = React.useState(true)
  return (
    <MobileLayout>
      <Column id="trip-create-page" gap={17} className="weekend-page trip-create__page">
        <PageHeader id="trip-create-header" titleId="trip-create-title" className="trip-create__header" title="创建行程" subtitle="先确定时间与同行方式" actions={<Button className="trip-create__cancel" to="route-detail">取消</Button>} />
        <Steps id="trip-create-steps" className="trip-create__steps" current={0} items={[{ id: 'basic', label: '基本信息' }, { id: 'budget', label: '预算' }, { id: 'confirm', label: '确认' }]} />
        <FormField className="trip-create__name-field" label="行程名称" htmlFor="trip-create-name">
          <TextInput id="trip-create-name" className="trip-create__name-input" defaultValue="周六运河散步" />
        </FormField>
        <FormField className="trip-create__date-field" label="出发日期" htmlFor="trip-create-date" hint="建议选择天气稳定的日期">
          <TextInput id="trip-create-date" className="trip-create__date-input" defaultValue="2026-08-15" />
        </FormField>
        <FormField className="trip-create__start-field" label="集合地点" htmlFor="trip-create-start">
          <Select id="trip-create-start" className="trip-create__start-select" defaultValue="metro">
            <option className="trip-create__start-option" value="metro">运河路地铁站 3 号口</option>
            <option className="trip-create__start-option" value="warehouse">旧仓库正门</option>
            <option className="trip-create__start-option" value="custom">自定义地点</option>
          </Select>
        </FormField>
        <Column id="trip-create-pace" className="trip-create__pace" gap={9}>
          <span className="trip-create__group-label">行程节奏</span>
          <Row className="trip-create__pace-options" gap={12}>
            <Radio className="trip-create__pace-option" name="pace" label="轻松" defaultChecked />
            <Radio className="trip-create__pace-option" name="pace" label="标准" />
            <Radio className="trip-create__pace-option" name="pace" label="紧凑" />
          </Row>
        </Column>
        <FormField className="trip-create__note-field" label="同行备注" htmlFor="trip-create-note">
          <TextArea id="trip-create-note" className="trip-create__note-input" placeholder="例如：有儿童同行，希望减少楼梯路段" />
        </FormField>
        <Column id="trip-create-preferences" className="trip-create__preferences" gap={10}>
          <Checkbox className="trip-create__preference" label="优先安排无障碍路线" />
          <Checkbox className="trip-create__preference" label="避开需要预约的地点" defaultChecked />
          <Toggle id="trip-create-reminder" className="trip-create__reminder" checked={reminder} onChange={setReminder} label="出发前一天提醒" />
        </Column>
        <Button id="trip-create-next" className="trip-create__next" variant="primary" to="budget">下一步：预算与同行人</Button>
      </Column>
    </MobileLayout>
  )
}
