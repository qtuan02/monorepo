import { PropsWithChildren } from "react";

interface ISectionCodeProps extends PropsWithChildren {
  title: string;
}

const SectionCode = (props: ISectionCodeProps) => {
  const { title, children } = props;

  return (
    <section className="space-y-2">
      <h2 className="text-base md:text-lg font-medium">{title}</h2>
      {children}
    </section>
  );
};

export default SectionCode;
