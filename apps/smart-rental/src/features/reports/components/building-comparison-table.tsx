import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@monorepo/ui/components/table";

import type { BuildingComparisonRow } from "~/types/report";
import { StatusBadge } from "~/components/badge/status-badge";
import { occupancyBucketConfig } from "~/constants/status";
import { formatCurrency } from "~/utils/currency";
import { occupancyBucket } from "~/utils/report-rows";

interface BuildingComparisonTableProps {
  rows: BuildingComparisonRow[];
}

/** "Bảng so sánh giữa các Toà nhà" — scope `null` (spec #153 §10 row 29). */
export default function BuildingComparisonTable({
  rows,
}: BuildingComparisonTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">So sánh Toà nhà</CardTitle>
        <CardDescription>
          Tổng doanh thu, chi phí và lợi nhuận trong 6 kỳ gần nhất
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Toà nhà</TableHead>
              <TableHead className="text-right">Doanh thu</TableHead>
              <TableHead className="text-right">Chi phí</TableHead>
              <TableHead className="text-right">Lợi nhuận</TableHead>
              <TableHead className="text-center">Lấp đầy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.building}>
                <TableCell className="font-medium">{row.building}</TableCell>
                <TableCell className="text-success text-right font-medium tabular-nums">
                  {formatCurrency(row.revenue)}
                </TableCell>
                <TableCell className="text-destructive text-right font-medium tabular-nums">
                  {formatCurrency(row.expenses)}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatCurrency(row.profit)}
                </TableCell>
                <TableCell className="text-center">
                  <StatusBadge
                    config={{
                      ...occupancyBucketConfig[
                        occupancyBucket(row.occupancyRate)
                      ],
                      label: `${row.occupancyRate}%`,
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
