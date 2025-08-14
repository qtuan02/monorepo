"use client";

import { Button } from "@repo/ui/components/button";
import { toast } from "sonner";

const SonnerPreview = () => (
  <div className="flex justify-center">
    <Button onClick={() => toast.success("Hello")}>Toast</Button>
  </div>
);

export default SonnerPreview;
