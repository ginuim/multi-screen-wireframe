import {
  Button,
  Column,
  FormField,
  Heading,
  Text,
  TextInput,
} from '../../../../starter/lib/ui/index.js'

export function LoginScreen() {
  return (
    <Column gap={20} className="claims-login">
      <span className="claims-logo-placeholder" aria-hidden="true" />
      <Heading level={1}>理赔服务</Heading>
      <Text>登录后查看和提交理赔申请。</Text>
      <FormField label="手机号" htmlFor="phone">
        <TextInput id="phone" inputMode="tel" placeholder="请输入手机号" />
      </FormField>
      <FormField label="验证码" htmlFor="code">
        <TextInput id="code" inputMode="numeric" placeholder="请输入验证码" />
      </FormField>
      <Button variant="primary" to="home">登录</Button>
    </Column>
  )
}
