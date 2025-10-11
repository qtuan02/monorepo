"use client";

import { Button } from "@web/web-ui/shadcn-ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

interface IBackButtonProps {}

const BackButton: React.FC<IBackButtonProps> = () => {
  const router = useRouter();

  return (
    <Button
      size="icon"
      variant="ghost"
      className="cursor-pointer text-orange-500 hover:text-orange-600 hover:bg-orange-50"
      onClick={() => router.back()}
    >
      <ArrowLeft className="size-6.5" />
    </Button>
  );
};

export { BackButton };
