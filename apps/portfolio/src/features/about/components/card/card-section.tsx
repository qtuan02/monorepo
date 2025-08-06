import { cn } from "@repo/ui/libs/cn";
import { FC, HTMLAttributes, ReactNode } from "react";

interface ICardSectionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

const CardSection: FC<ICardSectionProps> = (props) => {
  const { children, className, ...rest } = props;

  return (
    <div
      className={cn(
        "p-4 md:p-6 bg-gray-50 dark:bg-gray-900 rounded-lg w-full h-fit shadow-sm border-black/5 border",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export default CardSection;
