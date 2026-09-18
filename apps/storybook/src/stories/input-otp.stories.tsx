import type { Meta, StoryObj } from "@storybook/react";
import { RefreshCwIcon } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@monorepo/ui/components/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@monorepo/ui/components/input-otp";

import { currentPerson } from "~/support/people";

const meta = {
  title: "Storybook/InputOtp",
  component: InputOTP,
  subcomponents: { InputOTPGroup, InputOTPSeparator, InputOTPSlot },
  tags: ["autodocs"],
} satisfies Meta<typeof InputOTP>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // The component's own `render` prop is a required part of one branch of its
  // discriminated union (children XOR render) — this satisfies the type
  // without feeding it into the story's own render below.
  args: {} as Story["args"],
  parameters: {
    controls: { disable: true },
    stage: { width: "lg" },
  },
  render: () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Verify your login</CardTitle>
        <CardDescription>
          Enter the verification code we sent to{" "}
          <span className="font-medium">{currentPerson.email}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="otp-verification">
              Verification code
            </FieldLabel>
            <Button variant="outline" size="xs">
              <RefreshCwIcon />
              Resend code
            </Button>
          </div>
          <InputOTP maxLength={6} id="otp-verification" required>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <FieldDescription>
            Signed in from a new device on Northwind.
          </FieldDescription>
        </Field>
      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full">
          Verify
        </Button>
      </CardFooter>
    </Card>
  ),
};
