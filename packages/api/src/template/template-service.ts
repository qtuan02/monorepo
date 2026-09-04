import type { Template, TemplateListParams } from "@monorepo/types/template";

import type { HttpClient } from "../client";

/**
 * The worked example of a service: one place that binds an endpoint's path, the
 * params it accepts, and the payload it returns. A caller learns `Template[]`
 * and nothing else.
 *
 * A real service lives at `src/<system>/<domain>-service.ts` — the folder names
 * the backend system it talks to (`core`, `billing`, …), the file names the
 * domain inside it, and the class is `<System><Domain>Service`
 * (`src/billing/invoice-service.ts` → `BillingInvoiceService`). One class per
 * (system, domain) pair, never one class carrying a `system` flag: two backends
 * serving the same domain return different payloads, and absorbing that is the
 * service's job. `template/template-service.ts` stands in for both halves of the
 * path — copy its shape, not its name.
 */
export class TemplateService {
  constructor(private client: HttpClient) {}

  getTemplates(params?: TemplateListParams): Promise<Template[]> {
    return this.client.get<Template[]>("/templates", { params });
  }
}
