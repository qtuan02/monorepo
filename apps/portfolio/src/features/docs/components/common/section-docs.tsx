import { PropsWithChildren } from "react";

interface ISectionDocsProps extends PropsWithChildren {
  title: string;
}

const SectionDocs = (props: ISectionDocsProps) => {
  const { title, children } = props;

  return (
    <section className="space-y-2">
      <h2 className="text-base md:text-lg font-medium">{title}</h2>
      <div className="border border-gray-200 dark:border-gray-800 rounded-md p-5">
        {children}
      </div>
    </section>
  );
};

export default SectionDocs;
