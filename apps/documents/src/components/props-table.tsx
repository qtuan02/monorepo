import type { ComponentProp } from "~/types/component-metadata";

interface PropsTableProps {
  props: ComponentProp[];
}

export default function PropsTable({ props }: PropsTableProps) {
  if (!props || props.length === 0) {
    return (
      <div
        className="border-border bg-muted/50 rounded-lg border p-8 text-center"
        data-testid="props-table-empty"
      >
        <p className="text-muted-foreground">
          No props available for this component.
        </p>
      </div>
    );
  }

  return (
    <div
      className="border-border overflow-x-auto rounded-lg border"
      data-testid="props-table"
    >
      <table className="w-full min-w-[600px] text-left text-sm">
        <thead className="bg-muted text-muted-foreground text-xs uppercase">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">
              Prop
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Type
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Default
            </th>
            <th scope="col" className="px-4 py-3 text-center font-semibold">
              Required
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Description
            </th>
          </tr>
        </thead>
        <tbody className="divide-border divide-y">
          {props.map((prop) => (
            <tr
              key={prop.name}
              className="bg-background hover:bg-muted/50"
              data-testid="props-table-row"
            >
              <td className="px-4 py-3 whitespace-nowrap">
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-sm font-medium">
                  {prop.name}
                </code>
              </td>

              <td className="px-4 py-3">
                <code className="block w-full max-w-[300px] min-w-[150px] font-mono text-xs break-words whitespace-pre-wrap text-purple-600 dark:text-purple-400">
                  {formatType(prop.type)}
                </code>
              </td>

              <td className="px-4 py-3">
                {prop.defaultValue ? (
                  <code className="font-mono text-xs text-green-600 dark:text-green-400">
                    {prop.defaultValue}
                  </code>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>

              <td className="px-4 py-3 text-center">
                {prop.required ? (
                  <span
                    className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    data-testid="required-badge"
                  >
                    Required
                  </span>
                ) : (
                  <span className="text-muted-foreground">Optional</span>
                )}
              </td>

              <td className="text-muted-foreground px-4 py-3">
                {prop.description || (
                  <span className="text-muted-foreground italic">
                    Description coming soon
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatType(type: string): string {
  if (type.length > 300) {
    return type.substring(0, 297) + "...";
  }
  return type;
}
