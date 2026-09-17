import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router";

import { Button } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";
import { cn } from "@monorepo/ui/utils/cn";

import type { OnboardingFormValues } from "~/features/onboarding/types/onboarding-form";
import { LifecycleStepper } from "~/components/stepper/lifecycle-stepper";
import { ROUTES } from "~/constants/routes";
import { onboardingFormSchema } from "~/features/onboarding/types/onboarding-form";

interface StepField {
  name: keyof OnboardingFormValues;
  label: string;
  placeholder: string;
  type?: "number" | "email";
  /** Sits beside its neighbour instead of taking the row. */
  half?: boolean;
  hint?: string;
}

interface Step {
  id: string;
  title: string;
  description: string;
  cardTitle: string;
  cardDescription: string;
  fields: StepField[];
  note?: string;
}

// The three steps as the prototype had them; `fields` doubles as the list
// `trigger` validates before the step may advance.
const STEPS: [Step, ...Step[]] = [
  {
    id: "building",
    title: "Tạo tòa nhà đầu tiên",
    description: "Nhập thông tin cơ bản về khu trọ của bạn.",
    cardTitle: "Tòa nhà của bạn",
    cardDescription:
      "Thông tin tòa nhà hoặc khu trọ đầu tiên. Bạn có thể thêm nhiều hơn sau này.",
    fields: [
      {
        name: "buildingName",
        label: "Tên khu trọ",
        placeholder: "VD: Trọ Sinh Viên...",
      },
      { name: "address", label: "Địa chỉ", placeholder: "Nhập địa chỉ đầy đủ" },
      {
        name: "floors",
        label: "Số tầng",
        placeholder: "1",
        type: "number",
        half: true,
      },
      {
        name: "rooms",
        label: "Dự kiến số phòng",
        placeholder: "10",
        type: "number",
        half: true,
      },
    ],
  },
  {
    id: "room",
    title: "Thêm phòng",
    description: "Tạo danh sách các phòng trong khu trọ.",
    cardTitle: "Thêm phòng nhanh",
    cardDescription:
      "Hệ thống có thể tự động tạo danh sách phòng dựa trên thiết lập của bạn.",
    fields: [
      {
        name: "roomNamingRule",
        label: "Quy tắc đặt tên phòng",
        placeholder: "Phòng {tầng}0{số}",
        hint: "VD: Tầng 1 có 5 phòng = Phòng 101, Phòng 102...",
      },
      {
        name: "defaultRent",
        label: "Giá thuê mặc định",
        placeholder: "3,000,000",
        type: "number",
      },
    ],
  },
  {
    id: "manager",
    title: "Mời quản lý",
    description: "Ủy quyền quản lý cho người khác (tùy chọn).",
    cardTitle: "Mời quản lý",
    cardDescription: "Bạn có muốn ai đó cùng quản lý khu trọ này không?",
    fields: [
      {
        name: "managerEmail",
        label: "Email người quản lý (tùy chọn)",
        placeholder: "manager@example.com",
        type: "email",
      },
    ],
    note: "Họ sẽ nhận được một email mời tham gia quản lý khu trọ của bạn.",
  },
];

const LAST_STEP = STEPS.length - 1;

/**
 * "Chào mừng!": the three-step wizard a new landlord walks after registering.
 * Chromeless — it sits outside both guards and the shell, as in the
 * prototype. Every step validates only its own fields before advancing, and
 * "Hoàn thành" and "Bỏ qua" both land on the dashboard: the wizard submits
 * nothing yet, exactly as the prototype did.
 */
export default function OnboardingWizardTemplate() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      buildingName: "",
      address: "",
      floors: "1",
      rooms: "10",
      roomNamingRule: "Phòng {tầng}0{số}",
      defaultRent: "",
      managerEmail: "",
    },
  });

  const step = STEPS[currentStep] ?? STEPS[0];

  const finish = () => navigate(ROUTES.HOME);

  const next = async () => {
    const valid = await form.trigger(step.fields.map((field) => field.name));
    if (!valid) return;
    if (currentStep < LAST_STEP) setCurrentStep((value) => value + 1);
    else finish();
  };

  return (
    <div className="bg-muted/40 flex min-h-dvh flex-col items-center p-4 md:p-8">
      <div className="grid w-full max-w-4xl gap-8 md:grid-cols-[300px_1fr]">
        <div>
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Chào mừng!</h1>
            <p className="text-muted-foreground mt-2">
              Hãy thiết lập những thông tin cơ bản để bắt đầu sử dụng hệ thống.
            </p>
          </div>
          <LifecycleStepper
            steps={STEPS.map(({ id, title, description }, index) => ({
              id,
              title,
              description,
              isCompleted: currentStep > index,
              isActive: currentStep === index,
            }))}
          />
        </div>

        <form noValidate onSubmit={(event) => event.preventDefault()}>
          <Card>
            <CardHeader>
              <CardTitle>{step.cardTitle}</CardTitle>
              <CardDescription>{step.cardDescription}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {step.fields.map(({ name, label, hint, half, ...input }) => (
                <Controller
                  key={name}
                  name={name}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className={cn(!half && "sm:col-span-2")}
                    >
                      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                      <Input
                        {...field}
                        {...input}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                      />
                      {hint && <FieldDescription>{hint}</FieldDescription>}
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              ))}
              {step.note && (
                <p className="text-muted-foreground text-sm sm:col-span-2">
                  {step.note}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-between">
            <Button type="button" variant="ghost" onClick={finish}>
              Bỏ qua
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={currentStep === 0}
                onClick={() =>
                  setCurrentStep((value) => Math.max(0, value - 1))
                }
              >
                Quay lại
              </Button>
              <Button type="button" onClick={next}>
                {currentStep === LAST_STEP ? "Hoàn thành" : "Tiếp tục"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
