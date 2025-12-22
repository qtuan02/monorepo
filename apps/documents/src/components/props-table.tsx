import type { ComponentProp } from "~/types/component-metadata";

interface PropsTableProps {
  props: ComponentProp[];
}

export default function PropsTable({ props }: PropsTableProps) {
  if (!props || props.length === 0) {
    return (
      <div
        className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800"
        data-testid="props-table-empty"
      >
        <p className="text-gray-500 dark:text-gray-400">
          No props available for this component.
        </p>
      </div>
    );
  }

  return (
    <div
      className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700"
      data-testid="props-table"
    >
      <table className="w-full min-w-[600px] text-left text-sm">
        <thead className="bg-gray-50 text-xs text-gray-700 uppercase dark:bg-gray-800 dark:text-gray-400">
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
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {props.map((prop) => (
            <tr
              key={prop.name}
              className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/50"
              data-testid="props-table-row"
            >
              {/* Prop Name */}
              <td className="px-4 py-3 whitespace-nowrap">
                <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm font-medium text-gray-900 dark:bg-gray-700 dark:text-gray-100">
                  {prop.name}
                </code>
              </td>

              {/* Type */}
              <td className="px-4 py-3">
                <code className="block w-full max-w-[300px] min-w-[150px] font-mono text-xs break-words whitespace-pre-wrap text-purple-600 dark:text-purple-400">
                  {formatType(prop.type)}
                </code>
              </td>

              {/* Default Value */}
              <td className="px-4 py-3">
                {prop.defaultValue ? (
                  <code className="font-mono text-xs text-green-600 dark:text-green-400">
                    {prop.defaultValue}
                  </code>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">—</span>
                )}
              </td>

              {/* Required */}
              <td className="px-4 py-3 text-center">
                {prop.required ? (
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
                {prop.description || (
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
 * Handles long union types, generics, etc.
 */
function formatType(type: string): string {
  // Truncate very long types
  if (type.length > 300) {
    return type.substring(0, 297) + "...";
  }
  return type;
}
