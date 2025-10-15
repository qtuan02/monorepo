"use client";

import { toast } from "sonner";

import { Button } from "@monorepo/ui/shadcn-ui/button";

const SonnerPreview = () => (
  <div className="flex justify-center">
    <Button onClick={() => toast.success("Hello")}>Toast</Button>
  </div>
);

export default SonnerPreview;
