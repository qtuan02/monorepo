"use client";

import { Button } from "@web/web-ui/shadcn-ui/button";
import { Separator } from "@web/web-ui/shadcn-ui/separator";
import { useRouter } from "next/navigation";
import * as React from "react";

interface IOptionButtonProps {
  icon: React.ReactNode;
  title: string;
  redirectTo: string;
}

const OptionButton: React.FC<IOptionButtonProps> = (props) => {
  const { icon, title, redirectTo } = props;

  const router = useRouter();

  return (
    <Button
      onClick={() => router.push(redirectTo)}
      className="w-34 h-24 relative bg-transparent shadow-orange-300 shadow-lg rounded-xl border-orange-100 border"
    >
      <div className="size-13 bg-orange-500 rounded-full absolute top-0 inset-x-0 translate-x-5/6 -translate-y-1/2 flex-center">
        {icon}
      </div>
      <div className="flex-center flex-col">
        <p className="text-xl font-bold text-orange-500 ">{title}</p>
        <Separator className="!w-[75%] bg-orange-500" />
      </div>
    </Button>
  );
};

export { OptionButton };
