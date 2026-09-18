# Dữ liệu dựng lại portfolio / CV của chủ repo — kho FACT, mâu thuẫn timeline, và schema để bước design điền vào

> Ngày kiểm tra: **2026-09-06**, nhánh `dev`, HEAD `96d0345`. Nguồn: chỉ primary sources — **8 PDF CV của chủ repo** trong `D:\hồ sơ` (đọc trọn từng trang), 2 PDF của người khác trong `D:\hồ sơ\khác` (chỉ lấy bố cục), ảnh thẻ `hinh-the.jpg`, **GitHub API** qua `gh` (`users/qtuan02`, 13 repo, README/languages/workflows/commits từng repo), **7 thư mục local** trong `D:\Personal` (git log, remote, manifest, README), `demon.zip` (stream `unzip -p`, **không** giải nén ra đĩa), **git history của chính repo này** (`data.ts` của portfolio cũ ở commit `eb12b35`), reference repo `E:\MedViet` (git log lọc author `@tuanhq`, manifest, `.csproj`), và hai trang báo/website public để xác minh một giải thưởng. Mọi claim có `path#trang` hoặc URL; chỗ chưa xác minh được ghi **"chưa xác minh"**.
>
> **Ba loại nội dung, đánh dấu suốt file:** **FACT** = có nguồn, trích được; **TARGET** = đích theo brief của chủ repo (mốc 3+ năm, vai trò từng công ty) — không phải sự thật đã kiểm; **DRAFT** = đề xuất của agent (bullet viết lại, phrasing) — chưa ai duyệt. Không bịa số: bullet DRAFT chỉ định lượng khi nguồn có số.
>
> **Không sửa file nào ngoài note này, không commit.** Một file cấu hình mạng chứa credential nằm trong `E:\MedViet` đã bị lỡ in ra terminal trong lúc khảo sát; nội dung của nó **cố ý không** được ghi vào đây và không dùng cho việc gì.

Cấu trúc: **§1 Tóm tắt** → **§2 Kho nguồn** → **§3 Hồ sơ cá nhân** → **§4 Timeline & mâu thuẫn** → **§5 Từng công ty** → **§6 Ma trận kỹ năng** → **§7 Dự án cá nhân** → **§8 Schema portfolio hiện tại** → **§9 Câu hỏi mở** → **§10 Tham chiếu bố cục** → **§11 Nguồn**.

---

## §1. Tóm tắt điều hành

1. **Có 8 bản CV của chủ repo, không bản nào nói giống bản nào về mốc thời gian.** Cùng một công ty, Dcorp R-Keeper có **5** cách ghi (Mar 2024–Mar 2025 / Mar 2024–Feb 2025 / Jun 2023–Feb 2025 / Sep 2024–May 2025 kèm part-time Mar–Sep 2024 / Mar 2024–May 2025 kèm part-time Jun 2022–Mar 2024); Arobid có **4**; Wisdom Robotics có **4** (kể cả GitHub README và portfolio cũ). Bảng đầy đủ ở §4.1, bảng mâu thuẫn ở §4.2.
2. **Không có bản CV nào ghi "Medviet".** Cả 6 bản có mốc 2026 đều ghi công ty hiện tại là **FPT IS – Software Engineer, Feb 2026 (một bản Jan 2026) – Present**, dự án "Social Protection System (Government Project)" và "Quang Ninh Healthcare System", stack Spring Boot/PostgreSQL. Brief nói **Medviet từ 3/2026**, stack React Native EMR + .NET. Bằng chứng git ở `E:\MedViet` (author `@tuanhq`): commit đầu **2026-05-22** (`web-emr`), `medviet` monorepo khởi tạo **2026-05-28**, `.NET his-server` từ **2026-06-05**, `emr-mobile` từ **2026-07-01** — tức là git chỉ chứng minh được từ **cuối tháng 5/2026**, không phải tháng 3. FPT IS là gì trong quan hệ với Medviet (client? outsourcing? hay hai job kế tiếp?) là **câu hỏi số 1** cần chủ repo trả lời (§9).
3. **Mốc "3+ năm" theo brief chưa tự đứng được.** Brief literal (Dcorp 12+ tháng, Arobid 12 tháng, Medviet từ 3/2026 = 7 tháng tính đến 9/2026) cộng lại **≈ 31 tháng ≈ 2 năm 7 tháng**. Muốn "3+" phải kể thêm Wisdom Robotics (bản CV ổn định nhất ghi Mar–Sep 2023, 7 tháng → 38 tháng) hoặc dời Dcorp về Jun 2023 như hai bản `FE/Resume` + `software/CV` (→ 39 tháng). Ba phương án TARGET tính sẵn ở §4.3 — chủ repo chọn, agent không tự chọn.
4. **Phần Arobid và Dcorp có dữ liệu bullet dày, nhất quán về nội dung** (chỉ lệch ngày): TradeXpo + Shapespark + CleverTap + gamification + coupon/promotion + CMS PayloadCMS/MongoDB/Lexorank + Mobile RN; Dcorp có 4 sub-project (Internal Management Platform, e-Menu, VTI–Highlands Omnichannel/Inventory, Internal UI System). Giải **"Sản phẩm, dịch vụ, giải pháp công nghệ số xuất sắc" — Vietnam Digital Awards 2025** cho Arobid TradeXpo được **xác minh** qua VietTimes 08/10/2025 (§5.2). Phần Medviet **không có bullet CV nào**, chỉ có git log — §5.3 dựng FACT từ commit subject và DRAFT bullet từ đó.
5. **Dự án cá nhân: 13 repo GitHub, 4 là fork, 0 star, 0 follower.** Có **4 repo có demo đang sống (HTTP 200)**: `monorepo` (portfolio-ui-2025.vercel.app), `chat-socket-fe` (chat-socket-fe.vercel.app), `fe-motel-rsbuild` (motel-management-portal.vercel.app), `gitlab-bot-for-lark`. `discord-bot` trên Render **không phản hồi**. Shortlist 5 repo "hoàn hảo" để gắn portfolio ở §7.3. Repo profile `qtuan02/qtuan02` có clone local nhưng GitHub trả **404** (private hoặc đã xoá).
6. **Portfolio hiện tại trong repo** (`apps/portfolio`) đã join đúng bản `FE/CV_Frontend_Huynh_Quoc_Tuan.pdf` (Apr 2026): 4 work item `fptis / arobid / dcorp / wisdom`, 7 section, **không có section Projects** (bản cũ trước rebuild có "Public Projects" với 6 card — §8.3). Để chứa dữ liệu mới cần: thêm work item `medviet` + logo, quyết số phận `fptis`, thêm lại `ProjectItem` + section + ảnh, cân nhắc nhóm `SKILLS` theo FE/BE/Mobile/DevOps, thêm LinkedIn vào contact. Chi tiết §8.4.
7. **Ảnh thẻ có sẵn:** `hinh-the.jpg` 354×421 px, dọc, 30 KB (2025-03-28). Bản `bịp/Resume` là bản duy nhất in ảnh lên CV. Portfolio đang dùng `src/assets/avatar.jpg` + `public/og-image.jpg`.
8. **Hai file tưởng là của chủ repo nhưng không phải:** `demon.zip/demon/CV.tex` là CV LaTeX của người khác ("Tom Huynh", email khác) — chỉ là template Jake's Resume; và `khác/*.pdf` là hai CV người khác. Cả ba **chỉ** dùng làm tham chiếu bố cục (§10), không trộn dữ liệu.

---

## §2. Kho nguồn đã đọc

| # | Nguồn | Loại | Ghi chú |
|---|---|---|---|
| S1 | `D:\hồ sơ\Resume_Huynh_Quoc_Tuan.pdf` (mtime 2026-05-11, 2 trang) | CV chủ repo | "Frontend Developer 2+ years"; FPT IS / Arobid / Dcorp; có link GitHub; không Wisdom |
| S2 | `D:\hồ sơ\FE\CV_Frontend_Huynh_Quoc_Tuan.pdf` (2026-04-16, 2 trang) | CV chủ repo | "Frontend Developer 3+ years"; FPT IS / Arobid / Dcorp / Wisdom; **bản portfolio hiện tại đang dùng nguyên văn** |
| S3 | `D:\hồ sơ\FE\Resume_Huynh_Quoc_Tuan.pdf` (2026-06-02, 2 trang) | CV chủ repo | "Frontend Developer 3+"; FPT IS 2 dự án / Arobid / Dcorp **Jun 2023** |
| S4 | `D:\hồ sơ\software\CV_Huynh_Quoc_Tuan.pdf` (2026-06-06, 2 trang) | CV chủ repo | Nội dung = S3, chỉ đổi summary thành "Software Engineer 3+" |
| S5 | `D:\hồ sơ\software\Resume_Huynh_Quoc_Tuan.pdf` (2026-06-02, 2 trang) | CV chủ repo | "Software Engineer 2+"; FPT IS **Jan 2026**; Arobid **Software Engineer** Feb 2025–**Jan 2026**; có mục **PERSONAL PROJECT: Real-time Chat Application** |
| S6 | `D:\hồ sơ\bịp\Resume_Huynh_Quoc_Tuan.pdf` (2026-05-11, 2 trang) | CV chủ repo ("bùa") | Nội dung = S1 **+ ảnh thẻ** góc phải |
| S7 | `D:\hồ sơ\bịp\3\CV_HuynhQuocTuan_FE_1.pdf` (2026-02-02, 2 trang) | CV chủ repo ("bùa") | "FE 3+"; Arobid May 2025–Present; Dcorp Sep 2024–May 2025 + part-time Mar–Sep 2024; Wisdom Jun 2023–Mar 2024; **University internship Mar–Jun 2023 (Dental Booking, Laravel)**; không FPT IS |
| S8 | `D:\hồ sơ\bịp\4\CV_HuynhQuocTuan_FE.pdf` (2026-02-05, 2 trang) | CV chủ repo ("bùa") | "FE **4+**"; Dcorp Mar 2024–May 2025 + part-time **Jun 2022–Mar 2024**; Wisdom **Internship Mar–Jun 2022**; không FPT IS |
| S9 | `D:\hồ sơ\khác\HAO_PHAM_2025.pdf` (2 trang) | CV người khác | Chỉ bố cục (§10) |
| S10 | `D:\hồ sơ\khác\nguyen_duy_khuong_cv.pdf` (5 trang) | CV người khác | Chỉ bố cục (§10) |
| S11 | `D:\hồ sơ\hinh-the.jpg` | Ảnh thẻ | JPEG 354×421, dọc, 30.129 B, EXIF orientation upper-left |
| S12 | `gh api users/qtuan02` | GitHub profile | name "Huynh Quoc Tuan", created 2024-02-22, 13 public repos, 0 followers, bio/company/location/blog **trống** |
| S13 | `gh api users/qtuan02/repos` + per-repo `languages` / `contents` / `contents/.github/workflows` / `commits` / `readme` | GitHub 13 repo | Bảng §7.1 |
| S14 | `D:\Personal\qtuan02\README.md` (git 2025-12-31, remote `qtuan02/qtuan02`) | Profile README (clone local) | GitHub trả 404 cho repo này → private/xoá; nội dung §4.1 hàng "GH-README" |
| S15 | `D:\Personal\chat\{chat-socket, chat-socket-fe, implementation_plan.md, chat-socket.rar}` | Local | §7.2 |
| S16 | `D:\Personal\project\{backend, frontend, *.md, *.docx}` | Local | §7.2; `frontend` remote cũ `project-rsbuild` → GitHub đã đổi tên `fe-motel-rsbuild` (API redirect xác nhận) |
| S17 | `D:\Personal\spring-boot-microservices` | Local | §7.2 |
| S18 | `D:\Personal\discord-bot` | Local | §7.2 |
| S19 | `D:\Personal\devops-local\{01-enterprise-gitops-flow.md, 02-local-gitops-lab.md, docker-compose.yml (0 B)}` | Local, không git | Ghi chú học GitOps (Jenkins + Argo CD + K8s Docker Desktop), ngày 2026-09-05; chưa có code |
| S20 | `D:\Personal\demon.zip` → `demon/CV.tex` + `portrait.jpg` | Stream, không giải nén | CV LaTeX **của người khác** (§10) |
| S21 | `apps/portfolio/**` (resume.ts, types/resume.ts, 7 section, README, test, layout.tsx, navbar.ts, assets) + `packages/i18n/src/locales/{vi,en}.json` namespace `portfolio.*` | Repo này | §8 |
| S22 | `git show eb12b35:apps/portfolio/src/constants/data.ts` (portfolio **cũ**, 2026-03-16) | Git history repo này | Timeline cũ + 6 project card (§8.3) |
| S23 | `E:\MedViet\frontend\{medviet, web-emr, emr-mobile}`, `backend\his-server`, `devops\emr-dh-testing-rollout`, `gitlab-bot` | Reference repo trên máy (git author `@tuanhq`) | Bằng chứng duy nhất về Medviet (§5.3) |
| S24 | VietTimes 08/10/2025 — "Vietnam Digital Awards 2025: Vinh danh 49 tổ chức, giải pháp và 3 cá nhân" | Báo | Xác minh giải Arobid TradeXpo (§5.2) |
| S25 | `curl -I` 7 URL demo | Liveness | §7.1 cột "Demo" |

Không đọc được / không làm: `https://tradexpo.arobid.com/vi` trả **403** cho WebFetch (không xác minh được con số "1 triệu lượt truy cập / 50 quốc gia" mà kết quả search gán cho trang này — **chưa xác minh**, không dùng); `discord-bot-pfuo.onrender.com` không phản hồi (curl exit, code 000); demo cũ `chat-assistant-ai-tuan.vercel.app` và `documents-ui.vercel.app` (từ S22) **chưa kiểm tra** liveness.

---

## §3. Hồ sơ cá nhân (FACT)

| Trường | Giá trị | Nguồn |
|---|---|---|
| Họ tên | HUYNH QUOC TUAN — tiếng Việt có dấu "Huỳnh Quốc Tuấn" | mọi PDF trang 1; `vi.json` `portfolio.meta.title` |
| Ngày sinh | 20/07/2002 | S1–S6 tr.1 (S7, S8 bỏ trường này) |
| Điện thoại | (+84) 393 653 862 | mọi PDF tr.1 |
| Email | huynhquoctuan200702@gmail.com | mọi PDF tr.1 |
| Địa chỉ | District 7, Ho Chi Minh City, Vietnam | S1–S6 tr.1 |
| GitHub | github.com/qtuan02 (id 160866835, tạo 2024-02-22) | S1, S5, S6 tr.1; S12 |
| LinkedIn | linkedin.com/in/tuan-huynh-916b792b7 | S14; `apps/portfolio/src/features/layout/constants/navbar.ts`; S22 |
| Học vấn | Bachelor of Engineering in Information Technology, **Saigon Technology University**, Ho Chi Minh City, **2020 – 2024** | mọi PDF tr.2; S22 ghi "Engineer Degree – Information Technology Engineering" |
| Ngoại ngữ | English (Basic) | S1, S5, S6, S7, S8 tr.2 (S2–S4 không có dòng Languages) |
| Chứng chỉ | **không có** trong bất kỳ nguồn nào | — |
| Sở thích | "Researching new technologies, Design Systems, Sports, Reading" (S1, S6–S8) → portfolio mở rộng thành Sport / Read book / Travel / Listen to music / Watch movies | PDF tr.2; `en.json` `portfolio.hobbies` |
| Mục "ADDITIONAL" | "Good teamwork and communication. Fast learner with a strong adaptation mindset. Interested in performance optimization, source structure, and user experience. Able to work across frontend and backend when the project requires it." | S2–S4 tr.2; = `portfolio.about.mindset` |
| Ảnh | `hinh-the.jpg` 354×421 dọc (S11); portfolio dùng `apps/portfolio/src/assets/avatar.jpg` (hero) + `public/og-image.jpg` 1200×630 (social card) | S11; `hero-section.tsx`, `layout.tsx` |
| Portfolio đang chạy | https://portfolio-ui-2025.vercel.app — 200, `<title>Huynh Quoc Tuan</title>`, headings About / Work Experience / Education / Skills / Contact / Hobbies (đúng 7 section của repo hiện tại, **không có Projects**) | S25 |

**Summary hiện có (nguyên văn, để chọn/viết lại):**

- S1/S6: *"Frontend Developer with 2+ years of experience building scalable web applications using React.js, Next.js. Strong in developing pixel-perfect UIs from Figma, optimizing performance with SSR/ISR, and building reusable components based on design systems. Able to work on both frontend and backend when needed…"*
- S2/S3 (S4 đổi chữ đầu thành Software Engineer): *"Frontend Developer with 3+ years of experience building and maintaining scalable web applications using React.js and Next.js. Experienced in turning Figma designs into clean, responsive interfaces… Comfortable working with SSR, ISR, and state management… Also able to support backend work when needed…"* — đây là `portfolio.about.experience` hiện tại.
- S5: *"Software Engineer with 2+ years of experience developing web applications using React.js, Next.js, and Spring Boot… Familiar with microservice architectures…"*
- S7/S8: *"Frontend Developer with 3+/4+ years… hands-on experience in design systems, UI/UX optimization, and data-driven product development…"*

---

## §4. Timeline kinh nghiệm

### 4.1 Từng bản CV nói gì (FACT — bảng bản CV × công ty)

| Nguồn (ngày file) | Wisdom Robotics | Dcorp R-Keeper | Arobid | Công ty hiện tại | Khác |
|---|---|---|---|---|---|
| S1 `Resume` (2026-05-11) | — | FE Dev, **Mar 2024 – Mar 2025** | FE Dev, **Mar 2025 – Feb 2026** | **FPT IS** SE, **Feb 2026 – Present** (Social Protection) | — |
| S2 `FE/CV_Frontend` (2026-04-16) | SE, **Mar 2023 – Sep 2023** | FE Dev, **Mar 2024 – Feb 2025** | FE Dev, **Feb 2025 – Feb 2026** | FPT IS SE, **Feb 2026 – Present** | = portfolio hiện tại |
| S3 `FE/Resume` (2026-06-02) | — | FE Dev, **Jun 2023 – Feb 2025** | FE Dev, Feb 2025 – Feb 2026 | FPT IS SE, Feb 2026 – Present (QN Healthcare + Social Protection) | — |
| S4 `software/CV` (2026-06-06) | — | FE Dev, **Jun 2023 – Feb 2025** | FE Dev, Feb 2025 – Feb 2026 | FPT IS SE, Feb 2026 – Present | = S3 |
| S5 `software/Resume` (2026-06-02) | — | FE Dev, Mar 2024 – Feb 2025 | **Software Engineer**, Feb 2025 – **Jan 2026** | FPT IS SE, **Jan 2026** – Present | có Personal Project |
| S6 `bịp/Resume` (2026-05-11) | — | FE Dev, Mar 2024 – Mar 2025 | FE Dev, Mar 2025 – Feb 2026 | FPT IS SE, Feb 2026 – Present | = S1 + ảnh |
| S7 `bịp/3` (2026-02-02) | SE, **Jun 2023 – Mar 2024** | FE Dev **Sep 2024 – May 2025** + FE Dev **part-time Mar 2024 – Sep 2024** | FE Dev, **May 2025 – Present** | (không có) | University internship **Mar 2023 – Jun 2023** |
| S8 `bịp/4` (2026-02-05) | SE **Internship Mar 2022 – Jun 2022** | FE Dev **Mar 2024 – May 2025** + FE Dev **part-time Jun 2022 – Mar 2024** | FE Dev, May 2025 – Present | (không có) | summary "4+ years" |
| GH-README S14 (2025-12-31) | **Internship Mar 2024 – Jun 2024** | FE Dev, Sep 2024 – May 2025 | **Software Engineer**, May 2025 – Present | (không có) | summary "over 2 years" |
| Portfolio cũ S22 (2025-12-26/2026-03-16) | SE Intern, Mar 2024 – Jun 2024 | FE Dev, Sep 2024 – May 2025 | Software Engineer, May 2025 – Present | (không có) | "over 2 years" |
| Portfolio hiện tại S21 | SE, 03/2023 – 09/2023 | FE Dev, 03/2024 – 02/2025 | FE Dev, 02/2025 – 02/2026 | FPT IS SE, 02/2026 – Hiện tại | = S2 |

Ghi chú đọc bảng: **S7/S8 là hai bản "bùa" mạnh nhất** (kéo Wisdom về 2022, thêm part-time Dcorp từ 2022) và cũng là hai bản duy nhất có "B2B E-commerce Platform" tách riêng và "Medusa UI"; S1/S6 là bản "khiêm tốn" nhất (2+ năm, không Wisdom). **Chuỗi xuất hiện nhiều lần nhất và tự nhất quán nội bộ** là chuỗi của S2 (Wisdom Mar–Sep 2023 → Dcorp Mar 2024–Feb 2025 → Arobid Feb 2025–Feb 2026 → FPT IS Feb 2026): nó là bản portfolio đang deploy.

### 4.2 Brief nói / Tài liệu nói / Cần xác nhận

| Mục | Brief của chủ repo nói | Tài liệu nói | Cần chủ repo xác nhận |
|---|---|---|---|
| Dcorp — thời lượng | "1 năm +" | 12 tháng (S2, S5), 13 tháng (S1, S6), **21 tháng** (S3, S4: Jun 2023–Feb 2025), 9 tháng full-time + 7 part-time (S7), 15 full-time + 22 part-time (S8) | Mốc bắt đầu thật (Mar 2024? Jun 2023? có part-time trước không?) và mốc kết thúc (Feb hay Mar hay May 2025) |
| Dcorp — vai trò | "chủ yếu Frontend" | Mọi bản: "Frontend Developer"; S7/S8 thêm "part-time" | Có ghi part-time không |
| Arobid — thời lượng | "1 năm" | Feb 2025–Feb 2026 (S2–S4), Mar 2025–Feb 2026 (S1, S6), Feb 2025–Jan 2026 (S5), May 2025–Present (S7, S8, S14, S22 — đều viết trước/đầu 2026) | Tháng vào (Feb / Mar / May 2025) và tháng ra (Jan / Feb 2026) |
| Arobid — vai trò | "FE + một chút BE PayloadCMS" | "Frontend Developer" (7 nguồn) vs "Software Engineer" (S5, S14, S22); bullet CMS "full-stack… frontend and backend" xuất hiện ở mọi bản | Chức danh chính thức |
| Công ty hiện tại | **Medviet, từ 3/2026**; FE web + app React Native (EMR) + BE .NET | **FPT IS** Feb 2026 (S1–S4, S6) hoặc Jan 2026 (S5); dự án "Social Protection System (Government Project)", "Quang Ninh Healthcare System"; stack Spring Boot, Spring Data JPA, PostgreSQL, Ant Design. **Không nguồn nào ghi Medviet, .NET hay React Native cho giai đoạn này.** Git `E:\MedViet`: commit đầu của `@tuanhq` **2026-05-22** | (a) FPT IS là gì — job trước Medviet, hay Medviet là nhà thầu/đối tác của FPT IS, hay tên "bùa"? (b) Tên công ty đúng để in: "Medviet"? "MedViet"? "DHSC"? (c) Ngày vào chính xác (3/2026 theo brief; git chỉ có từ 22/05/2026) (d) Chức danh |
| Wisdom Robotics | brief **không nhắc** | 4 phiên bản (Mar–Sep 2023 SE; Jun 2023–Mar 2024 SE; Mar–Jun 2022 Intern; Mar–Jun 2024 Intern) | Có giữ không; nếu giữ thì mốc nào; SE hay Intern |
| University internship (Dental Booking, Laravel) | không nhắc | chỉ S7 | Có thật không, có giữ không |
| Tổng kinh nghiệm | "3+ năm" | 2+ (S1, S5, S6, S14, S22) / 3+ (S2–S4, S7) / 4+ (S8) | Xem §4.3 |

### 4.3 Timeline TARGET đề xuất (theo brief — chưa phải sự thật)

Tính đến **09/2026**, đếm tháng có mặt (tháng đầu và tháng cuối tính cả):

| Phương án | Chuỗi | Tháng | Đạt "3+" chưa |
|---|---|---|---|
| **A — brief literal, không Wisdom** | Dcorp Mar 2024–Feb 2025 (12) → Arobid Mar 2025–Feb 2026 (12) → Medviet Mar 2026–nay (7) | **31** ≈ 2 năm 7 tháng | **Chưa.** Khoảng trống Sep 2023–Mar 2024 không tính |
| **B — chuỗi S2 + đổi FPT IS thành Medviet** | Wisdom Mar–Sep 2023 (7) → Dcorp Mar 2024–Feb 2025 (12) → Arobid Feb 2025–Feb 2026 (13) → Medviet Mar 2026–nay (7) | **39** ≈ 3 năm 3 tháng; span lịch Mar 2023→Sep 2026 = 42 tháng | **Đạt**, nhưng có gap 6 tháng Oct 2023–Feb 2024 lộ trên timeline |
| **C — chuỗi S3/S4 (Dcorp từ Jun 2023)** | Dcorp Jun 2023–Feb 2025 (21) → Arobid Feb 2025–Feb 2026 (13) → Medviet Mar 2026–nay (7) | **41** ≈ 3 năm 5 tháng, không gap | **Đạt**, không cần Wisdom; nhưng mâu thuẫn với S1/S2/S5/S6/S7/S8 và với brief "Dcorp 1 năm +" |

Chú thích: (1) nếu giữ FPT IS Feb 2026 **và** Medviet Mar 2026 thì FPT IS chỉ 1 tháng — không đáng in; (2) phương án B là phương án **ít phải đổi dữ liệu nhất** so với portfolio đang deploy (chỉ thay `fptis` → `medviet`); (3) mọi con số trên là TARGET để chủ repo chọn — không phương án nào được agent coi là đúng.

---

## §5. Từng công ty

### 5.1 Dcorp R-Keeper — Frontend Developer

**FACT (bullet nguyên văn theo sub-project; mọi bản đều đồng ý về nội dung):**

*Internal Management Platform* (S1 tr.2, S3 tr.2, S5 tr.2, S6 tr.2; S2 tr.2 viết narrative; S7/S8 tr.1 tách rõ API):
- Maintained system stability and developed new features, improving overall UI/UX.
- Built reporting features tailored to the F&B domain for business monitoring.
- Built invoice input features to manage and track company orders.
- Developed chart components (column, timeline) to track call activities and employee work logs.
- Integrated external systems including **Omicall** (call tracking), **ClickUp** (work logs), and **GDT API** (invoice management — General Department of Taxation).
- S2: "Built an internal admin system for CRM, ERP, and operational workflows in the F&B domain"; "data-heavy screens featuring advanced tables, multi-filters, search, and pagination".
- Technologies: React.js, Next.js, Zustand, TanStack Query, Tailwind CSS, Radix UI, Shadcn UI, Ant Design, Storybook.

*Digital e-Menu Application* (S1–S6 tr.2; S8 xếp vào part-time):
- Designed and developed menu listing and category navigation screens; product detail pages with customization options; shopping cart and order history screens; **temporary bill** feature to track and estimate total spending; implemented and optimized shopping cart logic.
- Technologies: React.js, Next.js, Zustand, TanStack Query, Tailwind CSS, Shadcn UI.

*VTI – Highlands Coffee (Client) – Omnichannel Order & Inventory Management* (S1, S3–S6 tr.2; S2 tr.1–2; S8 tách thành 2 dự án):
- Built dashboard and management screens for orders and inventory across multiple channels (**Shopee, Grab, POS, internal systems**).
- Developed listing and detail views with table/block layouts, supporting filtering, sorting, and status update flows.
- Implemented **goods receipt and goods issue** features; reporting features; settings screens for system configurations and business rules.
- S2: "Handled large datasets and complex multi-state order workflows with optimized performance" — không có số.
- Technologies: React.js, Next.js, Zustand, TanStack Query, Tailwind CSS, Radix UI, Shadcn UI, Ant Design, Storybook; S2/S8 thêm **Daisy UI**.

*Internal UI System / Internal Design System* (S2 tr.2; S7 tr.2 "Internal System"; S8 tr.2):
- Built reusable components to keep the UI consistent across projects; standardized component usage; wrote and maintained component documentation; resolved layout issues, performed manual UI testing.
- S7/S8: "Researched open-source solutions and adapted components"; Technologies: Monorepo, Next.js, **Medusa UI**, Radix UI, Shadcn UI, Ant Design, Storybook.

*Từ nguồn khác:* S14/S22: "Built analytical dashboards using **Recharts**"; "Developed core features for the CRM system".

**TARGET theo brief:** "chủ yếu Frontend", thời lượng "1 năm +".

**DRAFT bullet viết lại (không thêm số vì nguồn không có số):**
- Built the frontend of an F&B back-office suite (CRM/ERP, reporting, tax-invoice input) on Next.js + TanStack Query + Zustand, integrating Omicall, ClickUp and the GDT e-invoice API.
- Delivered the Highlands Coffee omnichannel order & inventory portal (Shopee, Grab, in-store POS, internal channels): order lists/detail with multi-state workflows, goods receipt/issue, reporting and business-rule settings.
- Shipped the customer-facing digital e-Menu (menu, item detail, cart, order history, running bill) and optimised cart state for frequent updates.
- Maintained the shared UI system (shadcn/Radix + Ant Design, Storybook docs, monorepo) used across internal products.

### 5.2 Arobid — Frontend Developer (S5/S14/S22: Software Engineer)

**FACT — bullet nguyên văn:**

*TradeXpo Digital Exhibition on B2B Platform* (S1, S3–S8 tr.1; S2 tr.1 narrative):
- Developed new features and maintained the platform; implemented UIs from Design team Figma files with pixel-perfect accuracy.
- Built event-based games and mini-games with reward mechanisms to support enterprise marketing campaigns. (S2: "gamification features such as check-in, booth interaction, product viewing, and rewards")
- Integrated **Shapespark SDK** to deliver immersive 3D environments (S2: "3D/VR system using Shapespark through **iframe and postMessage** communication").
- Integrated **CleverTap** to track user behavior.
- Developed **coupon** features for enterprise customers; implemented **promotion** features for enterprise product groups (S7/S8 tách thành "B2B E-commerce Platform").
- S2: "Built core pages such as home, event list, event detail, and inner pages"; "Optimized the user experience for media-heavy and dynamic pages".
- Contributed to the platform winning "Excellent Digital Technology Solution" at Vietnam Digital Awards 2025.
- Technologies: Monorepo, React.js, Next.js, Zustand, TanStack Query, Tailwind CSS, Shadcn UI (S2/S7/S8 thêm Radix UI).

*CMS Platform* (mọi bản):
- Built and maintained a full-stack CMS, covering both frontend and backend development.
- Improved SEO and performance using SSR and ISR.
- Developed content management features including categories, articles, and FAQs.
- Implemented featured content pinning and drag-and-drop sorting; applied the **Lexorank** algorithm to optimize ordering updates with minimal backend operations.
- Developed and maintained content-driven platforms powered by the CMS: **News, Help Center, Careers**, other landing pages.
- Technologies: Monorepo, **Payload** (S7/S8: PayloadCMS), Next.js, Zustand, TanStack Query, Tailwind CSS, **MongoDB**, Shadcn UI.

*Mobile App (React Native)* (S1, S3, S4, S6 tr.1–2; **không** có ở S2, S5, S7, S8):
- Maintained and fixed bugs in React Native applications; customized reusable UI components adapted from Shadcn design system for mobile.
- Technologies: Monorepo, **Expo**, React Native, TypeScript.

*Link sản phẩm public (S22):* `https://arobid.com/tradexpo`, `https://arobid.com/careers`, `https://arobid.com/help` (FAQs), `https://arobid.com/tradexpo/vi/news` (CMS-driven News). Ảnh chụp từng có trong portfolio cũ: `public/projects/{tradexpo,careers,faqs,cms-platform}.jpg` (đã xoá khỏi tree hiện tại, còn trong git ở `eb12b35`).

**Giải thưởng — đã xác minh:** VietTimes 08/10/2025 (S24): *"Arobid TradeXpo - Công nghệ triển lãm trực tuyến trên nền tảng thương mại điện tử B2B toàn cầu của Công ty Cổ phần Công nghệ Arobid"* được vinh danh ở **Hạng mục 3 – Sản phẩm, dịch vụ, giải pháp công nghệ số xuất sắc**, Lễ trao Giải thưởng Chuyển đổi số Việt Nam (Vietnam Digital Awards) 2025, chiều 08/10/2025. Tên tiếng Anh trong CV "Excellent Digital Technology Solution" là bản dịch — nên in kèm tên tiếng Việt chính thức của hạng mục.

**TARGET theo brief:** FE là chính, "có làm một chút BE dùng PayloadCMS", 1 năm.

**DRAFT bullet viết lại:**
- Frontend of Arobid TradeXpo — a B2B digital-exhibition platform (Next.js monorepo, shadcn/Tailwind): home, event list/detail and booth journeys, pixel-matched to Figma.
- Embedded Shapespark 3D/VR booths via iframe + postMessage and built event mini-games (check-in, booth interaction, rewards) that drove enterprise campaigns.
- Instrumented user behaviour with CleverTap; shipped coupon and product-group promotion features for enterprise customers.
- Owned the PayloadCMS + MongoDB content platform end to end (schema, admin, SSR/ISR front ends for News, Help Center, Careers); implemented Lexorank ordering so drag-and-drop pinning costs one write.
- TradeXpo won "Sản phẩm, dịch vụ, giải pháp công nghệ số xuất sắc" — Vietnam Digital Awards 2025 (08/10/2025).
- (Chỉ nếu chủ repo xác nhận) Maintained the Expo/React Native companion app, porting shadcn-style components to mobile.

### 5.3 Medviet (brief) / FPT IS (CV) — giai đoạn 2026

**FACT từ CV (FPT IS, S1–S6):**
- *Social Protection System (Government Project)*: maintained and fixed bugs across core modules; modules category, social facility, staff, beneficiary, user management; reusable UI components (tables, forms, input controls, filtering); data-driven screens with sorting/filtering/pagination; "Developed and supported backend APIs, handling data processing and integration with database". Technologies: Microservices, Monorepo, React.js, Spring Boot, Tailwind CSS, Spring Data JPA, PostgreSQL, Ant Design.
- *Quang Ninh Healthcare System* (S3–S5): set up the frontend codebase structure; healthcare category management; import/export; admin configuration tools; backend APIs. Technologies: + TanStack Query, Zustand.

**FACT từ git `E:\MedViet` (author `@tuanhq`, S23) — đây là bằng chứng duy nhất cho stack Medviet mà brief mô tả:**

| Repo (remote) | Stack (manifest) | Đóng góp của `@tuanhq` | Nội dung commit tiêu biểu |
|---|---|---|---|
| `frontend/medviet` (`gitlab.com/dhs-frontend/turbo-web`) | Bun workspaces + Turborepo, namespace `@medviet/*`; apps `_template_vite`, `health-checkup`, `health-exam`, `manage-form`, `storybook`; packages `api dayjs env hook i18n types ui`; React 19 + Vite + react-router + TanStack Query + Zustand + RHF + Zod + react-i18next + Vitest + Playwright + Biome; runner nginx | **237 commits**, từ **2026-05-28** ("init: medviet monorepo") đến 2026-09-06 | `health-exam`: đăng nhập người bệnh qua IAM + captcha, phiên/token cổng NB, đọc Biểu mẫu/Phiếu khám từ form-server, lưu & ký Nhóm chỉ tiêu, tally realtime; `.agents/` + CLAUDE.md quy ước AI (repo này là "khuôn" cho `D:\Personal\monorepo`, xem `personal-monorepo-rebuild.md`) |
| `frontend/web-emr` (`gitlab.com/dhsc/emr/web-emr`, repo từ 2023-09) | Next.js 14 (pages router) + React 18 + Redux Toolkit/Saga + redux-persist + Ant Design + RHF + axios | **64 commits**, 2026-05-22 → 2026-08-13 | Màn IAMF40010/20/30, M02F00710/00720 (bảng thuốc/dịch vụ, mẫu đơn thuốc, chi tiết gói), labor chart, permission & webconfig, autocomplete/ICD fixes, PROJ-2088 |
| `frontend/emr-mobile` (`gitlab.com/dhsc-mobile/emr-mobile`) | **Expo ~57 + React Native** + expo-router + NativeWind + TanStack Query (+ sync-storage-persister) + Zustand + RHF + Zod + Reanimated + jest-expo; monorepo `@medviet-mobile/*` (apps/emr; packages api env hook icons types ui) | **40 commits**, 2026-07-01 → 2026-07-31 | feat: danh sách người bệnh tại khoa, hồ sơ bệnh án, kết quả cận lâm sàng, lịch sử điều trị, QR scan, hồ sơ trình ký & tài khoản, chứng từ người bệnh, chữ ký (signature); refactor W0–W7: dựng Turborepo monorepo, tách 6 package, gom 22 service vào class `EmrSdk`; perf: "làm phẳng danh sách nhóm theo ngày thành row stream để hết ANR"; test cho stores/logic/component |
| `backend/his-server` (`gitlab.com/dhs-backend/his-server`, repo từ 2024-03) | **.NET 8** (`net8.0`), EF Core 8 (SqlServer + Npgsql), MediatR 13, Serilog, Quartz, Swashbuckle, `ModelContextProtocol` 0.2.0-preview; solution HIS.API / HIS.Core / HIS.MCP / HIS.Server / HIS.Tests / HIS.Utils | **21 commits**, 2026-06-05 → 2026-06-22 | command/query cho IAMF40010/20/30, validation & mapping `IAM_MedicalServiceItem`, sample prescription |
| `devops/emr-dh-testing-rollout` (`gitlab.com/dhsc-rollout/...`) | manifest deploy | 1 commit 2026-09-05 "feat: health exam" | — |
| `gitlab-bot` (= GitHub `gitlab-bot-for-lark`) | Next.js 14, webhook GitLab → Lark card | 3 commits 2026-05-26 → 06-01, deploy Vercel (200) | Suy đoán: tooling cho team GitLab + Lark của Medviet — **chưa xác minh** |

Nhận xét (FACT): tên tổ chức xuất hiện trong remote là **`dhsc` / `dhs-frontend` / `dhs-backend` / `dhsc-mobile`**; README `frontend/medviet` tự gọi "MedViet Frontend — Monorepo frontend cho các sản phẩm MedViet". Domain nghiệp vụ: **EMR/HIS** (bệnh án điện tử), khám sức khoẻ (`health-exam`, `health-checkup`), IAM. Mốc sớm nhất có git là **22/05/2026**, muộn hơn brief (3/2026) hai tháng — có thể do onboarding không commit, hoặc repo khác; **cần chủ repo xác nhận**.

**TARGET theo brief:** FE web + app React Native (EMR) + BE .NET, từ 3/2026.

**DRAFT bullet (chỉ từ git; con số là số commit/ngày trong git, không phải KPI):**
- Bootstrapped the MedViet frontend monorepo (Bun + Turborepo, React 19/Vite, shared `@medviet/*` packages, Vitest + Playwright gate, agent conventions) and built the patient health-exam portal on it: IAM sign-in with captcha, form-server driven exam sheets, per-group save and e-signature.
- Built the EMR mobile app on Expo/React Native (NativeWind, TanStack Query, Zustand): in-department patient list, medical records, lab results, treatment history, QR scan, sign-off dossiers and e-signature; restructured it into a Turborepo monorepo with an `EmrSdk` service layer and removed an ANR by flattening date-grouped lists into a row stream.
- Maintained the legacy Next.js/Redux EMR web (prescription and service-package screens, labor chart, permission & web-config) and implemented the matching .NET 8 (EF Core, MediatR) command/query handlers on the HIS server.

### 5.4 Wisdom Robotics (nếu giữ)

FACT (S2 tr.2): *Vehicle Maintenance System* — worked with BA to define maintenance workflows; developed backend services using Java Spring Boot and PostgreSQL, built frontend screens using Next.js; modules vehicles, maintenance schedules, spare parts. Technologies: Spring Boot, React.js, Spring Data JPA, PostgreSQL, Tailwind CSS, Redux. S7/S8/S14: **Express.js** thay Spring Boot, "Designed UI/UX flows in Figma", "Built the Backend codebase from scratch". S22: Spring Boot + Next.js. → **stack BE của dự án này mâu thuẫn (Spring Boot vs Express.js)** — cần xác nhận.

---

## §6. Ma trận kỹ năng (mỗi ô có nguồn)

| Nhóm | Skill | Nguồn chứng minh |
|---|---|---|
| **FE** | React.js, Next.js (App Router + pages), TypeScript/JavaScript | mọi CV; repo `monorepo` (Next 16, RR 8, Vite 8), `chat-socket-fe`, `fe-motel-rsbuild`; `web-emr` (Next 14) |
| FE | Tailwind CSS, shadcn/ui, Radix UI, Base UI, Ant Design, Daisy UI, Medusa UI | CV Dcorp/Arobid; `packages/ui` repo này (63 primitive Base UI); S2/S8 (Daisy); S7/S8 (Medusa) |
| FE | TanStack Query, Zustand, Redux / Redux Toolkit, React Hook Form + Zod | CV; `chat-socket-fe`, `fe-motel-rsbuild`, `medviet`; `web-emr` (Redux Saga) |
| FE | SSR / ISR / SEO, React Server Components, `"use cache"` | CV Arobid CMS; `apps/portfolio`, `_template_next` |
| FE | i18n (i18next, next-intl, ICU) | `packages/i18n` repo này; `medviet` |
| FE | Storybook, Design System | CV Dcorp Internal UI System; `apps/storybook`; `medviet/apps/storybook` |
| FE | React Router framework mode, Rsbuild, Vite, Turbopack | `_template_reactrouter`; `chat-socket-fe`/`fe-motel-rsbuild` (Rsbuild 2) |
| FE | Angular 21 + NgRx Signals | `spring-boot-microservices/ecommerce-webapp` (chỉ demo, không có trong CV) |
| FE | WebSocket/STOMP client, virtualised lists | `chat-socket-fe` (`@stomp/stompjs`, react-virtuoso) |
| FE | 3D embed (Shapespark), analytics (CleverTap), gamification | CV Arobid |
| **Mobile** | React Native, Expo, expo-router, NativeWind, Reanimated | CV Arobid Mobile (S1/S3/S4/S6); `emr-mobile` (40 commit); fork `react-native-reusables` |
| **BE** | Java, Spring Boot 3/4, Spring Data JPA, Spring Security/JWT, Spring WebSocket, Flyway, MapStruct | CV FPT IS/Wisdom; `chat-socket-be`, `be-motel`, `spring-boot-microservices` |
| BE | Microservices: Spring Cloud Gateway, RabbitMQ, resilience4j, transactional outbox, Testcontainers, Keycloak | `spring-boot-microservices` README + 5 workflow |
| BE | Node.js / Express.js, NestJS + Prisma | CV skills; S7/S8 Wisdom (Express); `be-nest` (skeleton), `discord-bot` |
| BE | PayloadCMS + MongoDB | CV Arobid CMS; S14 badge |
| BE | **.NET 8 / C#, EF Core, MediatR** | **chỉ** `his-server` (21 commit) — không có trong CV nào |
| BE | Go | chỉ `chat/implementation_plan.md` (kế hoạch rewrite, **chưa có code**) — không nên ghi là skill |
| **Data** | PostgreSQL, MongoDB, Redis, SQL Server | CV; `chat-socket-be` (Redis presence), `his-server` (SqlServer + Npgsql) |
| **DevOps** | Docker, Docker Compose, nginx runner, multi-stage Dockerfile | CV "Tools: Docker"; Dockerfile trong `monorepo` (mọi app), `chat-socket-be`, `spring-boot-microservices` (Taskfile + buildpacks) |
| DevOps | GitHub Actions CI/CD, Vercel, Render, npm trusted publishing + Changesets | `monorepo` (`ci.yml`, `release.yml`), `chat-socket-fe`/`fe-motel-rsbuild` (`ci.yml`+`cd.yml`), `spring-boot-microservices` (5 workflow push Docker Hub), `discord-bot` (render.yaml) |
| DevOps | GitOps (Jenkins, Argo CD, K8s) | `devops-local/*.md` — **đang học**, chưa có code |
| **Tooling** | Bun, Turborepo, Biome, TS 7, Vitest, Playwright, Storybook, Taskfile, Maven, Spotless | `monorepo`, `medviet`, các repo Java |
| Tooling | AI-assisted workflow (`.agents/` rules, skills, MCP, GitNexus) | `monorepo` CLAUDE.md; `medviet` `.agents/`; S22 bullet "Utilized AI tools in the development workflow" |
| Design | Figma → UI | mọi CV ("pixel-perfect from Figma"); S7/S8 "Designed UI/UX flows in Figma" |
| Khác | Lexorank ordering, cursor pagination, JWT + refresh token | CV Arobid; S5 Personal Project; `chat-socket-be` README |

Skill trong `SKILLS` của portfolio hiện tại (19 mục, flat): JavaScript, TypeScript, React.js, Next.js, Zustand, Redux, TanStack Query, Spring Boot, Node.js, Express.js, PostgreSQL, MongoDB, Git, Figma, Docker, SSR, ISR, Monorepo, Microservices. **Thiếu so với brief:** React Native/Expo, .NET/C#, Tailwind, shadcn, Storybook, CI/CD, Turborepo, i18n, Testing.

---

## §7. Dự án cá nhân

### 7.1 Bảng đầy đủ 13 repo GitHub (`gh api`, 2026-09-06)

| Repo (URL) | Fork? | Mô tả / README | Stack (languages + manifest) | Stars | Created → last push | Commits | README | CI | Docker | Demo (liveness) |
|---|---|---|---|---|---|---|---|---|---|---|
| [monorepo](https://github.com/qtuan02/monorepo) | — | (description trống) README "Personal Monorepo" | TS 1.42 MB, Dockerfile 33 KB; Bun + Turborepo, 3 Runtime template, 8 package, 2 gói npm `@fe-monorepo/{ui,hook}` | 0 | 2025-08-05 → **2026-09-06** | ~301 | ✓ (+ CLAUDE.md, 7 ADR, docs/research) | ✓ `ci.yml` (4 job Gate + e2e/docker/changeset/publish-smoke), `release.yml` | ✓ mọi app | https://portfolio-ui-2025.vercel.app **200** |
| [chat-socket-fe](https://github.com/qtuan02/chat-socket-fe) | — | "Real-time chat web app… React 19, TypeScript, WebSocket (STOMP). Messenger-style UI" | TS 365 KB; React 19, TS 6, Rsbuild 2, RR v7, Tailwind v4, shadcn, TanStack Query v5, Zustand v5, `@stomp/stompjs`, axios, RHF+Zod, react-virtuoso, Sonner, Biome | 0 | 2026-05-14 → 2026-06-18 | 62 (local 60) | ✓ | ✓ `ci.yml`, `cd.yml` | — (Vercel) | https://chat-socket-fe.vercel.app **200** |
| [chat-socket-be](https://github.com/qtuan02/chat-socket-be) | — | README 136 KB tiếng Việt, mô tả theo từng file | Java 183 KB; Java 25, Spring Boot 4.0.6, Spring Security + jjwt, JPA, PostgreSQL, Flyway V1–V7, Redis (online registry), WebSocket/STOMP, MapStruct, UUIDv7, Spotless/Palantir | 0 | 2026-05-13 → 2026-06-18 | 26 (local 16) | ✓ | — | ✓ Dockerfile (temurin 25, `PORT` default 10000 — kiểu Render) + `deployment/docker-compose/infra.yml` | (BE — không có URL public trong nguồn) |
| [gitlab-bot-for-lark](https://github.com/qtuan02/gitlab-bot-for-lark) | — | "A Next.js application that receives GitLab webhooks and forwards formatted notifications to Lark" | TS 16 KB; Next.js 14, axios | 0 | 2026-05-26 → 2026-06-01 | 3 | ✓ | — | — (Vercel) | https://gitlab-bot-for-lark.vercel.app **200**, `/api/health` 200 |
| [be-motel](https://github.com/qtuan02/be-motel) | — | "Motel Management System Backend… Maven multi-module" | Java 27 KB; Java 25, Spring Boot 4.0.6, WebMVC, JPA, PostgreSQL, Flyway, MapStruct, Taskfile; module `shared`, `user-service` (local thêm `property-service`) | 0 | 2026-05-05 → 2026-05-09 | 7 (local 5) | ✓ (+ `document/structure.md`) | — | ✓ docker-compose (PostgreSQL) | — |
| [fe-motel-rsbuild](https://github.com/qtuan02/fe-motel-rsbuild) (local remote cũ `project-rsbuild`) | — | "Frontend cho hệ thống quản lý vận hành nhà trọ/tòa nhà cho thuê" | TS 668 KB; React 19, Rsbuild, RR 7, TanStack Query/Table, dnd-kit, Radix/shadcn, recharts, nuqs, Storybook, ESLint + Biome | 0 | 2026-04-20 → 2026-05-09 | 42 (local 63) | ✓ + `docs/{architect,ci-cd,high-level-design,list-features}.md` | ✓ `ci.yml`, `cd.yml` | — (Vercel) | https://motel-management-portal.vercel.app **200** |
| [spring-boot-microservices](https://github.com/qtuan02/spring-boot-microservices) | — | "Hệ thống E-Commerce demo với kiến trúc Microservices + Monorepo" | Java 153 KB + TS 46 KB; Java 21, Spring Boot 3.5.9, 5 service (catalog/inventory/order/notification/api-gateway), RabbitMQ, Spring Cloud Gateway, resilience4j, outbox, Flyway, Testcontainers, ShedLock, Keycloak realm; webapp **Angular 21 + NgRx Signals + keycloak-js** | 0 | 2026-01-12 → 2026-03-15 | 22 | ✓ + `docs/1..9.md` | ✓ 5 workflow (mỗi service: `mvnw verify` + push Docker Hub) | ✓ Taskfile `spring-boot:build-image`, compose `infra.yml`/`apps.yml` | — |
| [be-nest](https://github.com/qtuan02/be-nest) | — | "NestJS Backend Structure" | TS 52 KB; NestJS + Prisma, docker-compose Mongo/Redis/RabbitMQ | 0 | 2025-12-05 → 2025-12-05 | **1** ("feat: init") | ✓ | — | ✓ compose | — (skeleton) |
| [discord-bot](https://github.com/qtuan02/discord-bot) | — | "Standalone Discord bot… Integrates with Assistant AI API" | TS 19 KB; discord.js 14, dotenv, zod; `render.yaml` | 0 | 2025-12-01 → 2025-12-01 | 5 | ✓ | — | — | https://discord-bot-pfuo.onrender.com **không phản hồi** |
| [react-native-reusables](https://github.com/qtuan02/react-native-reusables) | fork | (upstream push 2024-09) | — | 0 | 2026-07-05 | — | — | — | — | — |
| [social-app](https://github.com/qtuan02/social-app) | fork | Bluesky app | — | 0 | 2026-06-10 | — | — | — | — | — |
| [create-t3-turbo](https://github.com/qtuan02/create-t3-turbo) | fork | T3 + Expo starter | — | 0 | 2025-11-12 | — | — | — | — | — |
| [BRIDGE-API](https://github.com/qtuan02/BRIDGE-API) | fork | default branch `dev` | — | 0 | 2025-10-12 | — | — | — | — | — |

Ngoài bảng: `qtuan02/qtuan02` (profile README) — có clone local (S14) nhưng API trả 404 → **không public**. Portfolio cũ (S22) còn gắn `apps/assistant-ai` (demo `chat-assistant-ai-tuan.vercel.app`) và `apps/documents` (`documents-ui.vercel.app`) — `assistant-ai` đã bị xoá khi rebuild (commit `2f505b0` 2026-09-04), `documents` vẫn còn trong repo; hai URL **chưa kiểm tra**.

### 7.2 Đối chiếu thư mục local `D:\Personal`

| Local | Ứng với GitHub | Khớp? | Có thêm gì ở local |
|---|---|---|---|
| `chat/chat-socket` | `chat-socket-be` | ✓ remote đúng; local 16 commit < GitHub 26 (thiếu merge/PR) | `chat-socket.rar` 72 MB (backup), `implementation_plan.md` 2026-05-31: kế hoạch **rewrite sang Go** (chi + gorilla/websocket + MongoDB + Redis, 5 ngày) — **không có thư mục Go nào** → chưa thực hiện |
| `chat/chat-socket-fe` | `chat-socket-fe` | ✓ | `.gitnexus`, `AGENTS.md`/`CLAUDE.md`, `agent/` |
| `project/backend` | `be-motel` | ✓ | thêm module `property-service` (chưa có trong README) |
| `project/frontend` | `fe-motel-rsbuild` (remote local vẫn tên cũ `project-rsbuild`) | ✓ (redirect) | 63 commit local vs 42 trên GitHub (squash PR "Dev (#22)…"); `SmartRental_Design_v2_Final.docx` + `Thiết Kế Phần Mềm Quản Lý Phòng Trọ v1.md` (tài liệu thiết kế nghiệp vụ: entity Building/Room/Tenant/Contract/UtilityIndex/Invoice/Service, giá điện bậc thang EVN, OCR CCCD, QR thanh toán) |
| `qtuan02` | `qtuan02/qtuan02` | remote đúng nhưng GitHub 404 | — |
| `spring-boot-microservices` | ✓ | ✓; local đang ở nhánh `dev`, remote chỉ có `main` | `.idea`, `target` |
| `discord-bot` | ✓ | ✓ | `.env` (không đọc nội dung) |
| `devops-local` | — | không git | 2 file md học GitOps (2026-09-05), compose rỗng |
| `monorepo` | ✓ (repo này) | ✓ | — |
| `demon.zip` | — | — | CV LaTeX của người khác (§10) |

### 7.3 Shortlist gắn portfolio (DRAFT — đề xuất, chủ repo chọn)

Tiêu chí: có README thật, có CI hoặc Docker, có demo sống hoặc là hệ thống chạy được, còn được cập nhật, và **kể được một câu chuyện kỹ thuật** khác nhau.

1. **Personal Monorepo** — https://github.com/qtuan02/monorepo · demo https://portfolio-ui-2025.vercel.app
   *Lý do:* repo lớn nhất (~301 commit, push hôm nay), CI 4 job + 4 job phụ, Dockerfile cho mọi app, 2 gói publish npm qua trusted publishing, 7 ADR, quy ước cho AI agent. Là chính cái portfolio đang xem.
   - DRAFT: Bun + Turborepo workspace with three app Runtimes (Vite SPA, Next.js 16 App Router, React Router 8 framework mode) cloned from Template apps by a generator, sharing eight source-only packages.
   - DRAFT: One four-command Gate (Biome, TS 7, Vitest 5, build) mirrored 1:1 in GitHub Actions; Playwright E2E and Docker builds discovered by glob, never listed.
   - DRAFT: Publishes `@fe-monorepo/ui` (63 shadcn/Base UI primitives) and `@fe-monorepo/hook` to npm through Changesets + OIDC trusted publishing, with a tarball smoke test before release.
2. **Real-time Chat (STOMP)** — FE https://github.com/qtuan02/chat-socket-fe (demo https://chat-socket-fe.vercel.app) · BE https://github.com/qtuan02/chat-socket-be
   *Lý do:* full-stack, demo sống, FE có CI/CD, BE có Dockerfile + Flyway + README chi tiết; **đã có sẵn trong CV S5** mục Personal Project.
   - DRAFT (từ S5 + README): JWT access token + refresh-token session (HttpOnly cookie) on Spring Security; STOMP over WebSocket for messages, seen-state and online presence backed by Redis.
   - DRAFT: Cursor-paginated, virtualised message history (react-virtuoso) on a React 19 + Rsbuild + TanStack Query client; friend graph, direct and group conversations with roles.
   - DRAFT: PostgreSQL schema versioned with Flyway (V1–V7), UUIDv7 ids, MapStruct mapping, Spotless-formatted Java 25 / Spring Boot 4.
3. **SmartRental — Motel management portal** — FE https://github.com/qtuan02/fe-motel-rsbuild (demo https://motel-management-portal.vercel.app) · BE https://github.com/qtuan02/be-motel
   *Lý do:* demo sống, CI/CD, có tài liệu thiết kế nghiệp vụ + `docs/` 4 file; domain rõ (buildings, rooms grid, tenants, contracts gia hạn/thanh lý, invoices hàng loạt + QR, utilities bậc thang, supplier bills, expenses, compliance, reporting). BE mới có `user-service` — nên ghi rõ "frontend-first".
   - DRAFT: React 19 + Rsbuild + React Router 7 portal for rental operations: KPI dashboard (recharts), floor-grid room map, contract lifecycle (create → renew → terminate), batch invoicing with QR payment flow, utility-index entry per period.
   - DRAFT: TanStack Query/Table, dnd-kit ordering, nuqs URL state, shadcn/Radix; Storybook for shared components; CI + manual production deploy to Vercel via GitHub Actions.
   - DRAFT: Spring Boot 4 multi-module backend scaffold (shared base entity/controller/pagination, UUIDv7, Flyway) — user-service live, property-service in progress.
4. **Spring Boot Microservices (E-commerce)** — https://github.com/qtuan02/spring-boot-microservices
   *Lý do:* thể hiện BE/architecture: 5 service, RabbitMQ, gateway, circuit breaker, outbox, Testcontainers, 5 pipeline build + push Docker Hub, 9 file docs. Không có demo sống (bình thường với microservices).
   - DRAFT: Five Spring Boot 3.5 services behind Spring Cloud Gateway, each with its own PostgreSQL and Flyway; Order → Notification via RabbitMQ with a transactional outbox.
   - DRAFT: resilience4j circuit-breaker/retry on sync calls, ShedLock-scheduled jobs, Testcontainers integration tests; per-service GitHub Actions building Buildpack images to Docker Hub; Keycloak realm for auth and an Angular 21 + NgRx Signals storefront.
5. **GitLab → Lark webhook bot** — https://github.com/qtuan02/gitlab-bot-for-lark (demo https://gitlab-bot-for-lark.vercel.app)
   *Lý do:* nhỏ nhưng deploy thật, giải quyết nhu cầu team (push/MR/issue/note/pipeline → Lark card), Next.js route handlers. Phù hợp làm card "tooling".
   - DRAFT: Next.js 14 serverless receiver that validates GitLab webhook events and renders them as Lark interactive cards (push, MR, issue, note, pipeline), with signed Lark requests and a health endpoint.

Không nên gắn: `be-nest` (1 commit skeleton), `discord-bot` (demo chết, 5 commit), 4 fork. `devops-local` là ghi chú học, chưa có sản phẩm.

---

## §8. Schema portfolio hiện tại (`apps/portfolio`) — chỗ để điền dữ liệu mới

### 8.1 Cấu trúc (S21)

- Runtime **Next 16 App Router**, clone từ `_template_next`; route `src/app/[locale]/(shell)/page.tsx` một dòng `<HomeTemplate />`; `proxy.ts` chỉ `negotiateLocale`; không TanStack Query, không store, không `"use cache"` (README app).
- **Template** `features/home/templates/home.template.tsx` xếp **7 section** theo thứ tự: `HeroSection` → `AboutSection` → `WorkSection` → `EducationSection` → `SkillsSection` → (`ContactSection` + `HobbiesSection` cạnh nhau, `flex gap-6`). Mỗi section nhận `delay` (stagger `SECTION_DELAY = 0.08` × hệ số). Section là Server Component; `BlurFade`/`BlurFadeText`/`Lens`/`ResumeCard` là client island.
- **Types** `features/home/types/resume.ts`:
  - `WorkItem { id; company; logo: StaticImageData; techStack: readonly string[]; bulletKeys: readonly string[] }` — `id` cũng là key segment `portfolio.work.items.<id>.{role,period,bullets.<key>}`.
  - `EducationItem { id; school; href; logo }` → `portfolio.education.items.<id>.{degree,period}`.
  - `ContactItem { id; icon: IconComponent; href? }` → `portfolio.contact.items.<id>`.
  - `HobbyItem { id; icon }` → `portfolio.hobbies.items.<id>`.
- **Constants** `features/home/constants/resume.ts`: `WORK_ITEMS` = `fptis` (6 bullet) · `arobid` (6) · `dcorp` (5) · `wisdom` (3); `EDUCATION_ITEMS` = `stu`; `SKILLS` (19 string, không dịch); `CONTACT_ITEMS` = birthday, phone (`tel:`), location, github, email (`mailto:`); `HOBBY_ITEMS` = sport, reading, travel, music, movies.
- **Assets**: `src/assets/avatar.jpg`; `src/assets/logos/{arobid.png, dcorp.png, fptis.jpg, stu.png, wisdom.jpg}`; `public/{favicon.ico, og-image.jpg}`.
- **Messages** `packages/i18n/src/locales/{vi,en}.json` → `portfolio.*`: `meta.{title,description}`, `hero.{greeting,subtitle,avatarAlt,zoomLabel}`, `about.{title,experience,mindset}`, `work.{title,techStack,toggle,items.<id>.{role,period,bullets.*}}`, `education.{title,items.stu.{degree,period}}`, `skills.title`, `contact.{title,items.*}`, `hobbies.{title,items.*}`, `navbar.{home,linkedin,github,theme}`. `period` là chuỗi viết tay từng locale ("02/2026 – Hiện tại" / "Feb 2026 – Present").
- **Layout slice**: dock `NAVBAR_ITEMS` = home, linkedin (`https://www.linkedin.com/in/tuan-huynh-916b792b7`), github; theme toggle.
- **Ràng buộc bởi test**: `test/features/home/constants/resume.test.ts` — mọi id trong constants phải có đủ message ở **cả hai** locale; id unique; contact chỉ có `href` khi thực sự dẫn đi (phone/github/email). E2E `server-rendering.e2e.ts` assert HTML thô có một **bullet công việc** → phần Work phải render server-side.
- **ResumeCard** (`components/resume-card.tsx`): logo 48px tròn, tiêu đề + period (tabular-nums), subtitle (role), body accordion (bullets `<ul>` + "Tech Stack: …"), `defaultExpanded` ở Work; Education dùng cùng card nhưng `href` thay body.

### 8.2 Metadata / SEO đang có

`layout.tsx`: `metadataBase = NEXT_PUBLIC_PORTFOLIO_BASE_DOMAIN`, title template `%s · Huỳnh Quốc Tuấn`, OG + Twitter card `/og-image.jpg` 1200×630, `robots noindex` khi `APP_ENV=local`; `manifest.ts`, `robots.ts`, `sitemap.ts` (alternates vi/en). i18n `as-needed`: `/` = vi, `/en`.

### 8.3 Cái portfolio cũ có mà bản hiện tại đã bỏ (S22, commit `eb12b35`)

- Section **"Public Projects"** với `ProjectCard` (commit `ece66d9`): field `title, description, techStack[], image, github, demo, type: "Personal" | "Company"`; 6 card: Assistant AI & MCP tools, Document UI, TradeXpo, Careers Platform, FAQs Platform, CMS & Management Platform; ảnh `public/projects/*.jpg`.
- Skills cũ có thêm Java, Tailwind CSS, Responsive.
- Không có section riêng cho chứng chỉ/giải thưởng — giải VDA nằm trong bullet Arobid.

### 8.4 Cần thêm/bớt để chứa dữ liệu mới (DRAFT — cho bước design quyết)

| Việc | Chạm file | Ghi chú |
|---|---|---|
| Thêm `WorkItem` `medviet` (+ `src/assets/logos/medviet.*`), quyết `fptis` giữ/xoá/gộp | `constants/resume.ts`, `vi.json`, `en.json`, assets | Logo Medviet **chưa có** trong repo; cần chủ repo cung cấp. Test sẽ đỏ nếu thiếu message ở một locale |
| Thêm lại `ProjectItem` + `PROJECT_ITEMS` + `ProjectsSection` + `portfolio.projects.*` | `types/resume.ts`, `constants/`, `components/projects-section.tsx` (+ card), `home.template.tsx`, i18n, `src/assets/projects/*` (import, không `public/`) | Theo rule `quality-imports` ảnh phải import. Card cũ có `type` Personal/Company — nên giữ để tách 5 repo cá nhân với 4 link Arobid |
| Nhóm `SKILLS` theo FE / Mobile / BE / DevOps / Tooling (thay flat list) | `constants/resume.ts`, `skills-section.tsx`, `test` (nếu đổi shape) | Tên skill vẫn không dịch; chỉ nhãn nhóm cần i18n |
| Thêm `linkedin` vào `CONTACT_ITEMS` | `constants/resume.ts`, i18n | Test `withHref` đang khoá danh sách `["phone","github","email"]` → phải sửa test |
| Sửa `about.experience`, `meta.description`, `hero.subtitle` theo timeline TARGET đã chốt và định vị mới (FE-lead full-stack: web + mobile + BE) | i18n | Cả vi lẫn en |
| Cân nhắc section **Awards** hoặc badge trong Arobid card | tuỳ design | Chỉ một giải, có thể không cần section riêng |
| `period` string cho `medviet`: "03/2026 – Hiện tại" / "Mar 2026 – Present" (TARGET) | i18n | Chờ §9 |
| `og-image.jpg` mới nếu đổi định vị | `public/` | — |

---

## §9. Câu hỏi mở cho chủ repo (phải chốt trước khi design)

1. **FPT IS vs Medviet:** FPT IS trong 6 bản CV là gì? (i) job thật Jan/Feb 2026 rồi chuyển Medviet 3/2026; (ii) Medviet làm thầu phụ/đối tác cho FPT IS trên "Quang Ninh Healthcare System"; (iii) tên "bùa". Portfolio in tên nào, in cả hai không?
2. **Tên & chức danh Medviet:** viết "Medviet", "MedViet" hay "DHSC"? Chức danh (Software Engineer? Full-stack? Frontend Lead?). Có cần ẩn tên bệnh viện/tỉnh, mã màn hình (IAMF…, M02F…) không?
3. **Ngày vào Medviet:** 3/2026 (brief) hay 5/2026 (git)? Nếu 3/2026, có việc gì trước 22/05 để kể (onboarding, repo khác) không?
4. **Dcorp:** chọn mốc nào trong 5 mốc (§4.2)? Có part-time không? Kết thúc Feb/Mar/May 2025?
5. **Arobid:** vào Feb/Mar/May 2025, ra Jan/Feb 2026? Chức danh Frontend Developer hay Software Engineer? Có giữ mục Mobile App (React Native) không — nó chỉ xuất hiện ở 4/8 bản?
6. **Wisdom Robotics:** giữ không? Nếu giữ: Mar–Sep 2023 SE (S2) hay bản khác; BE là Spring Boot hay Express.js? Có kể "University internship — Dental Booking (Laravel)" (chỉ S7) không?
7. **Phương án timeline TARGET** A/B/C ở §4.3 — chọn một; agent không tự chọn.
8. **Tên dự án được phép nêu công khai:** "Highlands Coffee (via VTI)", "Social Protection System (Government)", "Quang Ninh Healthcare System", tên bệnh viện trong EMR — cái nào được in, cái nào phải nói chung chung?
9. **Link demo:** 4 link Arobid (`arobid.com/tradexpo`, `/careers`, `/help`, `/tradexpo/vi/news`) còn đúng không? `documents-ui.vercel.app` và `chat-assistant-ai-tuan.vercel.app` còn sống không, có gắn không? `discord-bot` bỏ?
10. **Chat BE demo:** S5 ghi "Live Demo" — URL BE/Render là gì (README không có)? Có giữ chữ "Live Demo" nếu BE Render ngủ?
11. **Ảnh:** dùng `hinh-the.jpg` (ảnh thẻ, dọc 354×421) hay `avatar.jpg` hiện tại cho hero/OG? Có in ảnh lên bản PDF không (chỉ S6 làm vậy)?
12. **Skills muốn nhấn:** có ghi .NET/C# (chỉ có 21 commit, không trong CV nào) không? Angular (chỉ demo)? Go (chỉ kế hoạch — đề nghị **không**)?
13. **Định vị tiêu đề:** "Frontend Developer" (7 bản) hay "Software Engineer" (S4, S5) hay "Full-stack" (brief mô tả cả 3 mảng ở Medviet)?
14. **Ngôn ngữ:** English (Basic) có in không; có TOEIC/chứng chỉ nào không (nguồn: không)?
15. **Repo profile `qtuan02/qtuan02`** đang private/xoá — có muốn public lại và đồng bộ với portfolio mới không?

---

## §10. Tham chiếu bố cục từ hồ sơ người khác (chỉ bố cục, không dữ liệu)

| Nguồn | Bố cục | Cách viết bullet đáng học | Không nên bắt chước |
|---|---|---|---|
| S9 `khác/HAO_PHAM_2025.pdf` (2 tr.) | Một cột; header tên + phone/email/LinkedIn; SUMMARY 3 dòng; WORK EXPERIENCE: `Công ty - Chức danh` trái, `MM/YYYY - MM/YYYY` phải, một dòng tên dự án, bullet, bullet cuối "Technologies used:"; EDUCATION; SKILLS (English / Programming / Teamwork) | Mỗi bullet mở bằng động từ mạnh + **định lượng khi có** ("team of 14", "6 members"); mỗi bullet là một quyết định kỹ thuật (micro-frontend, ISR, PayloadCMS, Shapespark…) — cùng "giọng" với CV chủ repo (cùng công ty Arobid nên bố cục gần như đồng nhất) | Bullet "culture/mindset" mơ hồ |
| S10 `khác/nguyen_duy_khuong_cv.pdf` (5 tr., template vieclam24h) | Hai cột: cột trái timeline công ty với block `Position / Team size / Technical used`; cột phải ảnh tròn, thông tin cá nhân, OBJECTIVE, LANGUAGES sao, SOFTWARE sao | Ghi rõ **Team size** và **Position** từng dự án — cách nói vai trò không cần bịa số | Sao xếp hạng skill, 5 trang, lặp nội dung, ít ATS-friendly; CV chủ repo không nên theo |
| S20 `demon.zip/demon/CV.tex` (LaTeX, Jake's Resume / Charles Rambo) | `\section` small-caps + `\titlerule`, `\CVSubheading{cty}{ngày}{vai trò}{nơi}`, `\CVItem` bullets; có mục **Projects** tách khỏi Work; có `\pdfgentounicode=1` cho ATS | Tách **Projects** thành section riêng với `Tên - Vai trò | thời gian | tổ chức`; bullet công nghệ cuối mỗi mục | Nội dung là của người khác — chỉ dùng cấu trúc `.tex` (8 bản PDF của chủ repo nhìn cùng họ template này: small-caps heading, rule, "Technologies used" cuối) |

---

## §11. Nguồn (đầy đủ)

**Local — hồ sơ**
- `D:\hồ sơ\Resume_Huynh_Quoc_Tuan.pdf` (tr.1–2)
- `D:\hồ sơ\FE\CV_Frontend_Huynh_Quoc_Tuan.pdf` (tr.1–2)
- `D:\hồ sơ\FE\Resume_Huynh_Quoc_Tuan.pdf` (tr.1–2)
- `D:\hồ sơ\software\CV_Huynh_Quoc_Tuan.pdf` (tr.1–2)
- `D:\hồ sơ\software\Resume_Huynh_Quoc_Tuan.pdf` (tr.1–2)
- `D:\hồ sơ\bịp\Resume_Huynh_Quoc_Tuan.pdf` (tr.1–2)
- `D:\hồ sơ\bịp\3\CV_HuynhQuocTuan_FE_1.pdf` (tr.1–2)
- `D:\hồ sơ\bịp\4\CV_HuynhQuocTuan_FE.pdf` (tr.1–2)
- `D:\hồ sơ\khác\HAO_PHAM_2025.pdf` (tr.1–2, bố cục) · `D:\hồ sơ\khác\nguyen_duy_khuong_cv.pdf` (tr.1–5, bố cục)
- `D:\hồ sơ\hinh-the.jpg` (`file` + parse SOF)

**Local — code**
- `D:\Personal\chat\{chat-socket, chat-socket-fe}` (git log/remote, README, pom.xml, package.json, Dockerfile, deployment/), `chat\implementation_plan.md`
- `D:\Personal\project\{backend, frontend}` (git, README, pom.xml, package.json, docs/list-features.md, .github/workflows), `project\Thiết Kế Phần Mềm Quản Lý Phòng Trọ v1.md`, `SmartRental_Design_v2_Final.docx` (chỉ ghi nhận tên)
- `D:\Personal\spring-boot-microservices` (git, README, pom.xml, Taskfile.yml, .github/workflows/*.yml, deployment/, ecommerce-webapp/package.json)
- `D:\Personal\discord-bot` (git, README, package.json, render.yaml)
- `D:\Personal\qtuan02\README.md` (git log)
- `D:\Personal\devops-local\*.md`
- `D:\Personal\demon.zip` (`unzip -l`, `unzip -p demon/CV.tex`)
- `E:\MedViet\frontend\{medviet, web-emr, emr-mobile, medviet-mobile, cms, DHSC-Web, medviet-dcf-builder}`, `E:\MedViet\backend\his-server` (`*.csproj`, README), `E:\MedViet\devops\emr-dh-testing-rollout`, `E:\MedViet\gitlab-bot` — `git remote -v`, `git log --author=tuanhq`, `package.json`, README

**Repo này**
- `apps/portfolio/README.md`; `apps/portfolio/src/features/home/{constants/resume.ts, types/resume.ts, templates/home.template.tsx, components/*.tsx}`; `apps/portfolio/src/features/layout/constants/navbar.ts`; `apps/portfolio/src/app/[locale]/layout.tsx`; `apps/portfolio/test/features/home/constants/resume.test.ts`; `apps/portfolio/src/assets/**`, `public/**`
- `packages/i18n/src/locales/{vi,en}.json` → `portfolio`
- `git log -- apps/portfolio`; `git show eb12b35:apps/portfolio/src/constants/data.ts`; `git ls-tree eb12b35`
- `docs/research/personal-monorepo-rebuild.md` (bối cảnh legacy apps, reference `E:\MedViet\frontend\medviet`)

**Mạng**
- `gh api users/qtuan02`; `gh api "users/qtuan02/repos?per_page=100&sort=updated"`; với mỗi repo: `repos/qtuan02/<r>`, `/languages`, `/contents`, `/contents/.github/workflows`, `/commits?per_page=…`, `/readme` (base64 → text); `repos/qtuan02/project-rsbuild` (redirect → `fe-motel-rsbuild`); `repos/qtuan02/qtuan02` (404)
- `curl -sIL` : https://portfolio-ui-2025.vercel.app · https://chat-socket-fe.vercel.app · https://motel-management-portal.vercel.app · https://gitlab-bot-for-lark.vercel.app (+ `/api/health`) · https://discord-bot-pfuo.onrender.com · https://stu.edu.vn
- [VietTimes — "Vietnam Digital Awards 2025: Vinh danh 49 tổ chức, giải pháp và 3 cá nhân" (08/10/2025)](https://viettimes.vn/vietnam-digital-awards-2025-vinh-danh-49-to-chuc-giai-phap-va-3-ca-nhan-post190236.html)
- [Tuổi Trẻ — "Chủ tịch Arobid: Doanh nghiệp Việt hoàn toàn có thể tự chủ công nghệ…"](https://tuoitre.vn/khoahocphothong/chu-tich-arobid-doanh-nghiep-viet-hoan-toan-co-the-tu-chu-cong-nghe-va-mo-rong-thi-truong-ben-vung-104262107.htm) (kết quả search, chỉ dùng để định vị; chưa fetch)
- https://tradexpo.arobid.com/vi — **403**, không đọc được
