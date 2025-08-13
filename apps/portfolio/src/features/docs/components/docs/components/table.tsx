import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionDocs from "../../common/section-docs";
import { getTranslations } from "next-intl/server";
import {
  Table as TableComp,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";

const TablePreview = () => {
  const data = [
    {
      id: "1",
      name: "John Doe",
      age: 25,
    },
    {
      id: "2",
      name: "Jane Smith",
      age: 30,
    },
    {
      id: "3",
      name: "Alice Johnson",
      age: 28,
    },
    {
      id: "4",
      name: "Bob Brown",
      age: 32,
    },
    {
      id: "5",
      name: "Charlie Davis",
      age: 27,
    },
    {
      id: "6",
      name: "David Wilson",
      age: 31,
    },
    {
      id: "7",
      name: "Eve White",
      age: 29,
    },
  ];

  return (
    <TableComp>
      <TableCaption>Table Caption</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Age</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.id}</TableCell>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.age}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell>212</TableCell>
        </TableRow>
      </TableFooter>
    </TableComp>
  );
};

const importCode = `
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
`;

const usageCode = `
const data = [
  {
    id: "1",
    name: "John Doe",
    age: 25,
  }, {/* ... */}
];

<Table>
  <TableCaption>Table Caption</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>ID</TableHead>
      <TableHead>Name</TableHead>
      <TableHead>Age</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell className="font-medium">{item.id}</TableCell>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.age}</TableCell>
      </TableRow>
    ))}
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell colSpan={2}>Total</TableCell>
      <TableCell>212</TableCell>
    </TableRow>
  </TableFooter>
</Table>
`;

const Table = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Table" slug={slug} locale={locale}>
      <SectionDocs title={t("preview")}>
        <div className="border border-gray-200 dark:border-gray-800 rounded-md p-5">
          <TablePreview />
        </div>
      </SectionDocs>

      <SectionDocs title={t("import")}>
        <CodeBlock code={importCode} />
      </SectionDocs>
      <SectionDocs title={t("usage")}>
        <CodeBlock code={usageCode} />
      </SectionDocs>
    </LayoutDocs>
  );
};

export default Table;
