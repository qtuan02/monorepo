import { Tabs, TabsContent, TabsList, TabsTrigger } from "@monorepo/ui";

export default function TabsPreview() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      {/* Default */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Default</h3>
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="mt-2 rounded-md border p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Make changes to your account here.
            </p>
          </TabsContent>
          <TabsContent value="password" className="mt-2 rounded-md border p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Change your password here.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
