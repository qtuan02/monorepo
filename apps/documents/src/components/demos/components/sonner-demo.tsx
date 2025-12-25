import { toast } from "sonner";

import { Button } from "@monorepo/ui";

export default function SonnerDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Toast Types</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() =>
              toast("Event has been created", {
                description: "Sunday, December 03, 2023 at 9:00 AM",
              })
            }
          >
            Show Toast
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.success("Successfully saved!")}
          >
            Success
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.error("Something went wrong")}
          >
            Error
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.warning("Be careful!")}
          >
            Warning
          </Button>
          <Button variant="outline" onClick={() => toast.info("Did you know?")}>
            Info
          </Button>
        </div>
      </div>
    </div>
  );
}
