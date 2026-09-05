import { useTranslation } from "react-i18next";
import { Form, href } from "react-router";

import { Button } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";

import type { SessionUser } from "~/types/session-user";

interface SessionCardProps {
  user: SessionUser;
}

/**
 * Who is signed in, and the way out. The name is session data — it came out of
 * the cookie through the guard's context — while the role is a catalogue key:
 * this Template's fake user has no role of its own, so the label stands in for
 * the value a real session would carry.
 *
 * Sign-out is a `<Form method="post">` to the resource route, never a link. A
 * link is a GET, and a GET can be fired by a prefetch or an `<img src>` — a
 * POST cannot. Once hydrated the client router submits it and follows the
 * redirect home; without JavaScript it is a plain form post that does the
 * same. `href("/sign-out")` rather than a literal, so a renamed route fails
 * typecheck here instead of posting into a 404.
 */
export default function SessionCard({ user }: SessionCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>{user.name}</h2>
        </CardTitle>
        <CardDescription>{t("header.user.role")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post" action={href("/sign-out")}>
          <Button type="submit" variant="outline">
            {t("auth.signOut")}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}
