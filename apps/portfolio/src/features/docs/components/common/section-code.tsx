import type { PropsWithChildren } from "react";

interface ISectionCodeProps extends PropsWithChildren {
  title: string;
}

const SectionCode = (props: ISectionCodeProps) => {
  const { title, children } = props;

  return (
    <section className="space-y-2">
      <h2 className="text-base font-medium md:text-lg">{title}</h2>
      {children}
    </section>
  );
};

export default SectionCode;
