/**
 * @wireframe-skill multi-screen-wireframe@1.8.0
 * 创建基于 v1.5.1
 * 修改基于 v1.8.0
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
    <Column id="login-page" gap={20} className="weekend-login login__page">
      <span id="login-logo" className="weekend-logo-placeholder login__logo" aria-hidden="true" />
      <Column className="login__intro" gap={8}>
        <Heading id="login-title" className="login__title" level={1}>周末出发</Heading>
        <Text className="login__description">把想去的地方，变成一份随时能走的行程。</Text>
      </Column>
      <FormField className="login__phone-field" label="手机号" htmlFor="login-phone">
        <TextInput id="login-phone" className="login__phone-input" inputMode="tel" placeholder="请输入手机号" />
      </FormField>
      <FormField className="login__code-field" label="验证码" htmlFor="login-code" hint="演示环境可输入任意 6 位数字">
        <TextInput id="login-code" className="login__code-input" inputMode="numeric" placeholder="请输入验证码" />
      </FormField>
      <Button id="login-submit" className="login__submit" variant="primary" to="discover">开始探索</Button>
      <Text className="login__agreement" as="small">继续即表示同意服务条款与隐私说明。</Text>
    </Column>
  )
}
