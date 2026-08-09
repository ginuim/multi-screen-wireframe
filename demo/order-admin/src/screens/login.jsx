/**
 * @wireframe-skill multi-screen-wireframe@1.5.1
 * 创建基于 v1.3.0
 * 修改基于 v1.5.1
 */
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
    <div id="order-login-page" className="order-login order-login__page">
      <Card id="order-login-card" className="order-login-card order-login__card">
        <Column className="order-login__form" gap={16}>
          <Heading id="order-login-title" className="order-login__title" level={1}>订单管理后台</Heading>
          <Text className="order-login__description">使用演示账号进入系统。</Text>
          <FormField className="order-login__account-field" label="账号" htmlFor="order-login-account">
            <TextInput id="order-login-account" className="order-login__account-input" placeholder="请输入用户名" />
          </FormField>
          <FormField className="order-login__password-field" label="密码" htmlFor="order-login-password">
            <TextInput id="order-login-password" className="order-login__password-input" type="password" placeholder="请输入密码" />
          </FormField>
          <Button id="order-login-submit" className="order-login__submit" variant="primary" to="order-list">登录</Button>
        </Column>
      </Card>
    </div>
  )
}
