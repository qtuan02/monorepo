import type { Meta, StoryObj } from "@storybook/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import { Checkbox } from "@monorepo/ui/components/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@monorepo/ui/components/field";
import { Input } from "@monorepo/ui/components/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@monorepo/ui/components/input-group";
import { toast } from "@monorepo/ui/components/toast";

// There is no <Form>/<FormField> wrapper: shadcn retired that family, and the
// current convention is Controller + the Field primitives (see ADR-0003 and
// .agents/rules/forms-field-components.md).
//
// Each story writes its form out inline rather than rendering a wrapper
// component, so Storybook's "Show code" prints the form itself — a wrapper
// would print `<ProfileForm />` and teach the reader nothing.
const meta = {
  title: "Storybook/Form",
  component: Field,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
A form is a composition, not a component — there is no \`<Form>\` or \`<FormField>\` in
\`@monorepo/ui\`. shadcn retired that family and its registry item is empty in every base
style, so the convention is **\`Controller\` + the \`Field\` primitives**, with Zod driving
validation through \`zodResolver\` (ADR-0003).

### Anatomy

\`\`\`tsx
<Controller
  name="username"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>Username</FieldLabel>
      <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
      <FieldDescription>This is your public display name.</FieldDescription>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
\`\`\`

### Rules that are easy to get wrong

- **One schema is the source of truth.** Derive the value type with \`z.infer\`, never a
  hand-written mirror interface — the two drift silently.
- **\`FieldLabel htmlFor\` must equal the control \`id\`.** Using \`field.name\` for both keeps
  them in step; without it the label is decorative and screen readers lose the control.
- **Mark invalid twice:** \`data-invalid\` on \`Field\` (drives the destructive styles) and
  \`aria-invalid\` on the control (drives assistive tech).
- **\`FieldError\` takes an array** — \`errors={[fieldState.error]}\`. It dedups by message and
  renders nothing when empty.
- **Actions live outside the \`<form>\`**, tied back with \`form="<id>"\`, so they can sit in a
  \`CardFooter\`. Spell \`type="button"\` on anything that must not submit — the default is
  \`submit\`.
- **Always pass \`defaultValues\`** (empty strings, never \`undefined\`) so every field is
  controlled from the first render.

Repo rules: \`.agents/rules/forms-field-components.md\`, \`.agents/rules/forms-schema-driven.md\`.
        `.trim(),
      },
    },
  },
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

const DESCRIPTION_MAX = 100;

const profileFormSchema = z.object({
  username: z
    .string({ error: "Please enter a username." })
    .trim()
    .min(3, { error: "Username must be at least 3 characters." })
    .max(10, { error: "Username must be at most 10 characters." })
    .regex(/^[a-zA-Z0-9_]+$/, {
      error: "Username can only contain letters, numbers, and underscores.",
    }),
  email: z.email({ error: "Please enter a valid email address." }),
});

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          "The base shape: one `Controller` per input, `FieldDescription` for a hint, `FieldError` for the message. Submit while empty to see every field report itself.",
      },
    },
  },
  render: () => {
    const form = useForm<z.infer<typeof profileFormSchema>>({
      resolver: zodResolver(profileFormSchema),
      defaultValues: { username: "", email: "" },
    });

    const onSubmit = form.handleSubmit((values) => {
      toast.add({ title: "Submitted", description: JSON.stringify(values) });
    });

    return (
      <Card className="w-full sm:max-w-md">
        <CardHeader>
          <CardTitle>Profile settings</CardTitle>
          <CardDescription>
            Update your profile information below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="profile-form" onSubmit={onSubmit}>
            <FieldGroup>
              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      autoComplete="username"
                      placeholder="monorepo"
                    />
                    <FieldDescription>
                      This is your public display name.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="email"
                      aria-invalid={fieldState.invalid}
                      autoComplete="email"
                      placeholder="you@example.com"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            <Button type="submit" form="profile-form">
              Save
            </Button>
          </Field>
        </CardFooter>
      </Card>
    );
  },
};

const bugReportFormSchema = z.object({
  title: z
    .string({ error: "Please enter a title." })
    .trim()
    .min(5, { error: "Bug title must be at least 5 characters." })
    .max(32, { error: "Bug title must be at most 32 characters." }),
  description: z
    .string({ error: "Please describe the bug." })
    .trim()
    .min(20, { error: "Description must be at least 20 characters." })
    .max(DESCRIPTION_MAX, {
      error: `Description must be at most ${DESCRIPTION_MAX} characters.`,
    }),
});

export const WithTextarea: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          "`InputGroup` wraps the textarea so the character counter sits inside the control rather than beside it. The count reads `field.value`, so it needs no state of its own.",
      },
    },
  },
  render: () => {
    const form = useForm<z.infer<typeof bugReportFormSchema>>({
      resolver: zodResolver(bugReportFormSchema),
      defaultValues: { title: "", description: "" },
    });

    const onSubmit = form.handleSubmit((values) => {
      toast.add({ title: "Submitted", description: JSON.stringify(values) });
    });

    return (
      <Card className="w-full sm:max-w-md">
        <CardHeader>
          <CardTitle>Bug report</CardTitle>
          <CardDescription>
            Help us improve by reporting bugs you encounter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="bug-report-form" onSubmit={onSubmit}>
            <FieldGroup>
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Bug title</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      placeholder="Login button not working on mobile"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        className="min-h-24 resize-none"
                        placeholder="Steps to reproduce, what you expected, what happened."
                        rows={6}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                          {field.value.length}/{DESCRIPTION_MAX} characters
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            <Button type="submit" form="bug-report-form">
              Submit report
            </Button>
          </Field>
        </CardFooter>
      </Card>
    );
  },
};

const inviteFormSchema = z.object({
  email: z.email({ error: "Please enter a valid email address." }),
  // Not z.boolean(): that accepts `false`, so an unticked box would submit.
  acceptTerms: z.boolean().refine((accepted) => accepted, {
    error: "You must accept the terms to continue.",
  }),
});

export const HorizontalField: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'A checkbox/switch/radio row is `orientation="horizontal"` with `FieldContent` holding the label, description and error beside the control. The "must be ticked" rule lives in the schema as a `.refine()`, not in the component.',
      },
    },
  },
  render: () => {
    const form = useForm<z.infer<typeof inviteFormSchema>>({
      resolver: zodResolver(inviteFormSchema),
      defaultValues: { email: "", acceptTerms: false },
    });

    const onSubmit = form.handleSubmit((values) => {
      toast.add({ title: "Submitted", description: JSON.stringify(values) });
    });

    return (
      <Card className="w-full sm:max-w-md">
        <CardHeader>
          <CardTitle>Invite a teammate</CardTitle>
          <CardDescription>
            A horizontal field puts the control beside its label and
            description.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="invite-form" onSubmit={onSubmit}>
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="email"
                      aria-invalid={fieldState.invalid}
                      placeholder="teammate@example.com"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="acceptTerms"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    orientation="horizontal"
                    data-invalid={fieldState.invalid}
                  >
                    <Checkbox
                      id={field.name}
                      name={field.name}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      onBlur={field.onBlur}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>
                        Accept terms and conditions
                      </FieldLabel>
                      <FieldDescription>
                        You need to agree before sending the invite.
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            <Button type="submit" form="invite-form">
              Send invite
            </Button>
          </Field>
        </CardFooter>
      </Card>
    );
  },
};
