import type { Meta, StoryObj } from "@storybook/react";
import {
  BookOpen,
  Layers,
  Package,
  Palette,
  Sparkles,
  Zap,
} from "lucide-react";

const meta = {
  title: "Storybook/Introduction",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function IntroductionContent() {
  const highlights = [
    {
      icon: Layers,
      title: "Component catalog",
      description:
        "Mỗi component trong @monorepo/ui có story riêng: biến thể, kích thước và trạng thái tương tác để bạn đối chiếu nhanh với design.",
    },
    {
      icon: Palette,
      title: "Tailwind & theme",
      description:
        "Giao diện dùng cùng token và @source như app documents — preview sát với production.",
    },
    {
      icon: Sparkles,
      title: "Radix + shadcn-style",
      description:
        "Primitive có sẵn accessibility; stories minh họa dialog, menu, sheet và các pattern phức tạp.",
    },
  ];

  const tips = [
    {
      icon: Zap,
      title: "Điều hướng",
      description: "Dùng sidebar trái để chọn nhóm UI/* và mở từng story.",
    },
    {
      icon: BookOpen,
      title: "Docs & Controls",
      description:
        "Tab Docs xem mô tả; tab Controls chỉnh props trực tiếp (khi story hỗ trợ).",
    },
    {
      icon: Package,
      title: "Monorepo",
      description:
        "Stories nằm trong packages/ui/src/stories — import trực tiếp từ source, không cần build package trước khi dev.",
    },
  ];

  return (
    <div className="bg-background text-foreground min-h-[calc(100vh-2rem)]">
      <div className="mx-auto max-w-5xl space-y-12 px-6 py-10 md:py-14">
        <header className="space-y-4">
          <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            @monorepo/ui
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Storybook
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
            Không gian xem trước tương tác cho thư viện giao diện dùng chung
            trong monorepo — cùng tinh thần với trang{" "}
            <span className="text-foreground font-medium">Documents</span>: rõ
            ràng, có cấu trúc, dễ lướt.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="border-border bg-card rounded-xl border p-5 shadow-sm">
            <div className="text-muted-foreground mb-1 text-xs font-medium uppercase">
              Phạm vi
            </div>
            <div className="text-3xl font-bold tabular-nums">UI</div>
            <div className="text-muted-foreground mt-1 text-sm">
              Form controls → overlays → navigation
            </div>
          </div>
          <div className="border-border bg-card rounded-xl border p-5 shadow-sm">
            <div className="text-muted-foreground mb-1 text-xs font-medium uppercase">
              Stack
            </div>
            <div className="text-lg leading-snug font-semibold">
              React 19 · Tailwind v4 · Storybook 8
            </div>
            <div className="text-muted-foreground mt-1 text-sm">
              Vite build, workspace pnpm
            </div>
          </div>
          <div className="border-border bg-card rounded-xl border p-5 shadow-sm">
            <div className="text-muted-foreground mb-1 text-xs font-medium uppercase">
              Gợi ý
            </div>
            <div className="text-lg leading-snug font-semibold">
              Bắt đầu từ UI/Button
            </div>
            <div className="text-muted-foreground mt-1 text-sm">
              Rồi thử Dialog, Select, Form
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Vì sao dùng Storybook?
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="border-border bg-card hover:border-primary/30 rounded-xl border p-6 transition-colors"
              >
                <div className="border-border mb-4 inline-flex rounded-lg border p-3">
                  <item.icon className="size-6" aria-hidden />
                </div>
                <h3 className="mb-2 font-semibold">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Cách dùng nhanh
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {tips.map((item) => (
              <div
                key={item.title}
                className="border-border bg-muted/30 flex gap-4 rounded-xl border p-5"
              >
                <div className="border-border bg-background shrink-0 rounded-lg border p-2.5">
                  <item.icon className="size-5" aria-hidden />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="text-muted-foreground border-border border-t pt-8 text-sm">
          <p>
            Chạy local:{" "}
            <code className="bg-muted rounded-md px-2 py-0.5 text-xs">
              pnpm dev:storybook
            </code>
            {" · "}
            Build tĩnh:{" "}
            <code className="bg-muted rounded-md px-2 py-0.5 text-xs">
              pnpm --filter @monorepo/storybook build
            </code>
          </p>
        </footer>
      </div>
    </div>
  );
}

export const Welcome: Story = {
  render: () => <IntroductionContent />,
};
