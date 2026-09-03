import { useForm } from "react-hook-form";

import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@monorepo/ui";

export default function FormPreview() {
  const form = useForm({
    defaultValues: {
      username: "",
    },
  });

  function onSubmit(values: any) {
    console.log(values);
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Default</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
