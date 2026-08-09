/**
 * @wireframe-skill multi-screen-wireframe@1.5.1
 * 创建基于 v1.3.0
 * 修改基于 v1.5.1
 */
import {
  Button,
  Column,
  FormField,
  Heading,
  Text,
  TextInput,
} from '../../../../starter/framework/lib/ui/index.js'

export function LoginScreen() {
  return (
    <Column id="claims-login-page" gap={20} className="claims-login claims-login__page">
      <span id="claims-login-logo" className="claims-logo-placeholder claims-login__logo" aria-hidden="true" />
      <Heading id="claims-login-title" className="claims-login__title" level={1}>理赔服务</Heading>
      <Text className="claims-login__description">登录后查看和提交理赔申请。</Text>
      <FormField className="claims-login__phone-field" label="手机号" htmlFor="claims-login-phone">
        <TextInput id="claims-login-phone" className="claims-login__phone-input" inputMode="tel" placeholder="请输入手机号" />
      </FormField>
      <FormField className="claims-login__code-field" label="验证码" htmlFor="claims-login-code">
        <TextInput id="claims-login-code" className="claims-login__code-input" inputMode="numeric" placeholder="请输入验证码" />
      </FormField>
      <Button id="claims-login-submit" className="claims-login__submit" variant="primary" to="home">登录</Button>
    </Column>
  )
}
