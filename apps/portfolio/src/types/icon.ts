import type { LucideProps } from "lucide-react";
import type * as React from "react";

/**
 * A lucide icon as a component.
 *
 * Spelled `ComponentType` rather than lucide's own
 * `ForwardRefExoticComponent<…>`: React 19 passes `ref` as a plain prop, so the
 * forwardRef spelling names an implementation detail this app no longer has.
 *
 * It lives in the app's foundation layer rather than in a slice because both
 * `features/home` and `features/layout` key data on it, and a slice may not
 * import another slice's internals.
 */
export type IconComponent = React.ComponentType<LucideProps>;
