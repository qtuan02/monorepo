---
status: ready-for-agent
---

# 13 — Ba khoản treo không ticket nào sở hữu (từ 07, 08)

**What to build:** Ba khoản mà ticket 07 và 08 tự viết là "thuộc ticket này" rồi đóng `done` mà chưa làm, và ticket 12 chỉ liệt kê lại trong "Còn treo". Chúng có thật, đều nhỏ, và đều làm hỏng một lời hứa của Skeleton: một app sinh từ generator phải chạy được cạnh Template sinh ra nó; e2e phải kiểm đúng thứ image ship; và Template Vite phải làm gương cho app thật về a11y. Ticket này nhận cả ba.

**Blocked by:** — (07 và 08 đã `done`; không phụ thuộc ticket 12, vốn chỉ còn chờ Docker và CI).

**Status:** ready-for-agent

---

## 1. Mỗi app khai **một** port, cả hai config cùng đọc — *đã giao cho `legacy-migrate` 01*

> **Mục này không còn do ticket 13 làm.** Nó được nhận trọn bởi
> [`.agents/plans/legacy-migrate/01-prefactor-port-hygiene-readme.md`](../legacy-migrate/01-prefactor-port-hygiene-readme.md),
> vì mọi ticket migrate đều cần app sinh ra chạy được cạnh Template của nó, nên
> khoản này là điều kiện tiên quyết của cả topic đó chứ không phải một khoản treo lẻ.
> Vết đi đầy đủ: ticket 12 → ticket 13 §1 → `legacy-migrate` 01.
>
> **Hình dạng đã chốt ở bên đó** (khác gợi ý bên dưới ở chỗ nguồn là một file `.env`
> chứ không phải một module TypeScript, để generator chỉ phải viết lại hai dòng số):
> mỗi app khai `apps/<app>/ports.env` với đúng hai dòng `PORT=` và `E2E_PORT=` —
> đây là **chỗ duy nhất** hai con số được viết — cạnh đó là `apps/<app>/ports.ts`,
> một reader có kiểu đọc file ấy bằng `readFileSync` và xuất `DEV_PORT`/`E2E_PORT`
> cho `vite.config.ts`/`next.config.ts` và `playwright.config.ts`. Cấp phát một cặp
> mỗi app: dev `3000+n`, e2e `3100+n`. `apps/storybook` cố ý nằm ngoài hai dải (6006
> của chính Storybook, và không có server E2E) nên không khai `ports.env`.
>
> **Năm ô dưới đây đã lật `[ ]`→`[x]` (2026-09-04), và lật *từ* `legacy-migrate` 01**,
> sau khi smoke test generator của ticket đó chạy thật: app sinh ra nhận 3002/3102 và
> 3003/3103, bốn dev server lên cùng lúc và mỗi cái trả 200 trên đúng cổng của nó.
> **Bằng chứng đầy đủ nằm ở ticket đó**, không chép lại ở đây — §1 chỉ ghi rằng nó đã
> xong và ai đã làm.
>
> `status` của ticket 13 **giữ nguyên `ready-for-agent`**: §2 và §3 vẫn treo đủ.

**Triệu chứng (trạng thái lúc mở ticket — đã sửa, xem banner ngay trên).** `_template_vite` ghi cứng `3000` ở hai chỗ độc lập:

- `apps/_template_vite/vite.config.ts` → `server.port: 3000`
- `apps/_template_vite/playwright.config.ts` → `const PORT = 3000` **và** chuỗi `webServer.command` chứa `--port 3000 --strictPort`

Generator `app` (`turbo/generators/config.ts`) clone Template nguyên văn, nên **app đầu tiên sinh từ `_template_vite` va port với chính `_template_vite`** — smoke test của ticket 09 đã phải chạy hai app *lần lượt* vì đúng lý do này. `_template_next` cùng hình dạng (`3001` cho dev, `3101` cho e2e, khai ở hai file), nên bản sửa phải phủ cả hai Template và phải được generator biết tới.

**Ràng buộc khi sửa (ticket 07 đã cảnh báo, đừng bỏ qua).** Các literal port đang nằm **giữa những comment giải thích chính chúng** — ví dụ comment trong `playwright.config.ts` của `_template_next` nói rõ 3101 "deliberately not the dev port (3001) and not the Vite template's (3000)". Đổi bằng regex sẽ để lại những câu comment nói dối. Sửa tay từng chỗ, và cập nhật comment cùng lúc.

**Gợi ý hình dạng, không bắt buộc.** Một nguồn duy nhất cho mỗi app mà cả `vite.config.ts`/`next.config.ts` lẫn `playwright.config.ts` đều import được (ví dụ `apps/<app>/ports.ts` xuất `DEV_PORT` và `E2E_PORT`), rồi generator ghi lại đúng file đó khi clone. Cân nhắc: file này chạy trong context config (Node/Bun trước bundler), nên nó không được import gì từ `src/`. *(Bản chốt ở `legacy-migrate` 01 tách gợi ý này làm đôi — `ports.env` giữ hai con số, `ports.ts` là reader — xem banner đầu mục.)*

- [x] `_template_vite` và `_template_next` mỗi app khai port ở đúng **một** chỗ; `vite.config.ts`/`next.config.ts`, `playwright.config.ts` và mọi script trong `package.json` đọc từ đó — thực hiện ở `legacy-migrate` 01 (`ports.env` + `ports.ts`)
- [x] Comment quanh các port cũ được viết lại cho khớp, không còn câu nào nhắc một literal đã biến mất — thực hiện ở `legacy-migrate` 01
- [x] Generator `app` gán port mới cho app clone (không trùng Template, không trùng app đã sinh), và ghi lý do trong `turbo/generators/config.ts` — thực hiện ở `legacy-migrate` 01 (generator viết lại hai dòng số trong `ports.env` của bản clone)
- [x] Kiểm bằng tay: sinh một app mỗi Runtime, chạy **song song** với chính Template của nó (`bun run dev:template-vite` + `bun run dev:<app mới>` cùng lúc), cả hai lên; rồi xoá app và revert root scripts như ticket 09 đã làm — smoke test này là acceptance criterion của `legacy-migrate` 01, kết quả ghi trong Notes của ticket đó
- [x] Gate 4/4 xanh, 0 warning — Gate của lượt sửa port ghi ở `legacy-migrate` 01, không ghi lại ở đây

## 2. E2E của `_template_next` chạy đúng binary mà image chạy

**Triệu chứng.** `apps/_template_next/playwright.config.ts` dùng `webServer.command` = `bun run build && bun run start`, với E2E port truyền qua `webServer.env.PORT` đọc từ `apps/_template_next/ports.env` (`legacy-migrate` 01 đã đổi hình dạng này; trước đó là `dotenv -e ../../.env -- next start --port 3101`). Vì `webServer` nay đi qua **chính script `start` của app**, chuyển sang standalone là **một** sửa trong `package.json` chứ không phải hai chỗ phải giữ đồng bộ. Next 16 in ngay trong log e2e:

```
⚠ "next start" does not work with "output: standalone" configuration.
  Use "node .next/standalone/server.js" instead.
```

Sáu spec vẫn xanh, nên đây không phải bug đang cháy — nhưng hệ quả thì thật: **e2e không kiểm thứ Docker ship.** Container chạy `node server.js` từ `.next/standalone`; Playwright chạy `next start`. Script `start` trong `package.json` dính đúng vấn đề đó.

**Vì sao không phải một dòng.** `next build` **không** copy `public/` và `.next/static` vào standalone — Dockerfile làm việc đó. Muốn chạy standalone ngoài image thì phải copy trước, và bước copy phải chạy được trên **cả Windows lẫn Linux**, nên nó là một script Node nhỏ (`fs.cpSync`) chứ không phải `cp -r` trong chuỗi `webServer.command` (shell của Playwright trên Windows là cmd.exe).

**Rủi ro đã đo, phải xử lý trước khi chốt.** Chạy thẳng `node .next/standalone/apps/_template_next/server.js` trên **máy Windows này** chết ngay:

```
Error: EPERM: operation not permitted, stat
'…\.next\standalone\node_modules\.bun\next@16.3.4+…\node_modules\react'
```

Node không stat được symlink mà `next build` sinh trong standalone. Runner của image là `node:24-alpine` nên nó không gặp lỗi này, nhưng nếu `webServer` chuyển sang standalone thì **e2e local trên Windows sẽ đỏ**. Vậy bản sửa phải chọn một trong hai và ghi lý do: chỉ chuyển sang standalone khi `process.env.CI`, hay tìm cách làm symlink kia đọc được (chẳng hạn copy thay vì để nguyên link).

- [ ] `webServer.command` và script `start` chạy `node .next/standalone/apps/<app>/server.js`, sau một bước copy `public` + `.next/static` viết bằng Node
- [ ] Đường dẫn `apps/<app>` trong đó suy ra từ config chứ không ghi cứng (nó phụ thuộc `outputFileTracingRoot`, và generator đổi tên app)
- [ ] Không còn dòng `⚠ "next start" does not work…` trong log e2e
- [ ] Quyết định về EPERM trên Windows được ghi lại trong ticket, và e2e local vẫn chạy được trên máy Windows
- [ ] 6 spec vẫn xanh; ít nhất một spec đọc HTML thô để chứng minh SSR đến từ standalone

## 3. `<html lang>` của `_template_vite` theo ngôn ngữ đang chọn

**Triệu chứng.** Đo trong Chromium thật ở ticket 12: đổi ngôn ngữ sang English thì clock đổi đúng (`Thứ sáu` → `Friday`) nhưng `document.documentElement.lang` **vẫn là `vi`**. `_template_next` thì đúng — `<html lang="vi">` ở `/`, `<html lang="en">` ở `/en` — nên đây là chỗ Template Vite lệch, không phải chuẩn của repo.

Hệ quả: screen reader đọc sai giọng, `lang`-based CSS và dịch tự động của trình duyệt nhìn nhầm ngôn ngữ. Nhỏ, nhưng Template là thứ mọi app sau clone.

**Gợi ý.** Đặt cạnh bridge đã có ở `apps/_template_vite/src/libs/dayjs.ts` (`i18n.on("languageChanged", …)`): một chỗ đồng bộ `document.documentElement.lang` với `i18n.resolvedLanguage`, chạy cả lần đầu chứ không chỉ khi đổi. Đừng làm trong component — nó không phải chuyện của render, và `react-effects-sync-only` nói đúng loại việc này thuộc lớp wiring.

- [ ] `<html lang>` khớp `i18n.resolvedLanguage` ngay khi boot và sau mỗi lần đổi ngôn ngữ
- [ ] Có test cho nó (jsdom đọc được `document.documentElement.lang`, nên đây là unit test chứ không cần e2e)
- [ ] Gate 4/4 xanh, 0 warning

---

## Liên quan, cố ý **không** nằm trong ticket này

Ghi ra để không mất; mỗi khoản cần một quyết định riêng trước khi thành ô.

- **`_template_vite` không validate env lúc build.** Phát hiện ở ticket 12: trên một clone mới chưa có `.env`, `_template_next` **đỏ** ngay lúc build với thông báo đúng, còn `_template_vite` và `storybook` **xanh** — Vite nướng `import.meta.env.PUBLIC_*` lúc build nhưng `createEnv` của app chỉ chạy trong browser, nên kết quả là một bundle hỏng chứ không phải một build đỏ. Thứ duy nhất bắt được là bước validate tường minh trong Dockerfile, tức là chỉ ở đường image. Muốn hai Runtime hành xử giống nhau thì script `build` của app Vite cần một bước validate.
- **`packages/ui` — `w-[60%]` chết trong `slider.stories.tsx`.** `cn("data-horizontal:w-full …", className)` để `w-full` sau một variant prefix nên tailwind-merge không coi hai class là xung khắc; ở orientation ngang thì `data-horizontal:w-full` thắng và track chiếm trọn bề ngang. Đụng vào `packages/ui` là đụng vào primitive dùng chung, nên cần quyết định riêng.
- **Không có story Slider dọc** trong `apps/storybook`, nên chiều dọc của Slider chỉ được chứng minh gián tiếp (qua Separator + ScrollArea, cùng hai `@custom-variant`).
