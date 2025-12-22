import type { HookParameter } from "~/types/hook-metadata";

interface ParametersTableProps {
  parameters: HookParameter[];
}

export default function ParametersTable({ parameters }: ParametersTableProps) {
  if (!parameters || parameters.length === 0) {
    return (
      <div
        className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800"
        data-testid="parameters-table-empty"
      >
        <p className="text-gray-500 dark:text-gray-400">
          This hook takes no parameters.
        </p>
      </div>
    );
  }

  return (
    <div
      className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700"
      data-testid="parameters-table"
    >
      <table className="w-full min-w-[600px] text-left text-sm">
        <thead className="bg-gray-50 text-xs text-gray-700 uppercase dark:bg-gray-800 dark:text-gray-400">
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
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {parameters.map((param) => (
            <tr
              key={param.name}
              className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/50"
              data-testid="parameters-table-row"
            >
              {/* Parameter Name */}
              <td className="px-4 py-3 whitespace-nowrap">
                <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm font-medium text-gray-900 dark:bg-gray-700 dark:text-gray-100">
                  {param.name}
                </code>
              </td>

              {/* Type */}
              <td className="px-4 py-3">
                <code className="font-mono text-xs text-purple-600 dark:text-purple-400">
                  {formatType(param.type)}
                </code>
              </td>

              {/* Default Value */}
              <td className="px-4 py-3">
                {param.defaultValue ? (
                  <code className="font-mono text-xs text-green-600 dark:text-green-400">
                    {param.defaultValue}
                  </code>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">—</span>
                )}
              </td>

              {/* Required */}
              <td className="px-4 py-3 text-center">
                {param.required ? (
                  <span
                    className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    data-testid="required-badge"
                  >
                    Required
                  </span>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">
                    Optional
                  </span>
                )}
              </td>

              {/* Description */}
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                {param.description || (
                  <span className="text-gray-400 italic dark:text-gray-500">
                    No description
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

/**
 * Format complex TypeScript types for display
 */
function formatType(type: string): string {
  if (type.length > 80) {
    return type.substring(0, 77) + "...";
  }
  return type;
}
