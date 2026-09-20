import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";

import { HttpError } from "@monorepo/api/client";

import type {
  UseMutationOptionsWrapper,
  UseQueryOptionsWrapper,
} from "~/libs/query-key-factory";
import type {
  CreateExpenseRequest,
  Expense,
  ExpenseListParams,
  UpdateExpenseRequest,
} from "~/types/expense";
import { withBuildingName } from "~/constants/mock/buildings";
import { mockExpenses } from "~/constants/mock/expenses";
import { readWorld } from "~/libs/mock-world";
import { queryKeysFactory } from "~/libs/query-key-factory";

// The `building.ts` shape (spec #127): keys from the factory, a `queryFn` that
// answers through `readWorld` (ADR-0015), joined to the Toà nhà Mock for its
// name (`withBuildingName` reads that Mock directly — not a `hooks/api` file).
const expenseQueryKeyFactory = queryKeysFactory("expense");

export const expenseQueryKeys = {
  ...expenseQueryKeyFactory,
  getExpenses: (params?: ExpenseListParams) =>
    expenseQueryKeyFactory.list(params),
  getExpense: (expenseId: string) => expenseQueryKeyFactory.detail(expenseId),
};

export function useGetExpenses(
  params?: ExpenseListParams,
  options?: UseQueryOptionsWrapper<Expense[]>,
): UseQueryResult<Expense[], Error> {
  return useQuery<Expense[], Error>({
    queryKey: expenseQueryKeys.getExpenses(params),
    // The Building scope is a query param, as it will be on the backend.
    queryFn: async () =>
      readWorld(params?.buildingId ?? null).expenses.map(withBuildingName),
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
      const record = readWorld(null).expenses.find(
        (expense) => expense.id === expenseId,
      );
      return record ? withBuildingName(record) : null;
    },
    ...options,
  });
}

export function useCreateExpense(
  options?: UseMutationOptionsWrapper<CreateExpenseRequest, Expense>,
) {
  return useMutation({
    mutationFn: async (request: CreateExpenseRequest) => {
      const expense = { id: `exp-${mockExpenses.length + 1}`, ...request };
      mockExpenses.push(expense);
      return withBuildingName(expense);
    },
    ...options,
  });
}

export function useUpdateExpense(
  options?: UseMutationOptionsWrapper<UpdateExpenseRequest, Expense>,
) {
  return useMutation({
    mutationFn: async ({ expenseId, ...patch }: UpdateExpenseRequest) => {
      const expense = mockExpenses.find((item) => item.id === expenseId);
      if (!expense) {
        throw new HttpError({
          statusCode: 404,
          message: `Không tìm thấy khoản chi ${expenseId}.`,
        });
      }
      Object.assign(expense, patch);
      return withBuildingName(expense);
    },
    ...options,
  });
}

export function useDeleteExpense(options?: UseMutationOptionsWrapper<string>) {
  return useMutation({
    mutationFn: async (expenseId: string) => {
      const index = mockExpenses.findIndex(
        (expense) => expense.id === expenseId,
      );
      if (index !== -1) mockExpenses.splice(index, 1);
    },
    ...options,
  });
}
