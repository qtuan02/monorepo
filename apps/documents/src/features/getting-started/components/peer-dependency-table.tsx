import { useTranslation } from "react-i18next";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@monorepo/ui/components/table";

import type { PeerDependency } from "~/constants/packages";

interface PeerDependencyTableProps {
  packageName: string;
  peers: readonly PeerDependency[];
}

/** One package's peer table — the versions a consumer installs themselves. */
export default function PeerDependencyTable({
  packageName,
  peers,
}: PeerDependencyTableProps) {
  const { t } = useTranslation();

  return (
    <div className="border-border overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead colSpan={2} className="font-mono">
              {packageName}
            </TableHead>
          </TableRow>
          <TableRow>
            <TableHead>{t("documents.home.peers.packageColumn")}</TableHead>
            <TableHead>{t("documents.home.peers.rangeColumn")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {peers.map((peer) => (
            <TableRow key={peer.name}>
              <TableCell className="font-mono">{peer.name}</TableCell>
              <TableCell className="font-mono">{peer.range}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
