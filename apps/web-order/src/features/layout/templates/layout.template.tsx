import { PropsWithChildren, ReactNode } from "react";

interface ILayoutTemplateProps extends PropsWithChildren {
  navbar?: ReactNode;
  footer?: ReactNode;
}

export default function LayoutTemplate(props: ILayoutTemplateProps) {
  const { navbar, footer, children } = props;
  return (
    <main className="flex-center">
      <div className="size-full max-w-xl bg-gray-100 relative">
        {navbar && navbar}
        {children}
        {footer && footer}
      </div>
    </main>
  );
}
