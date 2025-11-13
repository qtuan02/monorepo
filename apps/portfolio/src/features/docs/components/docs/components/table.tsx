import {
  TableBody,
  TableCaption,
  TableCell,
  Table as TableComp,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@monorepo/ui/shadcn-ui/table";
import { getTranslations } from "next-intl/server";

import { IDocComponentProps } from "~/types/docs";
import CodeBlock from "../../common/code-block";
import LayoutDocs from "../../common/layout-docs";
import SectionCode from "../../common/section-code";
import SectionPreview from "../../common/section-preview";

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
} from "@monorepo/ui/shadcn-ui/table";
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
      <SectionPreview title={t("preview")}>
        <TablePreview />
      </SectionPreview>

      <SectionCode title={t("import")}>
        <CodeBlock code={importCode} />
      </SectionCode>
      <SectionCode title={t("usage")}>
        <CodeBlock code={usageCode} />
      </SectionCode>
    </LayoutDocs>
  );
};

export default Table;
