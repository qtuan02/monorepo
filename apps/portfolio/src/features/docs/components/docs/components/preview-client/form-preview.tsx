"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@monorepo/ui/shadcn-ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@monorepo/ui/shadcn-ui/form";
import { Input } from "@monorepo/ui/shadcn-ui/input";
import { Textarea } from "@monorepo/ui/shadcn-ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
        className="flex w-full flex-col gap-y-4"
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
