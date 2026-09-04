type HomeTemplateProps = {
  /** The environment this bundle was built against, resolved by the route's loader. */
  appEnv: string;
};

/**
 * The home screen, rendered on the server before any JavaScript runs.
 *
 * The strings are literals for now. The i18n ticket moves them into the shared
 * ICU catalogue under a `templateReactRouter.*` namespace and threads the
 * negotiated language down from `root.tsx`; until then a literal is honest,
 * where a half-wired `t()` would not be.
 */
export default function HomeTemplate({ appEnv }: HomeTemplateProps) {
  return (
    <main className="container mx-auto flex min-h-dvh flex-col justify-center gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3">
        <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
          Runtime · React Router framework mode
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Template React Router
        </h1>
        <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
          Trang này được server render và gửi đi hoàn chỉnh trước khi bất kỳ
          JavaScript nào chạy. Clone app này khi cần SSR/SEO mà vẫn muốn ở trong
          hệ sinh thái Vite — cùng bundler, cùng React Compiler, cùng cây{" "}
          <code className="bg-muted rounded px-1 py-0.5 text-xs">src/</code> với
          Template SPA.
        </p>
      </header>

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border-border rounded-lg border p-4">
          <dt className="text-muted-foreground text-xs font-medium">Render</dt>
          <dd className="mt-1 text-sm font-medium">SSR, ssr: true</dd>
        </div>
        <div className="border-border rounded-lg border p-4">
          <dt className="text-muted-foreground text-xs font-medium">Runner</dt>
          <dd className="mt-1 text-sm font-medium">react-router-serve</dd>
        </div>
        <div className="border-border rounded-lg border p-4">
          <dt className="text-muted-foreground text-xs font-medium">
            Route table
          </dt>
          <dd className="mt-1 text-sm font-medium">src/routes.ts + href()</dd>
        </div>
        <div className="border-border rounded-lg border p-4">
          <dt className="text-muted-foreground text-xs font-medium">
            Environment
          </dt>
          <dd className="mt-1 text-sm font-medium">{appEnv}</dd>
        </div>
      </dl>
    </main>
  );
}
