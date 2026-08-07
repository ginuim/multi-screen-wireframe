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
      <Column gap={16} className="claims-page">
        <Heading level={1}>理赔申请</Heading>
        <Steps
          current={0}
          items={[
            { id: 'form', label: '基本信息' },
            { id: 'materials', label: '资料上传' },
            { id: 'done', label: '提交' },
          ]}
        />
        <FormField label="理赔类型" htmlFor="claim-type">
          <Select id="claim-type" defaultValue="medical">
            <option value="medical">医疗费用</option>
            <option value="accident">意外伤害</option>
          </Select>
        </FormField>
        <FormField label="发生日期" htmlFor="date">
          <TextInput id="date" placeholder="YYYY-MM-DD" />
        </FormField>
        <FormField label="情况说明" htmlFor="description">
          <TextArea id="description" placeholder="简要说明经过" />
        </FormField>
        <Checkbox label="我已确认信息真实" />
        <Button variant="primary" to="claims">提交申请</Button>
      </Column>
    </MobileLayout>
  )
}
