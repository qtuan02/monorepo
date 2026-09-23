# `apps/portfolio` — fill dữ liệu cho đầy (3+ năm, Software Engineer, khám sức khoẻ, 2 project) và soát UI (xuống dòng, sticky)

> Ngày kiểm tra: **2026-09-22**, nhánh `dev`, HEAD `9d1627d` (working tree chỉ dirty `CLAUDE.md`). Nguồn: chỉ primary sources — code `apps/portfolio` + `packages/i18n`, các note/brief đã có (`docs/research/portfolio-cv-data-rebuild.md` là tiền thân trực tiếp của note này; `docs/design/portfolio-{rebuild,redesign-v2,responsive}.md`; ADR-0008/0009/0014/0016), **PDF CV** trong `D:\hồ sơ` (đọc bằng `pdftotext`; xem giới hạn ở §2), source MedViet trên `E:\MedViet` (chỉ `README.md` / `CONTEXT.md` / `package.json` / `git log`, không đi sâu), **GitHub API** qua `gh`, và `curl` lên các URL đã ghi trong repo. Mọi claim có `path:line`, `PDF#trang`, hoặc URL; chỗ chưa có nguồn ghi **"chưa có, chủ repo cần cung cấp"**.
>
> **Ba loại nội dung, đánh dấu suốt file:** **FACT** = có nguồn; **TARGET** = đích theo brief của chủ repo (3+ năm, Software Engineer) — không phải sự thật đã kiểm; **đề xuất** = bản nháp của agent (copy, bullet, hướng sửa UI) — chưa ai duyệt. Không bịa số, không bịa URL.
>
> **Không sửa file nào ngoài note này, không commit, không chạy build/dev/E2E** (working tree đang có phiên khác dùng chung — xem memory `concurrent-sessions-main-clone`).

Cấu trúc: **§1 Câu hỏi & phạm vi** → **§2 Nguồn đã đọc** → **§3 Hiện trạng dữ liệu** → **§4 Timeline 3+ năm** → **§5 MedViet — khám sức khoẻ** → **§6 Projects: chat & documents** → **§7 UI — vấn đề tìm thấy** → **§8 Ràng buộc từ rules** → **§9 Câu hỏi mở**.

---

## §1. Câu hỏi & phạm vi

Brief của chủ repo (nguyên văn):

> apps/portfolio, nghiên cứu fill bùa thêm value và xử lí lại 1 số UI cho đẹp:
> - bùa thông tin profile lên 3+ exp cho chuẩn, là software engineer nhé
> - thông tin chuẩn hóa lại từng phần một cho chuyên nghiệp và đầy đủ hơn
> - 1 số UI cần điều chỉnh để chuẩn hơn
> - dự án cá nhân 2 cái là chat và documents thôi, tất cả đều có link dẫn nhé, mô tả thêm về project
> - phần exp ở medviet thiết phần khám sức khỏe
> - tôi muốn fill dữ liệu cho đầy đặn hơn và UI xử lí dữ liệu hiển thị trông đẹp hơn, không xuống dòng hay sticky các card không cần thiết

Sáu việc, hai loại: **dữ liệu** (3+ năm, chuẩn hoá từng section, khám sức khoẻ, 2 project có link) và **UI** (xuống dòng, sticky, polish). Note này không quyết mốc thời gian, không chọn wording — nó bày bảng để chủ repo chọn, rồi bước design/grill làm tiếp (`.agents/workflow.md`).

**Tóm tắt 10 dòng (điều quan trọng nhất):**

1. **Bullet "Khám sức khoẻ" đã có** trong row MedViet, nhưng *gộp* vào bullet `monorepo` (`vi.json:144`), không phải bullet riêng — chủ repo nói "thiếu" có thể vì nó bị chìm. Nguồn để tách thành bullet riêng rất dày: app `E:\MedViet\frontend\medviet\apps\health-exam` có **282/299 commit** của `@tuanhq`, 20/08 → 22/09/2026, 323 file source, 163 file test/E2E, 40 ADR (§5).
2. **Portfolio đang in "2+ năm"** ở 3 chỗ × 2 locale (`vi.json:111,132`; `en.json:111,132`) và **role MedViet đã là "Kỹ sư phần mềm / Software Engineer"** (`vi.json:141`, `en.json:141`). Việc "3+ năm" là đảo lại quyết định #4 của grill 2026-09-06 (`docs/design/portfolio-rebuild.md:269`). Ba phương án A/B/C đã có ở note tiền thân, bảng lại ở §4 với con số tính đến 09/2026.
3. **Link demo của project `monorepo` đã chết**: `https://portfolio-ui-2025.vercel.app` (`resume.ts:129`) trả **404** hôm nay. Portfolio thật đang sống ở `https://portfolio-tuanhq.vercel.app` (homepage của repo GitHub `qtuan02/monorepo`, `curl` 200, `<title>Huỳnh Quốc Tuấn</title>`).
4. **Projects hiện có 3 card** (`monorepo`, `chat-socket`, `documents` — `resume.ts:116-159`); card `documents` **không có `demo`** (`resume.ts:148-158`) dù `https://documents-ui.vercel.app` đang sống và serve đúng build Prism (`<title>Tài liệu @fe-monorepo</title>` = `apps/documents/index.html:7`).
5. **`https://chat-socket-fe.vercel.app` đang serve bản Rsbuild cũ** (asset `/static/js/lib-react.*.js`), tức repo `chat-socket-fe` đã archive (`gh api`: `archived: true`, push cuối 2026-06-18) — **không phải** `apps/chat` Islands. URL deploy của `apps/chat` mới **không có trong repo, issue, hay memory** → chủ repo cần cung cấp.
6. **Sticky duy nhất trên trang** là rail `<aside>` (`home.template.tsx:54`, `md:sticky md:top-6 md:self-start`) — đây là quyết định Q11 của vòng responsive (`docs/design/portfolio-responsive.md:189`) và **E2E đang khoá** (`viewport.e2e.ts:131-156` cuộn rồi assert `aside.y ≥ 0`). Rail chứa Skills + Education + Contact + Hobbies — cao hơn viewport laptop 768px là khả năng thật; §7.1 phân tích.
7. **Xuống dòng có hệ thống**, không phải lỗi lẻ: Contact `sm:w-24` (96px) + giá trị LinkedIn 36 ký tự (`contact-section.tsx:42`, `vi.json:238`) **wrap ở mọi bề rộng desktop** (rail tối đa ~330px); hàng link của Project (`project-row.tsx:61-64`) wrap dưới tên ở cột đọc ≤ ~600px; header Work row wrap period xuống dòng hai dưới `sm` (cố ý, `resume-card.tsx:83-86`).
8. **Test đang pin dữ liệu**: `resume.test.ts:53-57` pin đúng `["medviet","arobid","dcorp"]`; `:73-74` cap `techStack ≤ 6` mỗi project; `messages.test.ts` fail khi có key `portfolio.*` mồ côi; `accent.e2e.ts:232` đếm **3** work row; `print-and-motion.e2e.ts:78` đếm **10** `StandardBlock`; `viewport.e2e.ts:604` bám text `"Real-time Chat"` + 3 link. Bỏ card / đổi tên project = sửa test cùng lúc.
9. **Backend `health-exam-server` (.NET 8) không phải của chủ repo** (`git log`: haringuyendev 215, Nguyen Minh Phuong 45, Claude AI 29, không có `@tuanhq`) — bullet khám sức khoẻ chỉ nên nói phía **frontend**; bullet `.NET 8` hiện có (`vi.json:147`) là về `his-server`, giữ tách bạch.
10. PDF mới nhất (`D:\hồ sơ\software\CV_Huynh_Quoc_Tuan.pdf`, 2026-06-06) đã tự xưng **"Software Engineer with 3+ years"** (tr.1) — nghĩa là TARGET 3+ đã từng in ở CV giấy, chỉ portfolio đang in 2+.

---

## §2. Nguồn đã đọc

| # | Nguồn | Loại | Dùng cho |
|---|---|---|---|
| R1 | `docs/research/portfolio-cv-data-rebuild.md` (458 dòng, 2026-09-06) | note tiền thân | §3 hồ sơ FACT, §4.1 bảng 8 CV × công ty, §4.3 phương án A/B/C, §5.3 MedViet, §7.3 shortlist project |
| R2 | `docs/design/portfolio-rebuild.md` §9 (`:260-300`) | brief v1 + 25 quyết định grill 2026-09-06 | timeline A, "2+ năm", 4 bullet MedViet, 3 card project |
| R3 | `docs/design/portfolio-redesign-v2.md` | brief v2 | hình dạng Terminal / neubrutalist; "2+ năm là mốc mỏng" (`:87`, ADR-0008 `:15`) |
| R4 | `docs/design/portfolio-responsive.md` §3, §8 (`:91-125`, `:171-200`) | brief vòng 3 | rail sticky từ `md` (Q11), Work row grid, link 32px |
| R5 | `docs/adr/0008-portfolio-neubrutalist-neutral-override.md` | ADR | hợp đồng hình khối, mono/sans, không fade |
| R6 | `docs/adr/0009-*.md`, `0014-*.md`, `0016-*.md` | ADR | mô tả documents (Prism), refresh-token opt-in, chat (Islands) |
| C1 | `apps/portfolio/src/features/home/constants/resume.ts` (261 dòng) | code | cấu trúc CV |
| C2 | `apps/portfolio/src/features/home/types/resume.ts` (117 dòng) | code | schema |
| C3 | `apps/portfolio/src/constants/profile.ts` | code | link liên hệ |
| C4 | `packages/i18n/src/locales/vi.json:108-257`, `en.json:108-257` | catalogue | mọi chuỗi `portfolio.*` |
| C5 | 13 component dưới `apps/portfolio/src/features/home/components/`, `templates/home.template.tsx`, `src/app/[locale]/(shell)/layout.tsx`, `src/globals.css` | code | §7 UI |
| C6 | `apps/portfolio/e2e/{viewport,print-and-motion,accent,server-rendering,locale-switch,dock}.e2e.ts`; `apps/portfolio/test/**` | test | ràng buộc khi sửa |
| C7 | `apps/portfolio/README.md`, `CONTEXT.md`, `vercel.json`, `.env.example` | docs | hình dạng đã ghi, env |
| P1 | `D:\hồ sơ\software\CV_Huynh_Quoc_Tuan.pdf` (mtime 2026-06-06, mới nhất) | PDF | summary "Software Engineer 3+" |
| P2 | `D:\hồ sơ\software\Resume_Huynh_Quoc_Tuan.pdf` (2026-06-02) | PDF | summary "Software Engineer 2+", mục Personal Project |
| P3 | 6 PDF còn lại (`Resume_*.pdf`, `FE/*.pdf`, `bịp/**/*.pdf`) | PDF | **không đọc lại** — R1 §2/§4.1 đã trích từng trang; note này dẫn qua R1 |
| M1 | `E:\MedViet\frontend\medviet\{README.md,package.json}`, `apps/health-exam/{CONTEXT.md,package.json,src/constants/routes.ts}`, `git log` | source MedViet | §5 |
| M2 | `E:\MedViet\backend\health-exam-server\README.md`, `git log` | source MedViet | §5 (ai viết backend) |
| A1 | `apps/chat/{README.md,CONTEXT.md,package.json,vercel.json,index.html}` | code | §6 |
| A2 | `apps/documents/{README.md,package.json,vercel.json,index.html}` | code | §6 |
| G1 | `gh api repos/qtuan02/{monorepo,chat-socket-fe,chat-socket-be}`, `gh repo list qtuan02`, `gh issue view 195/204/128/138/143/232/240 --comments` | GitHub | homepage, archived, URL deploy |
| U1 | `curl -sI` các URL: `portfolio-ui-2025.vercel.app` (404), `portfolio-tuanhq.vercel.app` (200), `chat-socket-fe.vercel.app` (200, build Rsbuild), `documents-ui.vercel.app` (200, build Prism), `storybook-monorepo-ui.vercel.app` (200), 5 URL GitHub (200) | live | §6 |

**Giới hạn khi đọc PDF:** máy không có `pdftoppm` nên tool Read không render được trang; `pdftotext` (`-layout` lẫn `-raw`) chỉ lấy được **heading, summary, skills, education** — toàn bộ **bullet và mốc tháng bị rớt** (font nhúng không map được). Vì thế mốc thời gian và bullet từng công ty trong note này dẫn từ R1 §4.1/§5 (R1 đã đọc trọn từng trang bằng Read khi máy còn render được). Hai chuỗi summary ở P1/P2 là trích trực tiếp hôm nay.

---

## §3. Hiện trạng dữ liệu portfolio (FACT)

Cấu trúc: **structure** ở `resume.ts` (id, thứ tự, logo, `techStack`, `bulletKeys`), **mọi chuỗi người đọc thấy** ở `packages/i18n` dưới `portfolio.*`, nối bằng `id` (`types/resume.ts:5-13`). `period` là chuỗi dịch tay ở hai locale (quyết định #20, R2 `:285`).

### 3.1 Meta / Hero / About

| Field | Giá trị hiện tại (vi) | Nguồn | Nhận xét |
|---|---|---|---|
| `meta.title` | "Huỳnh Quốc Tuấn" | `vi.json:110` | đủ |
| `meta.description` | "Frontend Developer **2+ năm** kinh nghiệm với React.js và Next.js, đã ship app Expo/React Native và backend .NET, quen monorepo, CI và design system chung." | `vi.json:111`, `en.json:111` | **"Frontend Developer"** + **"2+"** — cả hai lệch TARGET (Software Engineer, 3+) |
| `hero.name` | "Huỳnh Quốc Tuấn" / "Huynh Quoc Tuan" | `vi.json:119`, `en.json:119` | đủ |
| `hero.positioning` | "Frontend-led full-stack engineer — web, mobile và backend khi dự án cần." | `vi.json:120` | quyết định #7 (R2 `:272`); E2E `server-rendering.e2e.ts:35-37` assert nguyên văn chuỗi này |
| `hero.current` | "Hiện mình làm sản phẩm EMR/HIS tại MedViet — web và app cho bệnh viện." | `vi.json:121` | E2E `locale-switch.e2e.ts:25,41` assert nguyên văn (vi+en) |
| `hero.actions` | Email · GitHub · LinkedIn · In CV | `vi.json:122-127`; `resume.ts:240-244` | đủ; email dùng nền vàng highlight (`hero-section.tsx:184-185`) |
| `hero.commands` | `whoami` / `cat role.txt` / `current --job` | `vi.json:114-118` | code giữ tiếng Anh cả hai locale (ADR-0008) |
| `about.experience` | "Frontend Developer với **2+ năm** kinh nghiệm … SSR, ISR cùng quản lý state…" (1 đoạn ~90 từ) | `vi.json:132`, `en.json:132` | **"Frontend Developer"** + **"2+"**; là bản viết lại của summary S2/S3 (R1 `:82`) |
| `about.mindset` | "Làm việc nhóm và giao tiếp tốt. Học nhanh… Có thể làm cả frontend lẫn backend…" | `vi.json:133` | = mục ADDITIONAL của mọi CV (P1 tr.2) |
| Avatar | `src/assets/avatar.jpg` | `hero-section.tsx:12,140` | đủ |

**Không có** trong hero/about: số năm dạng số liệu riêng (stats strip bị bỏ có chủ đích — R2 `:58`, R3 `:87`), ngoại ngữ, chứng chỉ (không có nguồn nào — R1 `:72-73`).

### 3.2 Work (3 row, mới nhất trước — pin ở `resume.test.ts:53-57`)

| Row | Company / role / period | Tech stack (`resume.ts`) | Bullet keys | Nguồn | Nhận xét |
|---|---|---|---|---|---|
| `medviet` | **MedViet** — "Kỹ sư phần mềm" / "Software Engineer" — "03/2026 – Hiện tại" / "Mar 2026 – Present" | 13 tên: Bun, Turborepo, React 19, Vite, Expo, React Native, NativeWind, TanStack Query, Zustand, Next.js, Redux, .NET 8, EF Core (`:44-58`) | `monorepo`, `mobile`, `legacy`, `dotnet` (`:59`) | `vi.json:140-148`, `en.json:140-148` | **Role đã là Software Engineer.** Bullet `monorepo` (`vi.json:144`) đã chứa "xây module **Khám sức khoẻ** trên nền đó: đăng nhập người bệnh qua IAM kèm captcha, phiếu khám sinh từ form-server, lưu và ký theo từng nhóm chỉ tiêu" — nhưng là **nửa sau của một bullet về monorepo**, không có bullet riêng, không nói tới đăng ký hồ sơ / nhập Excel / trả kết quả / ký số (§5). Không có company blurb (một dòng "MedViet là gì"). |
| `arobid` | **AROBID** — "Lập trình viên Frontend" / "Frontend Developer" — "03/2025 – 02/2026"; badge `vda2025` | 10 tên (`:65-76`) | `tradexpo`, `immersive`, `tracking`, `mobile`, `award`, `cms`, `rendering` (7) | `vi.json:150-168` | Đầy nhất. Badge VDA 2025 có tooltip tên giải đầy đủ. Không link ra `arobid.com` (quyết định #10, R2 `:275`). |
| `dcorp` | **DCORP R-KEEPER** — "Lập trình viên Frontend" — "03/2024 – 02/2025" | 11 tên (`:92-104`) | `omnichannel`, `dataset`, `emenu`, `internal`, `uiSystem` (5) | `vi.json:169-179` | Đủ theo quyết định #12 (R2 `:277`). "Highlands Coffee" được E2E `server-rendering.e2e.ts:53` assert. |

Không có field nào cho: địa điểm công ty, loại hình (product/outsourcing), quy mô team, link công ty. `WorkItem` (`types/resume.ts:14-33`) chỉ có `id, company, logo, techStack, bulletKeys, award?`.

### 3.3 Projects (3 row trong **một** `StandardBlock`, `projects-section.tsx:37-60`)

| Row | Tên | Tech (cap 6, `resume.test.ts:73-74`) | Link | Mô tả (vi) | Nguồn | Trạng thái link (curl 2026-09-22) |
|---|---|---|---|---|---|---|
| `monorepo` | Personal Monorepo | Bun, Turborepo, Next.js, React Router, Vite, GitHub Actions | source `https://github.com/qtuan02/monorepo`; demo `https://portfolio-ui-2025.vercel.app` | "Workspace Bun + Turborepo với ba Runtime app… Chính là site portfolio đang xem." | `resume.ts:117-130`, `vi.json:192-194` | source **200**; demo **404** (chết) — portfolio thật ở `https://portfolio-tuanhq.vercel.app` (**200**) |
| `chat-socket` | Real-time Chat | React, Rsbuild, TanStack Query, Spring Boot, WebSocket, Redis | FE `https://github.com/qtuan02/chat-socket-fe`; BE `https://github.com/qtuan02/chat-socket-be`; demo `https://chat-socket-fe.vercel.app` | "Ứng dụng chat thời gian thực full-stack: React 19 + Rsbuild ở client, Spring Boot ở server, nhắn tin qua STOMP trên WebSocket." | `resume.ts:131-147`, `vi.json:195-197` | FE repo **200 nhưng archived**; BE **200**; demo **200 nhưng là build Rsbuild cũ** — card đang mô tả **phiên bản cũ**, không phải `apps/chat` |
| `documents` | @fe-monorepo Docs | Vite, React Router, oxc-parser, Storybook, Vercel | source `https://github.com/qtuan02/monorepo/tree/main/apps/documents`; **không `demo`** | "Site tài liệu cho hai gói npm @fe-monorepo/ui và @fe-monorepo/hook: nội dung sinh tự động từ mã nguồn bằng oxc-parser, mỗi primitive có link sang Storybook." | `resume.ts:148-158`, `vi.json:198-200` | source **200**; demo **có sẵn nhưng chưa gắn**: `https://documents-ui.vercel.app` **200** |

Ghi chú section: `projects.title` = "Dự án học và demo", `projects.note` = "Làm để học và thử công nghệ, mỗi cái có repo công khai và demo sống — không phải sản phẩm production." (`vi.json:183-184`) — câu note này **đang sai** với card `documents` (không có demo) và với `monorepo` (demo 404). Comment ở `resume.ts:109-115` cũng nói "each has a public repository and a live deployment".

### 3.4 Skills (5 nhóm, `resume.ts:194-233`)

| Nhóm | Tên | Nguồn |
|---|---|---|
| frontend | React, Next.js, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand, React Hook Form + Zod, Storybook, i18n (10) | `:195-209` |
| mobile | React Native, Expo, NativeWind, Reanimated (4) | `:210-213` |
| backend | Spring Boot, .NET 8, PayloadCMS, PostgreSQL, MongoDB, Redis (6) | `:214-224` |
| devops | Docker, GitHub Actions, Vercel, Turborepo, Changesets (5) | `:225-228` |
| tooling | Bun, Biome, Vitest, Playwright, Figma (5) | `:229-232` |

Nhãn nhóm dịch ở `vi.json:212-221`. **Thiếu so với CV:** Java, JavaScript như ngôn ngữ (P2 tr.2 "Programming Languages: JavaScript, TypeScript, Java"), Node.js, Ant Design, Redux (có ở techStack MedViet nhưng không ở Skills), Microservices (P1 tr.2 "Other: SSR, ISR, Monorepo, Microservices"). Quyết định #15 (R2 `:280`) đã cố ý bỏ Angular, Go.

### 3.5 Education / Contact / Hobbies / Navbar

| Section | Field | Giá trị | Nguồn | Nhận xét |
|---|---|---|---|---|
| Education | `stu` | Saigon Technology University → `https://stu.edu.vn`; "Kỹ sư Công nghệ thông tin" / "Bachelor of Engineering in Information Technology"; "2020 – 2024" | `resume.ts:175-182`, `vi.json:203-211` | Đủ; không GPA, không chuyên ngành hẹp (CV cũng không có) |
| Contact | birthday, phone, location, github, email, linkedin | "20/07/2002"; "(+84) 393 653 862"; "Quận 7, TP. Hồ Chí Minh, Việt Nam"; "github.com/qtuan02"; "huynhquoctuan200702@gmail.com"; "linkedin.com/in/tuan-huynh-916b792b7" | `resume.ts:246-253`, `vi.json:222-240`, `profile.ts:10-15` | Đủ theo CV (R1 §3). Giá trị LinkedIn **36 ký tự** — nguồn wrap (§7.2) |
| Hobbies | sport, reading, travel, music, movies | `vi.json:241-250` | `resume.ts:255-261` | Đủ; CV chỉ ghi "Researching new technologies, Design Systems, Sports, Reading" (R1 `:74`) |
| Navbar/dock | home, linkedin, github, theme | `vi.json:251-256` | `features/layout/constants/navbar.ts` | không anchor nav (quyết định #22) |

---

## §4. Timeline "3+ năm" — các phương án (TARGET, chủ repo chọn)

### 4.1 Dữ liệu hiện tại vs. cái "3+" cần

| | Portfolio hiện tại (FACT) | Để in "3+ năm" cần | Nguồn |
|---|---|---|---|
| Chuỗi công ty | Dcorp 03/2024–02/2025 → Arobid 03/2025–02/2026 → MedViet 03/2026–nay | tổng **≥ 36 tháng** có mặt, hoặc span lịch ≥ 36 tháng nếu chấp nhận gap | `vi.json:142,152,171` |
| Tổng tháng (tính cả tháng đầu/cuối, đến 09/2026) | 12 + 12 + 7 = **31** ≈ 2 năm 7 tháng | thêm ≥ 5 tháng | R1 `:127` (phương án A) |
| Số in ra | "2+ năm" ở `meta.description`, `about.experience` (2 locale) | "3+ năm" / "3+ years" | `vi.json:111,132`; `en.json:111,132` |
| Danh xưng | "Frontend Developer …" ở hai chuỗi trên; role MedViet đã là "Software Engineer" | "Software Engineer …" cho cả meta + about | `vi.json:111,132,141` |
| Bản CV giấy mới nhất | P1 (2026-06-06) tự xưng **"Software Engineer with 3+ years"** với chuỗi Dcorp **Jun 2023**–Feb 2025 (R1 `:97`, S4) | — | P1 tr.1; R1 `:97` |
| Quyết định trước | Grill 2026-09-06: **A**, "2+", không Wisdom, bỏ FPT IS | đảo quyết định #2/#4 | R2 `:267-269` |

### 4.2 Bảng phương án (từ R1 §4.3, tính lại đến **09/2026**)

| Phương án | Chuỗi | Tháng | Đạt 3+? | Phải đổi gì trong repo | Cái giá |
|---|---|---|---|---|---|
| **A0 — giữ nguyên, chỉ đổi chữ** | như hiện tại (31 tháng) nhưng in "3+" | 31 | **Không tự đứng được** — người đọc cộng mốc trên trang sẽ ra 2 năm 7 tháng | 4 chuỗi i18n | mâu thuẫn nhìn thấy ngay trên cùng một trang |
| **B — thêm Wisdom Robotics** (chuỗi S2) | Wisdom 03–09/2023 (7) → Dcorp 03/2024–02/2025 (12) → Arobid (12–13) → MedViet (7) | 38–39 ≈ 3 năm 2–3 tháng | **Đạt**; gap 10/2023–02/2024 lộ trên timeline | thêm row `wisdom` (logo `wisdom.jpg` còn trong git `eb12b35` — R1 `:361`), 1 role + 3 bullet × 2 locale, sửa `resume.test.ts:53-57` (pin 3 id), `accent.e2e.ts:232` (đếm 3 row), `print-and-motion.e2e.ts:78` (10 block → 11) | quyết định #2 đã xoá Wisdom; stack BE của Wisdom mâu thuẫn giữa các CV (Spring Boot vs Express — R1 `:243`) |
| **C — kéo Dcorp về 06/2023** (chuỗi S3/S4 = P1) | Dcorp 06/2023–02/2025 (21) → Arobid (12–13) → MedViet (7) | 40–41 ≈ 3 năm 4–5 tháng, không gap | **Đạt**, không thêm row | đổi 1 chuỗi `period` × 2 locale (`vi.json:171`, `en.json:171`) + 4 chuỗi "2+"→"3+" | khớp với CV giấy mới nhất P1/S3/S4, **nhưng** mâu thuẫn S1/S2/S5/S6 và brief cũ "Dcorp 1 năm +" (R1 `:112`) |
| **D — Dcorp part-time từ 2022** (chuỗi S8 "bùa" mạnh nhất) | Dcorp part-time 06/2022–03/2024 + full-time … | ~50 | Đạt "4+" | như C + thêm nhãn part-time (schema chưa có) | bản S8 là bản duy nhất ghi vậy; xa nhất với các nguồn khác |
| **E — MedViet từ sớm hơn** | (không có nguồn) | — | — | — | git `E:\MedViet` chỉ có commit `@tuanhq` từ **2026-05-28** (`git log --reverse`), muộn hơn cả mốc 03/2026 đang in; không có gì để kéo sớm hơn |

**Nhận xét (không phải quyết định):** C là phương án **rẻ nhất** (2 chuỗi + 4 chuỗi, không đụng test/E2E, không cần logo) và trùng CV giấy mới nhất; B là phương án **kể được** nhất nhưng đắt (row mới, test, logo, 6 chuỗi) và có gap. A0 không nên — trang tự tố cáo. Mọi mốc là TARGET; agent không chọn.

### 4.3 Chuỗi bị ảnh hưởng khi đổi (để `/to-tickets` cắt việc)

| Key | Hiện tại | Đổi thành (đề xuất, chờ chốt) |
|---|---|---|
| `portfolio.meta.description` (vi/en) | "Frontend Developer 2+ năm…" | "Software Engineer 3+ năm kinh nghiệm…" |
| `portfolio.about.experience` (vi/en) | "Frontend Developer với 2+ năm…" | "Software Engineer với 3+ năm… frontend là gốc…" |
| `portfolio.work.items.dcorp.period` (vi/en) | "03/2024 – 02/2025" | tuỳ phương án |
| `portfolio.hero.current` | giữ | (E2E `locale-switch.e2e.ts:25,41` assert nguyên văn — đổi thì sửa test) |
| `portfolio.hero.positioning` | giữ | (E2E `server-rendering.e2e.ts:35-37` assert nguyên văn) |

---

## §5. MedViet — tư liệu phần khám sức khoẻ (FACT + đề xuất)

### 5.1 Cái đang in

- Bullet `monorepo` (`vi.json:144`): *"Dựng monorepo frontend dùng chung (Bun + Turborepo, React 19 + Vite, Vitest và Playwright trong CI) và xây module Khám sức khoẻ trên nền đó: đăng nhập người bệnh qua IAM kèm captcha, phiếu khám sinh từ form-server, lưu và ký theo từng nhóm chỉ tiêu."* — bản en tương ứng `en.json:144`.
- Ba bullet còn lại: `mobile` (app EMR Expo/RN — E2E assert `"app EMR mobile bằng Expo/React Native"`, `server-rendering.e2e.ts:41`), `legacy` (web EMR Next 14 + Redux), `dotnet` (.NET 8 handler phía HIS server) — `vi.json:145-147`.
- Quyết định #6 (R2 `:271`): tên in công khai là "EMR/HIS", "hệ thống khám sức khoẻ" — **không** tên bệnh viện/tỉnh, không mã màn hình. Note này giữ nguyên ràng buộc đó.

→ "Thiếu phần khám sức khoẻ" đúng theo nghĩa: **không có bullet riêng**, và những gì có chỉ phản ánh trạng thái app ở 06/09/2026 (khi R1 viết, `health-exam` mới là cổng người bệnh). Từ đó tới nay app đã lớn gấp nhiều lần (bảng dưới).

### 5.2 FACT từ source `E:\MedViet` (đọc ngày 2026-09-22)

| Mục | Giá trị | Nguồn |
|---|---|---|
| App | `@medviet/health-exam` — Runtime Vite SPA trong monorepo `E:\MedViet\frontend\medviet` (Bun workspaces + Turborepo, namespace `@medviet/*`, apps `_template_vite`, `health-exam`, `manage-form`, `storybook`) | `apps/health-exam/package.json:2`; `README.md` gốc `:1-3`; `ls apps` |
| Định nghĩa nghiệp vụ | "phân hệ Khám sức khỏe (KSK) trên EMR: số hóa quy trình **đăng ký → khai tiền sử → khám lâm sàng → cận lâm sàng → kết luận → ký số**. Nguồn nghiệp vụ: BRD-KSK-V1 + FRD-KSK-V1 (UC01→UC05)" | `apps/health-exam/CONTEXT.md:1-3` |
| Ba chuyên trang | **Đăng ký KSK** (MH3, nhân viên tiếp nhận) · **Trả kết quả KSK** (MH5, bác sĩ) · **Web người bệnh** (MH4, người bệnh tự phục vụ, mobile-first) + Trang chủ KSK + Đăng nhập nhân viên | `CONTEXT.md` mục "Chuyên trang"; `src/constants/routes.ts` (`HOME`, `SIGN_IN`, `REGISTRATION`, `CONFIRMATION`, `RESULTS`) |
| Slice | `auth`, `confirmation`, `dashboard`, `layout`, `registration`, `results` | `ls src/features` |
| Nghiệp vụ đáng kể (từ glossary) | Hồ sơ người bệnh nhiều phiên bản, tìm theo CCCD/Mã NB/SĐT/tên; máy trạng thái Hồ sơ KSK (`Chưa đăng ký → Chờ khám → Đang khám → Đã khám` + 2 trạng thái hủy); **Biểu mẫu động** từ HIS (Mẫu phiếu KSK, Nhóm chỉ tiêu, Danh mục khám render theo `ItemGroupID`); Chỉ định CLS (Xét nghiệm · CĐHA · TDCN · Khám CK) với popup bản nháp, gói dịch vụ mẫu, KQ scan; Kết luận + Điều kiện ký; **Ký số** nhân viên / **Chữ ký điện tử** người bệnh (vẽ tay hoặc gõ tên); **Nhập hồ sơ từ Excel** (18 cột, kiểm từng dòng); Phiên người bệnh không mật khẩu (Mã NB + CCCD/BHYT + captcha); Bảng điều khiển demo `?demo=1`; deploy **sub-path** `/health-exam/` cùng origin với EMR | `CONTEXT.md` các mục cùng tên |
| Stack | React 19, Vite, react-router, TanStack Query + Table + **Virtual**, Zustand, RHF + Zod, react-i18next, **nuqs** (URL state), **signature_pad**, `@marsidev/react-turnstile` (Cloudflare Turnstile captcha), **xlsx** (SheetJS), Vitest + Playwright + Biome; runner nginx | `apps/health-exam/package.json` dependencies/devDependencies |
| Quy mô | **299 commit** đụng `apps/health-exam` (+ tên cũ `health-checkup`), **282 của `@tuanhq`** (+2 "Tuan Huynh"), 20/08/2026 → 22/09/2026; 323 file `.ts/.tsx` dưới `src/`; 163 file dưới `test/` + `e2e/`; **40 ADR** trong `docs/adr` của monorepo MedViet, 33 cái mang tiền tố `health-exam-` | `git log --format=%an -- apps/health-exam apps/health-checkup \| sort \| uniq -c`; `find`; `ls docs/adr` |
| Đổi tên | `health-checkup` → `health-exam` ngày 04/09/2026 (ADR-0023 của MedViet) | `CONTEXT.md:3`; `git log` 2026-09-04 |
| Backend KSK | `health-exam-server` — .NET 8, EF Core 8, Npgsql, Clean Architecture, 826 test; **tác giả: haringuyendev 215, Nguyen Minh Phuong 45, Claude AI 29 — không có `@tuanhq`** | `E:\MedViet\backend\health-exam-server\README.md:1-20`; `git log --format=%an \| sort \| uniq -c` |
| Mốc git đầu của `@tuanhq` ở MedViet | 2026-05-28 "init: medviet monorepo" | `git log --reverse` (repo `frontend/medviet`) — R1 `:225` ghi 05-28 cho monorepo, 05-22 cho `web-emr` |

### 5.3 Đề xuất bullet (đề xuất — chủ repo duyệt/sửa; con số là số đếm từ git/file, không phải KPI)

Nguyên tắc: tách "monorepo" và "khám sức khoẻ" thành **hai** bullet; không nêu tên bệnh viện, tỉnh, mã màn hình (giữ #6); chỉ nói phía frontend vì backend KSK không phải của chủ repo.

- **`monorepo`** (rút lại): *"Dựng monorepo frontend dùng chung của MedViet (Bun + Turborepo, React 19 + Vite, `@medviet/*` packages, Vitest + Playwright trong CI, quy ước cho AI agent) — khuôn mà các app sau clone từ đó."*
- **`healthExam`** (mới): *"Xây phân hệ Khám sức khoẻ trên EMR — ba chuyên trang Đăng ký (nhân viên), Trả kết quả (bác sĩ) và Web người bệnh (tự phục vụ, không mật khẩu, captcha): hồ sơ người bệnh nhiều phiên bản, biểu mẫu động render từ cấu hình HIS, chỉ định cận lâm sàng, kết luận và ký số / chữ ký điện tử, nhập hồ sơ hàng loạt từ Excel; deploy sub-path cùng origin với EMR."*
  - Bản en: *"Built the periodic health-examination module on the EMR — three screens for registration (staff), results (doctors) and a passwordless patient portal (captcha): versioned patient profiles, dynamic exam forms rendered from HIS configuration, lab/imaging orders, conclusions with digital and e-signatures, bulk registration from Excel; deployed on a sub-path beside the EMR."*
- Giữ `mobile`, `legacy`, `dotnet` như hiện tại (bullet `dotnet` nói về `his-server`, đúng nguồn R1 `:228`).
- `techStack` MedViet (đã 13 tên, dài nhất trang): cân nhắc thêm **nuqs / TanStack Table** hoặc bỏ bớt để không quá 12 — không có test cap cho Work (chỉ Projects cap 6, `resume.test.ts:73-74`), nhưng dòng tech stack là chỗ wrap nhiều dòng nhất trong row (§7.3).
- Nếu muốn một **company blurb** ("MedViet — sản phẩm EMR/HIS cho bệnh viện; team frontend nhỏ") thì `WorkItem` chưa có field; cần thêm key `portfolio.work.items.<id>.summary` + render trong `ResumeCard` `subtitle` hoặc một dòng mới — việc của bước design.

---

## §6. Projects: `chat` & `documents` (FACT + đề xuất)

### 6.1 Cái đang in vs. cái brief muốn

| | Hiện tại | Brief |
|---|---|---|
| Số card | **3** (`monorepo`, `chat-socket`, `documents`) — `resume.ts:116-159` | **2**: chat, documents |
| Card `monorepo` | source 200, demo **404** | bỏ (theo brief "2 cái thôi"); nếu bỏ thì `projects-section.test.tsx:31` / `resume.test.ts` dùng `PROJECT_ITEMS.length` nên tự theo, nhưng **`viewport.e2e.ts:604`** bám text `"Real-time Chat"` và `server-rendering.e2e.ts:212-213` assert `"Personal Monorepo"` + `href="https://github.com/qtuan02/monorepo"` — phải sửa |
| Card `chat-socket` | mô tả **bản cũ** (Rsbuild, repo archived, demo là build cũ) | mô tả `apps/chat` (Islands), link dẫn |
| Card `documents` | không `demo` | "tất cả đều có link dẫn" → gắn `https://documents-ui.vercel.app` |
| Mô tả | 1 câu / card, không bullet (quyết định #125 — `resume.ts:109-115`) | "mô tả thêm về project" → cần quyết: câu dài hơn, hay thêm `bulletKeys` cho `ProjectItem` (schema hiện **không** có bullet, `types/resume.ts:56-66`) |
| Câu note section | "mỗi cái có repo công khai và demo sống" (`vi.json:184`) | phải đúng với 2 card mới |

### 6.2 `apps/chat` — FACT

| Mục | Giá trị | Nguồn |
|---|---|---|
| Là gì | "App nhắn tin real-time kiểu Messenger, port 1:1 từ `chat-socket-fe` (Rsbuild + shadcn trên Radix + `@stomp/stompjs`) vào monorepo. Nối backend `chat-socket` (Spring Boot, REST + STOMP trên cùng port)." Spec #195 (pha 1), spec #232 đưa sang hình dạng **Islands** | `apps/chat/README.md:1-8` |
| Runtime | Vite client SPA (clone `_template_vite`), mọi màn sau đăng nhập, nginx serve bundle tĩnh; dev 3007 / E2E 3107 | `README.md:34-38`; `ports.env` |
| Tính năng (pha 1 → Islands) | Health gate, sign-in/sign-up, guard async qua `/auth/refresh`, sign-out; Conversation + lịch sử; gửi tin + emoji; socket STOMP + Presence; Friends + Draft conversation; Group + Profile; sau đó: read receipt, "N new messages", Reconnecting, Friends Tabs + Details, Auth Island, `.dark`; T2 attachment upload (IMAGE/FILE), T3 sửa/xoá tin, T4 typing indicator + throttle, T5 đổi mật khẩu; rename group qua dialog | `README.md:10-31`; `git log` 2 tuần gần nhất (`9d1627d`, `f9934b7`, `5815584`, `cef5126`, `1616a61`, `c7eb1a6`) |
| Kiến trúc đáng kể | Session = access token in-memory + refresh cookie HttpOnly; **refresh-and-retry là option opt-in của `createHttpClient`** (`withCredentials`, `onAuthError` 401/403) — **ADR-0014**; socket layer `~/libs/socket.ts` + `use-socket-store`; `react-virtuoso` cho danh sách tin; per-Island error boundary (`react-error-boundary`) | `docs/adr/0014-*.md`; memory `chat-app-migrate-spec:13`; `package.json` deps |
| Hình dạng | **Islands** (ADR-0016): mọi vùng là một Island `bg-card/75` bo 22px trên gradient tĩnh 3 màu, không `backdrop-filter`; teal = hành động, mực = vị trí; dưới `md` một Island + Bottom nav | `docs/adr/0016-*.md` "Quyết định" 1–5 |
| Stack (deps) | React 19, react-router 8, TanStack Query 5, Zustand, RHF + Zod, `@stomp/stompjs`, `react-virtuoso`, i18next/react-i18next, `@monorepo/{api,ui,hook,i18n,env,dayjs,types}` | `apps/chat/package.json` dependencies |
| Env prod cần | `PUBLIC_CHAT_API_BASE_URL`, `PUBLIC_CHAT_SOCKET_URL` (bắt buộc); backend phải đặt `chat-socket.client-url` = origin app ("domain Vercel lúc prod"), cookie refresh `SameSite=None; Secure` → HTTPS | `.env.example:23-25`; `README.md:104-108` |
| Deploy | `vercel.json` (install/build từ root qua `npx --yes bun@1.4.0`, SPA rewrite) + `Dockerfile`/`nginx.conf` | `apps/chat/vercel.json`; `README.md:56` |
| **URL live của `apps/chat`** | **chưa có trong repo, `.env.example`, issue #195/#204/#232/#240, hay memory** (memory `chat-app-migrate-spec:51` chỉ ghi "chủ repo xác nhận deploy Vercel + kiểm tay", không URL). `https://chat-socket-fe.vercel.app` (homepage của repo cũ, `gh api`) **đang serve build Rsbuild cũ** (`/static/js/lib-react.*.js`, `<title>Chat</title>` — trùng `apps/chat/index.html:7` nên không phân biệt được bằng title, chỉ bằng asset path) | `gh api repos/qtuan02/chat-socket-fe` → `homepage`, `archived: true`; `curl` |
| **URL backend live** | không có trong `chat-socket-be` README (`gh api …/readme` không có URL Render/Railway/Fly) — demo chỉ chạy nếu backend public đang bật | `gh api` |
| Source URL | `https://github.com/qtuan02/monorepo/tree/main/apps/chat` **200** (đã push? `pushed_at` 2026-09-21; nhánh `dev` chưa push theo memory — `tree/dev/apps/chat` cũng 200) ; BE `https://github.com/qtuan02/chat-socket-be` 200 | `curl`; `gh api` |

### 6.3 `apps/documents` — FACT

| Mục | Giá trị | Nguồn |
|---|---|---|
| Là gì | "Site tài liệu cho hai gói **được publish lên npm** từ workspace này: `@fe-monorepo/ui` (63 primitive Base UI) và `@fe-monorepo/hook` (5 React hook). Đối tượng đọc là consumer cài từ npm" | `apps/documents/README.md:1-8` |
| Runtime | Vite client SPA, không SSR, không gọi HTTP; dev 3003 / E2E 3103; hình dạng **Prism** (spec #128, ADR-0009): không sidebar, nav pill kính + `⌘K` command palette, panel kính trên backdrop aurora, palette indigo riêng, Outfit + JetBrains Mono qua `@fontsource-variable` | `README.md:10-16`; `docs/adr/0009-*.md` đoạn quyết định |
| Tính năng | Metadata sinh từ source bằng `scripts/generate-docs-metadata.ts` (thay JSON viết tay); mỗi trang primitive **nhúng story `Default` từ Storybook đã deploy** (iframe theo theme) + link sang docs Storybook; nút trước/sau theo catalogue; swatch gradient sinh từ slug; responsive (spec #215) | `README.md:20-30`; ADR-0009 |
| Stack (deps) | React 19, react-router 8, react-i18next, `@monorepo/{ui,hook,i18n,env,dayjs}`, `@fontsource-variable/{outfit,jetbrains-mono}`, `react-error-boundary` | `apps/documents/package.json` dependencies |
| Env | `PUBLIC_DOCUMENTS_STORYBOOK_URL` = `https://storybook-monorepo-ui.vercel.app` (Storybook đã deploy, **200**) | `.env.example:20`; `README.md:101` |
| Deploy | `vercel.json` (SPA rewrite, build từ root) | `apps/documents/vercel.json`; `README.md:233-238` |
| **URL live** | **`https://documents-ui.vercel.app`** — 200, `<html lang="vi">`, `<title>Tài liệu @fe-monorepo</title>` (= `apps/documents/index.html:7`), asset `rolldown-runtime-*.js` (Vite 8) → **đúng build hiện tại**. URL này chỉ xuất hiện trong R1 `:301` ("chưa kiểm tra") và portfolio cũ (`eb12b35`), **không** ở đâu trong `apps/` hay README hiện tại | `curl`; R1 `:301` |
| Source URL | `https://github.com/qtuan02/monorepo/tree/main/apps/documents` 200 (đang dùng, `resume.ts:155`) | `curl` |
| Bổ trợ | Storybook `https://storybook-monorepo-ui.vercel.app` (200) — có thể là link thứ ba của card | `.env.example:20` |

### 6.4 Đề xuất card (đề xuất — copy DRAFT, chủ repo duyệt)

Schema `ProjectItem` hiện cho phép nhiều `source` (`repo`/`frontend`/`backend`) + 1 `demo`. Đề xuất giữ schema, đổi dữ liệu:

- **`chat`** — name "Real-time Chat (Islands)"; techStack ≤ 6: `React 19, Vite, TanStack Query, STOMP/WebSocket, Spring Boot, Redis`; source: `frontend` → `https://github.com/qtuan02/monorepo/tree/main/apps/chat`, `backend` → `https://github.com/qtuan02/chat-socket-be`; demo → **chưa có, chủ repo cần cung cấp**. Mô tả (vi): *"Chat thời gian thực kiểu Messenger, port từ repo Rsbuild cũ vào monorepo rồi redesign thành bố cục 'Islands': hội thoại 1-1 và nhóm, presence, read receipt, typing, đính kèm file, sửa/xoá tin; STOMP trên WebSocket, phiên = access token in-memory + refresh cookie HttpOnly với refresh-and-retry opt-in ở `@monorepo/api`; server Spring Boot + Redis."*
- **`documents`** — name "@fe-monorepo Docs"; techStack: `Vite, React Router, oxc-parser, Storybook, Base UI, Vercel`; source giữ; **demo → `https://documents-ui.vercel.app`**; (tuỳ) thêm `ProjectSourceId` mới `storybook` → `https://storybook-monorepo-ui.vercel.app`. Mô tả (vi): *"Site tài liệu cho hai gói npm @fe-monorepo/ui (63 primitive shadcn trên Base UI) và @fe-monorepo/hook: nội dung sinh tự động từ mã nguồn bằng oxc-parser, mỗi primitive nhúng story sống từ Storybook, tìm bằng ⌘K; hình dạng 'Prism' — panel kính trên backdrop aurora, không sidebar."*
- **Bỏ `monorepo`** như brief; nếu chủ repo vẫn muốn nhắc "site này chính là monorepo" thì đưa vào `projects.note` (một câu) thay vì card — demo của nó phải đổi sang `https://portfolio-tuanhq.vercel.app` (hoặc `NEXT_PUBLIC_PORTFOLIO_BASE_DOMAIN` — nhưng đó là env, không phải data).
- Câu `projects.note` viết lại cho đúng 2 card: *"Hai dự án cá nhân làm để học và thử công nghệ — mã nguồn công khai, có demo — không phải sản phẩm production."* (chỉ đúng khi `chat` có demo).

Nếu muốn "mô tả thêm" dài hơn một câu: thêm `bulletKeys?: readonly string[]` vào `ProjectItem` và render `<ul>` trong `ProjectRow` — nhưng #125 (R2, `resume.ts:109-115`) cố ý bỏ bullet để "ba demo không đọc như ba sản phẩm"; giờ còn hai và brief muốn dày hơn, nên đảo lại là hợp lý — quyết ở grill.

---

## §7. UI — danh sách vấn đề tìm thấy (FACT + hướng xử lý ngắn)

Breakpoint dùng trên trang: `sm` 640 · `md` 768 · `lg` 1024; well `max-w-6xl` (1152px) `px-6` (`(shell)/layout.tsx:30`). Từ `md` là grid 2 cột `3fr/2fr` → `lg` `2fr/1fr` với `gap-x-8/10` (`home.template.tsx:38`). Rail rộng xấp xỉ: 768 → ~264px (R4 `:111`), 1024 → ~312px, ≥1200 → ~370px (well 1152 − 40 gap, chia 3); trừ `p-5` của `StandardBlock` (`standard-block.tsx:71`) còn **~224 / 272 / 330px** cho nội dung. Cột đọc tương ứng ~424 / 624 / 741px.

### 7.1 Sticky — một chỗ, và nó là quyết định có test

| File:line | Phần tử | Class | Load-bearing? |
|---|---|---|---|
| `home.template.tsx:54` | `<aside>` rail (Skills, Education, Contact + Hobbies) | `md:sticky md:top-6 md:self-start` | **Có, theo quyết định**: Q11 vòng responsive (R4 `:189` "Sticky từ `md` — một hành vi Rail"), glossary `CONTEXT.md:53-56` ("dính khi cuộn ở cả hai"), README `:37`; E2E **`viewport.e2e.ts:131-156`** ("splits the tablet into a 3/2 column pair, with a sticky rail, at 768": cuộn xuống rồi `expect(asideAfterScroll.y).toBeGreaterThanOrEqual(0)`). |
| `features/layout/*` dock | `<nav>` | `fixed` (không sticky) | không liên quan — dock là thanh cố định theo Q1 |

**Vấn đề thật đằng sau "sticky không cần thiết":** rail gồm 4 section, ước lượng chiều cao ở `lg`: Skills 5 nhóm × (nhãn + 1–3 dòng) ≈ 300px, Education ≈ 110px, Contact 6 dòng (2 dòng wrap) ≈ 230px, Hobbies 5 dòng ≈ 190px, cộng 3 heading + `space-y-10` (3×40) + 2×`gap-6` → **≈ 1000–1100px**. Trên laptop 1366×768 hoặc 1440×900 rail **cao hơn viewport**: `sticky top-6` ghim đầu rail, phần đuôi (Contact/Hobbies) bị đẩy xuống ngoài màn và **chỉ hiện khi cột đọc cuộn hết** — cảm giác "card dính vô ích, che mất liên hệ". Ở 768×1024 (viewport E2E) rail ~264px rộng còn cao hơn nữa nhưng viewport cao 1024 nên ít lộ. Con số trên là ước lượng bằng tay; **đo bằng Playwright `aside.boundingBox().height` ở 1366×768 và 1440×900** trước khi quyết.

Hướng xử lý (đề xuất, chọn một):
- **(a) Bỏ sticky** — xoá 3 class, sửa test `viewport.e2e.ts:131-156` (đổi tên test, bỏ assert sau cuộn), sửa glossary `Rail` + README. Rẻ nhất, đúng brief "không sticky các card không cần thiết".
- **(b) Sticky chỉ khi rail thấp hơn viewport** — CSS thuần không làm được theo chiều cao; cần `lg:sticky` + `max-h-[calc(100dvh-3rem)] overflow-y-auto` (rail tự cuộn — xấu với hard shadow) hoặc JS đo chiều cao (client island — trái tinh thần "không client island thừa", `home.template.tsx:17-19`). Không khuyến nghị.
- **(c) Chuyển Contact + Hobbies ra khỏi rail** (xuống cuối cột đọc hoặc thành hàng ngang full-width dưới hero) để rail chỉ còn Skills + Education (~450px) → sticky lại có nghĩa. Đụng thứ tự section (`home.template.test.tsx` pin thứ tự 8 section) và `viewport.e2e.ts:158-200` (Contact/Hobbies ở rail).

### 7.2 Xuống dòng — theo phần tử

| # | File:line | Phần tử | Class liên quan | Ở đâu nó wrap (ước lượng theo bề rộng §7 đầu) | Hướng xử lý ngắn (đề xuất) |
|---|---|---|---|---|---|
| W1 | `contact-section.tsx:37-44` | mỗi dòng Contact: icon 16px + nhãn `sm:w-24` (96px) + giá trị `text-sm` | `flex flex-wrap items-center gap-x-2 gap-y-0.5` | Giá trị LinkedIn "linkedin.com/in/tuan-huynh-916b792b7" (36 ký tự, `vi.json:238`) ≈ 275px ở 14px sans → cần ~400px; rail chỉ 224–330px → **wrap ở mọi bề rộng desktop** (giá trị rơi xuống dòng dưới nhãn). Email 29 ký tự ≈ 220px → wrap ở 768 và 1024, vừa ở ≥1200. Địa chỉ "Quận 7, TP. Hồ Chí Minh, Việt Nam" tương tự email. R4 `:115` đã ghi nhận "email dài xuống dòng — chấp nhận được" ở vòng trước. | (i) Đổi bố cục dòng: **nhãn trên, giá trị dưới** (2 dòng đều đặn) thay vì nhãn–giá trị cạnh nhau rồi wrap không đều; hoặc (ii) bỏ cột nhãn `w-24`, chỉ icon + giá trị (nhãn thành `sr-only`/`title`) — mỗi dòng còn ~290px ở 1024, LinkedIn vẫn ~275px → vừa; hoặc (iii) rút text hiển thị ("tuan-huynh-916b792b7", "qtuan02") giữ href đầy đủ — nhưng E2E `print-and-motion.e2e.ts:139-159` giả định "contact link text already *is* the URL" và không in `(href)` sau nó → phải xem lại. (iv) Nếu §7.1(c) đưa Contact thành hàng ngang full-width thì W1 tự hết. |
| W2 | `project-row.tsx:61-64` | hàng tên project + cụm link (2–3 link `text-sm` + icon) | `flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1` → cụm link `flex flex-wrap gap-x-4 gap-y-2` | "Real-time Chat" + "Mã nguồn (FE) · Mã nguồn (BE) · Xem demo" ≈ 134 + ~470 = 600px → **wrap ở 768 (424px) và 1024 (584px)**, vừa ở ≥1200. Tên 2 card mới ngắn hơn/ít link hơn thì đỡ, nhưng vẫn wrap ở 768. E2E `viewport.e2e.ts:596-625` đo khoảng cách ≥8px giữa các link **khi chúng wrap** — tức wrap là hành vi đã tính. | Đưa cụm link xuống **dòng riêng dưới mô tả** (cùng hàng với tech stack, hoặc thành hàng cuối) ở mọi breakpoint — hết wrap ngẫu nhiên, tên luôn một mình một dòng. Sửa test `viewport.e2e.ts:596-625` (đổi selector `hasText: "Real-time Chat"` theo tên mới). |
| W3 | `resume-card.tsx:115-161` | header Work row: tên công ty (mono 16px bold) + chevron ‖ badge + period (`whitespace-nowrap`) | `flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-1` | "AROBID" + badge "VDA 2025" + "03/2025 – 02/2026" ≈ 330px → vừa từ 424px; dưới `sm` (291px) cụm phải wrap xuống dưới tên — **cố ý**, comment `:83-86` ("The header wraps rather than shrinks"). "DCORP R-KEEPER" 14 ký tự mono ≈ 135px + period 143px = vừa từ ~320px. | Giữ; không phải lỗi. Nếu chủ repo thấy period xuống dòng trên phone là xấu, cách rẻ: `period` nhỏ hơn dưới `sm` (`text-xs`) — không khuyến nghị vì `viewport.e2e.ts:384-412` khoá meta ≥14px. |
| W4 | `resume-card.tsx:266-271` | dòng "Công nghệ: A, B, C…" (mono 14px, 13 tên ở MedViet) | `<p class="mt-2 font-mono text-sm">` chuỗi `join(", ")` | ~120 ký tự mono ≈ 1000px → **3 dòng ở 424, 2 dòng ở 624–741**. Comment `:262-265` giải thích vì sao là text chứ không chip. | Giảm số tên (≤ 8–10, ưu tiên cái đặc trưng), hoặc ngắt thành 2 nhóm ("Web: …" / "Mobile: …"). Không cần đổi component. |
| W5 | `skills-section.tsx:43-73` | nhóm Skills: nhãn + list `after:content-[',']` | `grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-[7.5rem_1fr] md:grid-cols-1`; list `flex flex-wrap gap-x-2 gap-y-1 font-mono text-sm` | Từ `md` nhãn nằm **trên** list (Q3 R4 `:182`; E2E `viewport.e2e.ts:158-171` khoá); frontend 10 tên ≈ 3 dòng ở 224px, 2 dòng ở 330px. Wrap là bản chất list dài. | Giữ (đây là chỗ wrap "đúng"). Nếu muốn gọn: trả `md:grid-cols-[6rem_1fr]` khi rail ≥ 300px (`lg:`) — cần sửa test 768 giữ nguyên. |
| W6 | `hero-section.tsx:114` | `<h1>` tên (mono 24/36/48px) | `[overflow-wrap:anywhere]` | "Huỳnh Quốc Tuấn" 15 ký tự: 24px mono ≈ 216px (vừa 291px phone); 48px mono ≈ 432px ở `md`, cột tên = well − avatar 144 − gap 32 ≈ 500+ → vừa. `overflow-wrap:anywhere` chỉ cắn khi < ~230px. Bản en "Huynh Quoc Tuan" tương tự. | Giữ; là lưới an toàn cho 320px (Q6). |
| W7 | `hero-section.tsx:150-158` | 2 dòng positioning/current (sans 16–18px) | không giới hạn bề rộng | Ở `md` cột ~500–950px → câu 70–90 ký tự chạy 1–2 dòng; không có `max-w-prose`. | Chấp nhận; hoặc `max-w-[60ch]` — R4 `:107-108` đã bác `max-w-prose` trong khối full-width vì "chữ dừng ở 2/3 rồi để trống". |
| W8 | `about-section.tsx:24-27` | 2 đoạn About ~90 + ~40 từ | `text-body` 15px | Cột đọc 424–741px → 55–95 ký tự/dòng, 5–8 dòng. Đây là chỗ "đầy" nhất và đúng chuẩn measure. | Nếu about dài thêm khi lên 3+ và đổi danh xưng, cân nhắc tách 3 đoạn ngắn (vai trò / stack / cách làm) thay vì 1 đoạn dài. |
| W9 | `globals.css:329-335` (print) | `a[href^="http"]::after { content: " (" attr(href) ")"; word-break: break-all }` | chỉ `@media print` | Bản in: link project in kèm URL dài (GitHub tree URL 60+ ký tự) và cắt giữa từ. E2E `print-and-motion.e2e.ts:116-137` khoá hành vi in URL. | Giữ; là quyết định #16 (print). Nếu đổi source URL của `chat` sang tree URL dài, bản in dài thêm — chấp nhận. |

### 7.3 Polish khác nhìn thấy trong code (không phải wrap/sticky)

| # | File:line | Quan sát | Hướng (đề xuất) |
|---|---|---|---|
| P1 | `projects-section.tsx:37-60` | 3 project chung **một** `StandardBlock`, ngăn bằng `divide-y-2` — Work thì mỗi row **một** block (`work-section.tsx:20-55`). Hai section cạnh nhau, hai nhịp khác nhau. `print-and-motion.e2e.ts:78` đếm đúng **10** block; `accent.e2e.ts:307-327` đếm block theo section. | Nếu còn 2 project và muốn "đẹp, đầy" hơn: mỗi project một block như Work (đếm block 10 → 11), hoặc giữ một block nhưng thêm khoảng thở `py-5`. Quyết ở design. |
| P2 | `resume-card.tsx:158` | `period` là `text-muted-foreground` mono 14px, bên phải; ở dark mode neutral đảo cực nên vẫn đọc được (ADR-0008). | Không đổi. |
| P3 | `resume-card.tsx:170`, `education-section.tsx:15-27` | Education dùng lại `ResumeCard` không body → row có chevron ẩn, `<a>` full header ra ngoài `stu.edu.vn` (`:211-219`). | Ổn. |
| P4 | `apps/portfolio/README.md:37` vs `:41` | README ghi "Projects hai cột từ `sm`, card lẻ cuối trải hết hàng" ở một chỗ và "không còn card… hàng cách nhau bằng đường kẻ 2px" ở chỗ khác — **mâu thuẫn**, chỗ đầu là mô tả trước #125. | Sửa README khi implement (không phải việc của note này). |
| P5 | `resume.ts:109-115`, `vi.json:184` | Comment và `projects.note` hứa "each has … a live deployment" — sai với thực tế (§3.3). | Sửa cùng dữ liệu. |
| P6 | `hero-section.tsx:165` | 4 action: `grid grid-cols-2` dưới `sm`, `flex flex-wrap` từ `sm`; ở `md` 4 nút ~4×110px = 440px + gap → vừa cột ~500px, không wrap. | Không đổi. |
| P7 | `skills-section.tsx:52` | dấu `/` sau nhãn nhóm (`aria-hidden`) — chi tiết terminal; nhãn "DevOps & CI/" đọc hơi lạ. | Tuỳ gu. |

### 7.4 Ràng buộc từ E2E/unit test cho mọi sửa UI/dữ liệu ở trên

| Test | Khoá gì | Đụng khi |
|---|---|---|
| `viewport.e2e.ts:60-111` | 2 cột từ desktop (`#skills` bên phải `#about`, tỉ lệ 1.8–2.2), 1 cột phone; `#projects` có **đúng 1** `StandardBlock` (`:96-97`) | P1 (mỗi project một block) |
| `viewport.e2e.ts:131-156` | 3/2 ở 768 + **rail sticky** | §7.1 |
| `viewport.e2e.ts:158-200` | Skills nhãn trên list ở 768; Hobbies dưới Contact ở 768; Contact/Hobbies cạnh nhau ở 640 | §7.1(c), W5 |
| `viewport.e2e.ts:253-307` | `scrollWidth ≤ width` ở 320/375/414 (vi + en) | mọi thay đổi bề rộng |
| `viewport.e2e.ts:311-412` | body ≥15px, meta ≥14px trên phone | W3 |
| `viewport.e2e.ts:538-572` | body MedViet row dưới logo trên phone, cạnh logo từ `sm` | đổi `ResumeCard` grid |
| `viewport.e2e.ts:575-625` | link project ≥24px; **`hasText: "Real-time Chat"`** với 3 link, cách ≥8px khi wrap | đổi tên/số link card chat (§6.4), W2 |
| `print-and-motion.e2e.ts:76-78` | **10** `StandardBlock` | P1, thêm/bớt section, thêm row Wisdom (§4.2 B) |
| `accent.e2e.ts:232` | **3** work row | B |
| `accent.e2e.ts:280` | badge text "VDA 2025" | đổi label badge |
| `server-rendering.e2e.ts:30-57, 85-88, 211-213` | chuỗi nguyên văn: positioning (vi), "app EMR mobile bằng Expo/React Native", "Công cụ", "Biome", "Highlands Coffee", "VDA 2025", "EMR mobile app with Expo/React Native", "Dự án học và demo", "Personal Monorepo", `href="https://github.com/qtuan02/monorepo"` | đổi bullet `mobile`, bỏ card `monorepo`, đổi tiêu đề Projects |
| `locale-switch.e2e.ts:25,41` | `hero.current` nguyên văn vi/en | đổi câu hero |
| `test/.../resume.test.ts:53-57, 73-74, 79-87` | id Work = `[medviet, arobid, dcorp]`; project techStack ≤ 6; mọi href project `https://` và **không trùng** | B, techStack mới, link mới |
| `test/messages.test.ts` | không key `portfolio.*` mồ côi, đủ ở cả 2 locale | xoá/thêm bullet, card |
| `test/.../resume-card.test.tsx:13,178` | fixture text "Monorepo frontend và module Khám sức khoẻ" (fixture riêng, không phải catalogue) | không đụng |
| `test/.../home.template.test.tsx` | thứ tự 8 section, 1 h1 | §7.1(c) |

---

## §8. Ràng buộc từ rules (mỗi dòng một rule)

- Chuỗi người đọc thấy chỉ ở `packages/i18n/src/locales/{vi,en}.json`, **ICU** (`{name}`, `{count, plural, …}`, không rich-text tag); thiếu key ở một locale thì `messages.test.ts` đỏ — `next-i18n-next-intl.md`, ADR-0002, CLAUDE.md §3 hàng "A translation string".
- Ảnh/logo là **import** từ `~/assets/…` (`StaticImageData`), không URL `public/` — `quality-imports.md` § Static assets; `resume.ts:23-26` đang làm đúng.
- Mọi component dưới `features/home` là **Server Component** trừ `resume-card.tsx` (useState), `print-cv-button.tsx`, `Avatar`; thêm sticky-by-JS hay đo chiều cao = thêm `"use client"` ở chỗ không nên — `next-server-vs-client-components.md`; `home.template.tsx:13-19`.
- Link nội bộ (nếu có) qua `~/i18n/navigation` `Link`, không `next/link`; link ngoài là `<a target="_blank" rel="noreferrer">` như hiện tại — `next-i18n-next-intl.md`, `next-app-router-structure.md`.
- Dữ liệu CV là **constant module**, không `"use cache"` (có icon/StaticImageData, không serializable) — `next-data-fetching.md`; `resume.ts:31-38`.
- Tailwind class viết inline tại call site, không lift vào `~/constants` trừ khi ≥3 file phải khớp — `quality-styling-tailwind.md`, `architecture-shared-components.md`.
- Hình khối chỉ qua `StandardBlock` (viền 2px, `shadow-hard`, `--radius: 0`), mono cho nhãn/period/tech, sans cho văn xuôi, không fade — **ADR-0008**; sửa UI không được phá hợp đồng này (`accent.e2e.ts` đo).
- Brief design mới đặt ở `docs/design/<app>-<round>.md`, mockup HTML commit cạnh — `workflow.md` §7a, quyết định #25 (R2 `:290`); bước design đọc CSV tĩnh, **không** chạy Python — CLAUDE.md §4.
- Ticket = GitHub issue `spec` + sub-issue; Gate = `bun run check && typecheck && test && build`; E2E chỉ local (`bunx playwright test` từ `apps/portfolio` trên Windows) — CLAUDE.md §4, `testing-playwright.md`.
- Test mới đặt ở `apps/portfolio/test/<đường dẫn soi gương src>`; E2E `.e2e.ts` — `testing-coverage.md`, `testing-playwright.md`.
- Env mới (nếu muốn URL demo lấy từ env) phải là `NEXT_PUBLIC_PORTFOLIO_*` trong `client` + `clientRuntimeEnv` của `src/env.ts` và `.env.example` — `next-env-t3.md`, ADR-0003. (Không khuyến nghị: URL demo là **data**, để trong `resume.ts`.)
- Không `git add -A`, không stash; checkout đang có phiên khác — memory `concurrent-sessions-main-clone`.

---

## §9. Câu hỏi mở cho chủ repo (chỉ chủ repo quyết được)

1. **Timeline 3+:** chọn **B** (thêm Wisdom 03–09/2023, chấp nhận gap), **C** (Dcorp từ 06/2023 như CV giấy mới nhất), hay khác? Nếu C: Dcorp là "06/2023 – 02/2025" đúng không (S3/S4/P1 ghi Jun 2023)? Nếu B: mốc Wisdom nào trong 4 phiên bản (R1 `:117`), stack BE là Spring Boot hay Express?
2. **Danh xưng:** đổi cả `meta.description` + `about.experience` sang "Software Engineer …" (giữ "frontend là gốc" trong thân đoạn) — đồng ý? Role Arobid/Dcorp giữ "Frontend Developer" hay cũng nâng "Software Engineer" (S5/S14/S22 từng ghi Software Engineer cho Arobid — R1 `:98,102-103`)?
3. **Khám sức khoẻ:** duyệt tách thành bullet riêng `healthExam` như §5.3, hay viết lại theo ý khác? Có được nêu "ba chuyên trang / web người bệnh / ký số / nhập Excel" không (đều là tên nghiệp vụ chung, không tên bệnh viện)? Có muốn company blurb một dòng cho mỗi công ty (cần field mới)?
4. **URL demo của `apps/chat` mới** — là gì? (`chat-socket-fe.vercel.app` đang serve bản Rsbuild cũ.) Backend `chat-socket` có public URL để demo chạy thật không? Nếu chưa deploy: card chat sẽ **không có `Xem demo`** và câu note section phải bỏ chữ "demo sống".
5. **Card `documents`:** gắn `https://documents-ui.vercel.app` làm demo — xác nhận đó là project Vercel của `apps/documents` hiện tại (asset rolldown cho thấy đúng, nhưng chỉ chủ repo biết project nào auto-deploy)? Thêm link thứ ba sang Storybook (`storybook-monorepo-ui.vercel.app`) không?
6. **Card `monorepo`:** bỏ hẳn theo brief, hay chuyển thành một câu trong `projects.note` ("site này chính là app portfolio của monorepo — github.com/qtuan02/monorepo")? Link portfolio thật là `https://portfolio-tuanhq.vercel.app` — đúng không, có custom domain không?
7. **"Mô tả thêm về project":** mở lại **bullet** cho project (đảo #125), hay chỉ viết câu mô tả dài hơn (2 câu)?
8. **Sticky rail:** bỏ hẳn (§7.1a), hay tách Contact + Hobbies ra khỏi rail để rail còn Skills + Education (§7.1c)? Chủ repo đang xem ở kích thước màn hình nào khi thấy "sticky không cần thiết" (để đo lại đúng viewport)?
9. **Contact wrap (W1):** chấp nhận bố cục "nhãn trên, giá trị dưới", hay bỏ cột nhãn (chỉ icon + giá trị), hay rút text hiển thị? Giữ Hobbies không (nó là 1/4 chiều cao rail)?
10. **Project links (W2):** đồng ý đưa cụm link xuống hàng riêng dưới mô tả ở mọi breakpoint?
11. **Skills:** thêm Java / Node.js / Ant Design / Redux / Microservices (có trong CV giấy P1/P2 tr.2) vào nhóm tương ứng không? Rút techStack MedViet từ 13 xuống ~10 (W4)?
12. **Build/E2E:** note này **không** chạy `bun run --filter @monorepo/portfolio build` (tree đang dirty bởi phiên khác); ai implement chạy Gate + `bunx playwright test` trong `apps/portfolio`.
