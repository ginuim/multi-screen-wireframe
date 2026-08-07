import {
  Button,
  Card,
  Column,
  FormField,
  Heading,
  Text,
  TextInput,
} from '../../../../starter/framework/lib/ui/index.js'

export function LoginScreen() {
  return (
    <div className="order-login">
      <Card className="order-login-card">
        <Column gap={16}>
          <Heading level={1}>订单管理后台</Heading>
          <Text>使用演示账号进入系统。</Text>
          <FormField label="账号" htmlFor="account">
            <TextInput id="account" placeholder="请输入账号" />
          </FormField>
          <FormField label="密码" htmlFor="password">
            <TextInput id="password" type="password" placeholder="请输入密码" />
          </FormField>
          <Button variant="primary" to="order-list">登录</Button>
        </Column>
      </Card>
    </div>
  )
}
