import type { HookParameter } from "~/types/hook-metadata";

interface ParametersTableProps {
  parameters: HookParameter[];
}

export default function ParametersTable({ parameters }: ParametersTableProps) {
  if (!parameters || parameters.length === 0) {
    return (
      <div
        className="border-border bg-muted/50 rounded-lg border p-8 text-center"
        data-testid="parameters-table-empty"
      >
        <p className="text-muted-foreground">This hook takes no parameters.</p>
      </div>
    );
  }

  return (
    <div
      className="border-border overflow-x-auto rounded-lg border"
      data-testid="parameters-table"
    >
      <table className="w-full min-w-[600px] text-left text-sm">
        <thead className="bg-muted text-muted-foreground text-xs uppercase">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">
              Parameter
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
          {parameters.map((param) => (
            <tr
              key={param.name}
              className="bg-background hover:bg-muted/50"
              data-testid="parameters-table-row"
            >
              <td className="px-4 py-3 whitespace-nowrap">
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-sm font-medium">
                  {param.name}
                </code>
              </td>

              <td className="px-4 py-3">
                <code className="font-mono text-xs text-purple-600 dark:text-purple-400">
                  {formatType(param.type)}
                </code>
              </td>

              <td className="px-4 py-3">
                {param.defaultValue ? (
                  <code className="font-mono text-xs text-green-600 dark:text-green-400">
                    {param.defaultValue}
                  </code>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>

              <td className="px-4 py-3 text-center">
                {param.required ? (
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
                {param.description || (
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
  if (type.length > 80) {
    return type.substring(0, 77) + "...";
  }
  return type;
}
