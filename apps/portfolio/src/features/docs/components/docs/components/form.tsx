import { getTranslations } from "next-intl/server";

import { IDocComponentProps } from "~/types/docs";
import CodeBlock from "../../common/code-block";
import LayoutDocs from "../../common/layout-docs";
import SectionCode from "../../common/section-code";
import SectionPreview from "../../common/section-preview";
import FormPreview from "./preview-client/form-preview";

const importCode = `
"use client";

import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@monorepo/ui/shadcn-ui/form";
import { Input } from "@monorepo/ui/shadcn-ui/input";
import { Button } from "@monorepo/ui/shadcn-ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@monorepo/ui/shadcn-ui/textarea";
`;

const usageCode = `
type FormSchema = z.infer<typeof formSchema>;

const formSchema = z.object({
  name: z
    .string({ message: "Name require" })
    .min(1, { message: "Name min 1 character" }),
  description: z.string().optional(),
});

const form = useForm<FormSchema>({
  defaultValues: { name: "", description: "" },
  resolver: zodResolver(formSchema),
});

const onSubmit = (data: FormSchema) => {
  console.log(data);
};

<Form {...form}>
  <form
    onSubmit={form.handleSubmit(onSubmit)}
    className="flex flex-col gap-y-4 w-full"
  >
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input {...field} type="text" placeholder="Enter your name" />
          </FormControl>
          <FormDescription>This is your name</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Description</FormLabel>
          <FormControl>
            <Textarea {...field} placeholder="Enter your description" />
          </FormControl>
          <FormDescription>This is your description</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />

    <Button type="submit">Submit</Button>
  </form>
</Form>
`;

const Form = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Form" slug={slug} locale={locale}>
      <SectionPreview title={t("preview")}>
        <FormPreview />
      </SectionPreview>

      <SectionCode title={t("import")}>
        <CodeBlock code={importCode} />
      </SectionCode>
      <SectionCode title={t("usage")}>
        <CodeBlock code={usageCode} />
      </SectionCode>
    </LayoutDocs>
  );
};

export default Form;
