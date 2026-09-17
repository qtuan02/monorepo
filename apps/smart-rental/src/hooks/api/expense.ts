import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import type { Expense, ExpenseListParams } from "~/types/expense";
import { resolveBuildingName } from "~/constants/mock/buildings";
import { mockExpenses } from "~/constants/mock/expenses";
import { queryKeysFactory } from "~/libs/query-key-factory";

// The `building.ts` shape (spec #127): keys from the factory, a `queryFn` that
// answers with the Mock, joined to the Toà nhà Mock for its name.
const expenseQueryKeyFactory = queryKeysFactory("expense");

export const expenseQueryKeys = {
  ...expenseQueryKeyFactory,
  getExpenses: (params?: ExpenseListParams) =>
    expenseQueryKeyFactory.list(params),
  getExpense: (expenseId: string) => expenseQueryKeyFactory.detail(expenseId),
};

const withBuildingName = (record: Omit<Expense, "buildingName">): Expense => ({
  ...record,
  buildingName: resolveBuildingName(record.buildingId),
});

export function useGetExpenses(
  params?: ExpenseListParams,
  options?: UseQueryOptionsWrapper<Expense[]>,
): UseQueryResult<Expense[], Error> {
  return useQuery<Expense[], Error>({
    queryKey: expenseQueryKeys.getExpenses(params),
    // The Building scope is a query param, as it will be on the backend.
    queryFn: async () =>
      mockExpenses
        .filter(
          (expense) =>
            !params?.buildingId || expense.buildingId === params.buildingId,
        )
        .map(withBuildingName),
    ...options,
  });
}

export function useGetExpense(
  expenseId: string,
  options?: UseQueryOptionsWrapper<Expense | null>,
): UseQueryResult<Expense | null, Error> {
  return useQuery<Expense | null, Error>({
    queryKey: expenseQueryKeys.getExpense(expenseId),
    queryFn: async () => {
      const record = mockExpenses.find((expense) => expense.id === expenseId);
      return record ? withBuildingName(record) : null;
    },
    ...options,
  });
}
