---
"@fe-monorepo/ui": minor
---

`data-table` thêm `useDataTable`, `DataTableContent` và hai type `DataTableColumnDef` /
`DataTableInstance`.

`DataTable` vẫn là hình dạng đủ pin như cũ, giờ đứng trên cùng hook và cùng phần
`<table>` đó. Một composite muốn tự vẽ toolbar, pagination hay để filter/page sống trên
URL thì gọi `useDataTable` với `state` + `on…Change` controlled và render bằng
`DataTableContent` — không phải chép lại bộ feature v9 hay đoạn header/rows. Không đổi
API hiện có.
