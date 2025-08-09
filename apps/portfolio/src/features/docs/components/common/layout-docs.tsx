import { cn } from "@repo/ui/libs/cn";
import { PropsWithChildren } from "react";

interface ILayoutDocsProps extends PropsWithChildren {
  title: string;
  className?: string;
}

const LayoutDocs = (props: ILayoutDocsProps) => {
  const { title, children, className } = props;

  return (
    <div className={cn("space-y-4", className)}>
      <h1 className="text-2xl font-semibold">{title}</h1>
      {children}
    </div>
  );
};

export default LayoutDocs;
