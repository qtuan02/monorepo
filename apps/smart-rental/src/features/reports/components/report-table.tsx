import { Badge } from "@monorepo/ui/components/badge";
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

import type { ReportRow } from "~/types/report";
import {
  occupancyBucket,
  occupancyBucketConfig,
} from "~/features/reports/utils/report-filters";
import { formatCurrency } from "~/utils/currency";

interface ReportTableProps {
  rows: ReportRow[];
}

/** "Tổng hợp P&L": one row per month × Toà nhà × floor. */
export default function ReportTable({ rows }: ReportTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tổng hợp P&L</CardTitle>
        <CardDescription>
          Doanh thu, chi phí và lợi nhuận theo tòa/tầng
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tháng</TableHead>
              <TableHead>Tòa/Tầng</TableHead>
              <TableHead className="text-right">Doanh thu</TableHead>
              <TableHead className="text-right">Chi phí</TableHead>
              <TableHead className="text-right">Lợi nhuận</TableHead>
              <TableHead className="text-center">Lấp đầy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const bucket =
                occupancyBucketConfig[occupancyBucket(row.occupancyRate)];

              return (
                <TableRow key={`${row.month}-${row.building}-${row.floor}`}>
                  <TableCell>{row.month}</TableCell>
                  <TableCell>
                    {row.building} - {row.floor}
                  </TableCell>
                  <TableCell className="text-right font-medium text-emerald-600 tabular-nums">
                    {formatCurrency(row.revenue)}
                  </TableCell>
                  <TableCell className="text-destructive text-right font-medium tabular-nums">
                    {formatCurrency(row.expenses)}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCurrency(row.profit)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={bucket.className}>
                      {row.occupancyRate}%
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
