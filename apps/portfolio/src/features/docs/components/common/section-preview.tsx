import { PropsWithChildren } from "react";

interface ISectionPreviewProps extends PropsWithChildren {
  title: string;
}

const SectionPreview = (props: ISectionPreviewProps) => {
  const { title, children } = props;

  return (
    <section className="space-y-2">
      <h2 className="text-base font-medium md:text-lg">{title}</h2>
      <div className="rounded-md border border-gray-200 p-5 dark:border-gray-800">
        {children}
      </div>
    </section>
  );
};

export default SectionPreview;
