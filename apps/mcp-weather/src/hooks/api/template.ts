import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import type { Template, TemplateListParams } from "@monorepo/types/template";

import type { UseQueryOptionsWrapper } from "~/libs/query-key-factory";
import { templateService } from "~/libs/http-client";
import { queryKeysFactory } from "~/libs/query-key-factory";

// One factory per entity. A second entity gets its own file and its own global
// key — never this namespace, or the two share a cache entry.
const templateQueryKeyFactory = queryKeysFactory("template");

export const templateQueryKeys = {
  ...templateQueryKeyFactory,
  getTemplates: (params?: TemplateListParams) =>
    templateQueryKeyFactory.list(params),
};

export const useGetTemplates = (
  params?: TemplateListParams,
  options?: UseQueryOptionsWrapper<Template[]>,
): UseQueryResult<Template[], Error> => {
  return useQuery<Template[], Error>({
    queryKey: templateQueryKeys.getTemplates(params),
    queryFn: () => templateService.getTemplates(params),
    ...options,
  });
};
