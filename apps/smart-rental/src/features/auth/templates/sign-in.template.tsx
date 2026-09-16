import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";

import SignInForm from "../components/sign-in-form";

export default function SignInTemplate() {
  return (
    <Card>
      <CardHeader>
        {/* `CardTitle` is a div; this is the screen's only title, so it takes
            the heading role a screen reader (and the route test) lands on. */}
        <CardTitle role="heading" aria-level={1}>
          Đăng nhập
        </CardTitle>
        <CardDescription>
          Nhập email và mật khẩu để truy cập hệ thống
        </CardDescription>
      </CardHeader>
      <SignInForm />
    </Card>
  );
}
