---
status: ready-for-agent
---

# 07 — Xoá toàn bộ `legacy/` và mọi chỗ nhắc nó; đánh dấu ADR-0001 hoàn tất

**What to build:** Repo không còn thư mục `legacy/`: bốn app đã về `apps/`, hai Publish shell đã sống trong `packages/`, `.changeset/` mới ở root, tài liệu còn giá trị đã nằm trong README từng app. Mọi câu nhắc `legacy/` trong config và tài liệu bị gỡ, glossary không còn mô tả một thư mục không tồn tại, ADR-0001 ghi ngày hoàn tất. Git history giữ nguyên.

**Blocked by:** 03, 04, 05, 06 — bốn app đã `done`; **`npm-publish` 03** — `.changeset/` mới và hai shell mới đã thay thế bản trong `legacy/`.

**Status:** ready-for-agent

## Acceptance criteria

- [ ] Đọc lại `legacy/README.md` lần cuối: mọi dòng đều ở trạng thái "đã migrate/đã thay thế"; nếu còn dòng nào chưa, dừng và báo thay vì xoá.
- [ ] `git rm -r legacy` (gồm `_template`, `storybook`, `docs`, `.changeset`, `ui-public`, `hook-public`, README); `legacy/.env` untracked nhắc người xoá tay hoặc giữ ngoài repo.
- [ ] Gỡ `!legacy` (và mọi pattern legacy) khỏi `biome.json`; dòng `legacy` khỏi `.gitignore`; `bun run check` vẫn xanh và không quét thừa.
- [ ] CLAUDE.md: mục `legacy/` trong §1, dòng "Bring a `legacy/` app back" trong §4, mọi nhắc ADR-0001 dưới dạng "hiện tại" chuyển thành quá khứ; `CONTEXT.md`: thuật ngữ **Legacy app** xoá (ADR-0001 kể chuyện) hoặc chuyển thành ghi chú lịch sử một dòng — chọn và ghi vào Notes; `CONTEXT-MAP.md` gỡ đoạn "legacy/ không phải context"; `docs/agents/domain.md` gỡ đoạn legacy; `.agents/knowledge-base.md` § Legacy gỡ; `README.md` root gỡ nhắc legacy nếu có; `.agents/commands.md` kiểm.
- [ ] ADR-0001: giữ `status: accepted`, thêm một dòng cuối "Đã thực hiện xong ngày YYYY-MM-DD: bốn app về `apps/` qua ticket 03–06 của topic `legacy-migrate`, `legacy/` đã xoá."; ADR-0004 và spec hai topic không sửa.
- [ ] `grep -rn "legacy/" --exclude-dir=node_modules --exclude-dir=.git .` chỉ còn khớp trong `docs/adr/`, `docs/research/`, `.agents/plans/` (lịch sử) — không trong CLAUDE.md, rule, config, README app.
- [ ] Gate xanh 0 warning; `bun run e2e` (hoặc từng app qua `bunx playwright test`) xanh cho mọi app để chắc không app nào còn import gì từ `legacy/`; output vào Notes.

## Notes
