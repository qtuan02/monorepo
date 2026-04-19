import type { Meta, StoryObj } from "@storybook/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "../components/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/form";
import { Input } from "../components/input";

const schema = z.object({
  username: z.string().min(2, "At least 2 characters"),
  email: z.string().email("Invalid email"),
});

type FormValues = z.infer<typeof schema>;

const meta = {
  title: "UI/Form",
  component: Form,
} satisfies Meta<typeof Form>;

export default meta;

type Story = StoryObj<typeof meta>;

function FormExample() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", email: "" },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(() => {})}
        className="w-full max-w-md space-y-6"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>Public display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

export const Default: Story = {
  args: {} as Story["args"],
  render: () => <FormExample />,
};
