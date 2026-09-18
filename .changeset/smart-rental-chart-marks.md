---
"@fe-monorepo/ui": minor
---

`chart` re-export các mark của recharts mà một biểu đồ cần đặt lên canvas — `Bar`,
`BarChart`, `CartesianGrid`, `Cell`, `Pie`, `PieChart`, `XAxis`, `YAxis` — bên cạnh
`ChartContainer` / `ChartTooltip` / `ChartLegend` như cũ.

Một app dựng biểu đồ từ đúng một entry `@fe-monorepo/ui/components/chart` mà không phải
cài `recharts` riêng. Không đổi API hiện có.
