import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionDocs from "../../common/section-docs";
import { getTranslations } from "next-intl/server";
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
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@repo/ui/components/textarea";
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
      <SectionDocs title={t("preview")}>
        <div className="border border-gray-200 dark:border-gray-800 rounded-md p-5">
          <FormPreview />
        </div>
      </SectionDocs>

      <SectionDocs title={t("import")}>
        <CodeBlock code={importCode} />
      </SectionDocs>
      <SectionDocs title={t("usage")}>
        <CodeBlock code={usageCode} />
      </SectionDocs>
    </LayoutDocs>
  );
};

export default Form;
