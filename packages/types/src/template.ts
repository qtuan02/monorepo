/**
 * The worked example of a domain type. `/templates` is a placeholder endpoint —
 * replace this shape, and the service that returns it, with a real entity.
 *
 * Domain types live here rather than in an app's `~/types` because
 * `@monorepo/api` services must be able to import them, and a package cannot
 * reach into an app.
 */
export interface Template {
  id: string;
  name: string;
}

/**
 * The query params `GET /templates` accepts. Each endpoint declares its own —
 * there is no shared request bag, so a param that is not on this type cannot be
 * sent by accident.
 */
export interface TemplateListParams {
  page?: number;
  limit?: number;
}
