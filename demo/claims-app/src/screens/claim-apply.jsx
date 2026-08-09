/**
 * @wireframe-skill multi-screen-wireframe@1.5.1
 * 创建基于 v1.3.0
 * 修改基于 v1.5.1
 */
import {
  Button,
  Checkbox,
  Column,
  FormField,
  Heading,
  Select,
  Steps,
  TextArea,
  TextInput,
} from '../../../../starter/framework/lib/ui/index.js'
import { MobileLayout } from '../layouts/MobileLayout.jsx'

export function ClaimApplyScreen() {
  return (
    <MobileLayout>
      <Column id="claim-apply-page" gap={16} className="claims-page claim-apply__page">
        <Heading id="claim-apply-title" className="claim-apply__title" level={1}>理赔申请</Heading>
        <Steps
          id="claim-apply-steps"
          className="claim-apply__steps"
          current={0}
          items={[
            { id: 'form', label: '基本信息' },
            { id: 'materials', label: '资料上传' },
            { id: 'done', label: '提交' },
          ]}
        />
        <FormField className="claim-apply__type-field" label="理赔类型" htmlFor="claim-apply-type">
          <Select id="claim-apply-type" className="claim-apply__type-select" defaultValue="medical">
            <option className="claim-apply__type-option" value="medical">医疗费用</option>
            <option className="claim-apply__type-option" value="accident">意外伤害</option>
          </Select>
        </FormField>
        <FormField className="claim-apply__date-field" label="发生日期" htmlFor="claim-apply-date">
          <TextInput id="claim-apply-date" className="claim-apply__date-input" placeholder="YYYY-MM-DD" />
        </FormField>
        <FormField className="claim-apply__description-field" label="情况说明" htmlFor="claim-apply-description">
          <TextArea id="claim-apply-description" className="claim-apply__description-input" placeholder="简要说明经过" />
        </FormField>
        <Checkbox className="claim-apply__confirmation" label="我已确认信息真实" />
        <Button id="claim-apply-submit" className="claim-apply__submit" variant="primary" to="claims">提交申请</Button>
      </Column>
    </MobileLayout>
  )
}
