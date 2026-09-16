import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";

import RegisterForm from "../components/register-form";

export default function RegisterTemplate() {
  return (
    <Card>
      <CardHeader>
        <CardTitle role="heading" aria-level={1}>
          Đăng ký tài khoản
        </CardTitle>
        <CardDescription>Tạo tài khoản mới để sử dụng hệ thống</CardDescription>
      </CardHeader>
      <RegisterForm />
    </Card>
  );
}
