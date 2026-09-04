---
status: done
---

# 04 — Tài liệu và rule khớp ADR-0004

**What to build:** Một agent (hoặc người) mở CLAUDE.md, README, `.agents/commands.md`, `.agents/knowledge-base.md`, `legacy/README.md` và hai rule liên quan không còn thấy câu nào mâu thuẫn với cây: `packages/` giờ có hai Publish shell, `ui`/`hook` có task `build` chỉ để nạp shell, app trong repo vẫn import source, bề mặt publish subpath-only, consumer cần `@source`, và có ba lệnh mới (`changeset`, `publish:smoke`, `release`).

**Blocked by:** 03 — mọi lệnh và workflow được mô tả đã tồn tại.

**Status:** done

## Acceptance criteria

- [x] CLAUDE.md §1: mục `packages/` sửa câu "ALL private, source-only, no build step" thành mô tả đúng (private + source-only với app trong repo; `ui` và `hook` có `build` đổ vào Publish shell theo ADR-0004); thêm hai dòng `ui-public/`, `hook-public/` với vai trò shell; ghi vai trò thật của `tooling/typescript/compiled-package.json` (preset `jsx: preserve`, `noEmit`, không phải config build).
- [x] CLAUDE.md §3: thêm dòng "Đổi bề mặt publish của ui/hook → sửa shell + thêm changeset"; §6: thêm `changeset`, `publish:smoke`, `release` (ghi rõ `release` chỉ chạy trên CI); §7b/§9 không đổi.
- [x] `.agents/commands.md`: ba lệnh mới với ràng buộc (Windows: script smoke dùng thư mục tạm của hệ điều hành, không `/tmp`).
- [x] `README.md` root: mục packages/publish cập nhật; `legacy/README.md`: hai dòng `ui-public`/`hook-public` và dòng `.changeset/` trỏ ADR-0004 và nói rõ thư mục legacy này sẽ xoá ở ticket dọn của topic `legacy-migrate`.
- [x] `.agents/knowledge-base.md`: mục mới về publish (shell, inline hook, `@source`, trusted publishing, vì sao không `bun publish`).
- [x] Rule `quality-avoid-barrel-imports`: một đoạn ngắn nói `dist/` của shell không phải barrel và bề mặt publish vẫn subpath-only; rule `architecture-ui-primitives`: ghi chú CSS entry và `@source` cho consumer ngoài. Rule vẫn tiếng Anh, ~vài dòng, có ví dụ import thật.
- [x] `.agents/README.md` index không cần dòng mới (không có rule mới); xác nhận.
- [x] `docs/research/legacy-unfreeze-and-npm-publish.md` không sửa (là snapshot); `CONTEXT.md` giữ định nghĩa **Publish shell**, cập nhật nếu ticket 01–03 làm nó lệch.
- [x] `bun run check` xanh (Biome format markdown không áp nhưng không được có lỗi mới); `bun run typecheck` xanh vì không đụng code.

## Notes

Làm ngày 2026-09-04, bằng một Workflow: bốn agent sửa bốn nhóm file rời nhau (không
đụng độ ghi), rồi hai agent đối chiếu — một soi từng acceptance criterion, một quét
mâu thuẫn trên toàn cây kể cả file không ai được giao.

Gate xanh trên cây làm việc (đã gồm cả `apps/portfolio` + `apps/documents` đang được
topic `legacy-migrate` migrate song song, cả hai đều xanh):

```
bun run check      → Checked 494 files in 58s. No fixes applied.
bun run typecheck  → Tasks: 16 successful, 16 total   (0 warning)
bun run test       → Tasks: 12 successful, 12 total
bun run build      → Tasks:  7 successful,  7 total
```

**Biome không lint Markdown ở repo này** — `bunx biome check CLAUDE.md` báo "No files
were processed". Nên tiêu chí "check xanh" không thật sự bắt được lỗi format trong
`.md`; căn cột cây thư mục và bảng được kiểm bằng tay (`sed -n '75,90p' CLAUDE.md`).

## Bốn chỗ mâu thuẫn ADR-0004 nằm NGOÀI danh sách file của ticket

Agent quét toàn cây tìm được, đã sửa luôn:

- `.agents/rules/_sections.md:34` — mô tả cluster `quality` viết "every package is
  `private`, source-only … there is no `dist/`". Hai shell không `private` và có
  `dist/`. Đây là chỗ nguy hiểm nhất vì `_sections.md` là registry mà rule mới đọc theo.
- `CONTEXT-MAP.md:12` — vẫn ghi "tám package và hai tooling"; `packages/` nay có mười
  workspace. (Cố ý **không** đụng "ba app" ở dòng 11 — đó là việc của `legacy-migrate`.)
- `apps/_template_next/next.config.ts:19` — comment "no build step and no `dist/`" nằm
  trong **Template app**, tức là được clone vào mọi app sinh sau; bản sao nguyên văn đã
  có ở `apps/portfolio/next.config.ts:19`. Đã sửa bản Template; bản clone thuộc lane
  `legacy-migrate` và đã báo sang đó để đồng bộ.
- `packages/env/README.md:30` — trích sai lệnh thật (`dotenv -e ../../.env -- next dev`,
  trong khi `apps/_template_next/package.json` nay là `dotenv -e ./ports.env -e
  ../../.env -- next dev`). Drift của ticket port-hygiene chứ không phải ADR-0004.
  **File này thuộc lane `legacy-migrate`** — đã báo sang đó thay vì giữ im lặng.

## Hai chỗ cố ý bỏ số đếm thay vì cập nhật số

Số đếm trong tài liệu sẽ sai lại sau mỗi ticket migrate, nên thay vì sửa 3→5 thì bỏ
hẳn phép đếm:

- `.agents/commands.md` — "So `bun run build` is five tasks, not three" → "is every app
  plus those two packages, not the apps alone". (Cùng chỗ này còn trích sai
  `dependsOn: ["^build"]`, giá trị thật là `["^topo", "^build"]`.)
- `CLAUDE.md:84-85` — bỏ hai version pin `(1.0.2)` / `(1.0.0)` khỏi hai dòng shell.
  Version là của Changesets, và chính §3 của CLAUDE.md nói "never hand-edit … its
  `version`". Ticket 05 sau đó tìm ra `@fe-monorepo/ui@2.0.0` đã bị đốt, tức là con số
  ghi trong tài liệu còn dễ sai hơn dự đoán.

## Một warning Turbo được sửa nhân tiện (ngoài phạm vi ticket)

`bun run typecheck --force` phát `no output files found for task
@monorepo/ui#typecheck`. Không phải `outputs` khai sai: `base.json` trỏ **mọi** config
kế thừa nó vào cùng `${configDir}/.cache/tsbuildinfo.json`, nên `@monorepo/ui#typecheck`
(`src`+`test`+`scripts`, `noEmit: true`) và hai lượt dts của rslib
(`tsconfig.build.json` / `tsconfig.hook.json`, chỉ `src`, `noEmit: false`) cùng ghi đè
một file — đo được: typecheck ghi 600KB, `ui#build` ghi lại còn 297KB. Trong một lần
chạy đầy đủ hai task chạy song song (storybook `^build` kéo `@monorepo/ui#build` vào),
nên chúng vô hiệu cache của nhau. Không tái hiện khi `--filter @monorepo/ui` vì không
có gì chạy cùng.

Sửa: mỗi tsconfig build có `tsBuildInfoFile` riêng (`tsbuildinfo.build.json` /
`tsbuildinfo.hook.json`), kèm comment giải thích. Không đụng `turbo.json`. Đáng làm
độc lập với warning: hai compilation khác `include`/`noEmit` dùng chung một file
incremental còn có thể cho kết quả incremental sai.
