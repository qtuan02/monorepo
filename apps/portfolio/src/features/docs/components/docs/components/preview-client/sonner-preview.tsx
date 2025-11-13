"use client";

import { Button } from "@monorepo/ui/shadcn-ui/button";
import { toast } from "sonner";

const SonnerPreview = () => (
  <div className="flex justify-center">
    <Button onClick={() => toast.success("Hello")}>Toast</Button>
  </div>
);

export default SonnerPreview;
