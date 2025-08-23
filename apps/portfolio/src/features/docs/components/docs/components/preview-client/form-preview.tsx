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
} from "@web/ui/shadcn-ui/form";
import { Input } from "@web/ui/shadcn-ui/input";
import { Button } from "../../../../../../../../../packages/ui/src/shadcn-ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@web/ui/shadcn-ui/textarea";

type FormSchema = z.infer<typeof formSchema>;

const formSchema = z.object({
  name: z
    .string({ message: "Name require" })
    .min(1, { message: "Name min 1 character" }),
  description: z.string().optional(),
});

const FormPreview = () => {
  const form = useForm<FormSchema>({
    defaultValues: { name: "", description: "" },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormSchema) => {
    console.log(data);
  };

  return (
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
  );
};

export default FormPreview;
