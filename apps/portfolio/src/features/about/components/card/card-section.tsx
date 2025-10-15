import { FC, HTMLAttributes, ReactNode } from "react";

import { cn } from "@monorepo/ui/libs/cn";

interface ICardSectionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

const CardSection: FC<ICardSectionProps> = (props) => {
  const { children, className, ...rest } = props;

  return (
    <div
      className={cn(
        "h-fit w-full rounded-lg border border-black/5 bg-gray-50 p-4 shadow-sm md:p-6 dark:bg-gray-900",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export default CardSection;
