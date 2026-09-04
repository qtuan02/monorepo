import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@monorepo/ui/components/table";

interface ExportTableProps {
  exports: readonly string[];
  /** Column header — the caller passes the localized "Export" label. */
  label: string;
}

/**
 * The one table this site has, and the only one it can honestly build: a
 * parser reads a module's exports, not the types of a component's props.
 * Props tables live in Storybook, where `addon-docs` derives them from the
 * real types.
 */
export function ExportTable({ exports, label }: ExportTableProps) {
  return (
    <div className="border-border overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{label}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exports.map((name) => (
            // The export name is unique within its module, so it is the stable
            // key — never the index (see quality-list-keys).
            <TableRow key={name}>
              <TableCell className="font-mono">{name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
