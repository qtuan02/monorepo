# Hướng Dẫn Sử Dụng BMAD System

## Tổng Quan

BMAD (Business Model and Design) là một hệ thống quản lý dự án sử dụng các AI agent chuyên biệt để hỗ trợ các giai đoạn khác nhau của quy trình phát triển phần mềm.

## Cách Kích Hoạt Agent

Để sử dụng BMAD, bạn gõ `@` theo sau bởi tên agent trong Cursor. Ví dụ:
- `@analyst` - Kích hoạt Business Analyst
- `@architect` - Kích hoạt Architect
- `@pm` - Kích hoạt Product Manager
- `@po` - Kích hoạt Product Owner
- `@sm` - Kích hoạt Scrum Master
- `@dev` - Kích hoạt Developer
- `@qa` - Kích hoạt QA
- `@ux-expert` - Kích hoạt UX Expert
- `@bmad-orchestrator` - Kích hoạt Orchestrator (điều phối tất cả)
- `@bmad-master` - Kích hoạt Master Task Executor

## Các Agent và Vai Trò

### 📊 Analyst (Mary) - Business Analyst
**Khi nào dùng:** Nghiên cứu thị trường, brainstorming, phân tích đối thủ, tạo project brief, khám phá dự án ban đầu

**Lệnh chính:**
- `*help` - Hiển thị danh sách lệnh
- `*brainstorm {topic}` - Tổ chức phiên brainstorming
- `*create-competitor-analysis` - Tạo phân tích đối thủ
- `*create-project-brief` - Tạo project brief
- `*perform-market-research` - Thực hiện nghiên cứu thị trường
- `*research-prompt {topic}` - Tạo research prompt sâu
- `*exit` - Thoát khỏi agent

### 🏗️ Architect (Winston) - System Architect
**Khi nào dùng:** Thiết kế hệ thống, tài liệu kiến trúc, lựa chọn công nghệ, thiết kế API, lập kế hoạch infrastructure

**Lệnh chính:**
- `*help` - Hiển thị danh sách lệnh
- `*create-backend-architecture` - Tạo kiến trúc backend
- `*create-front-end-architecture` - Tạo kiến trúc frontend
- `*create-full-stack-architecture` - Tạo kiến trúc full-stack
- `*create-brownfield-architecture` - Tạo kiến trúc cho dự án brownfield
- `*document-project` - Tài liệu hóa dự án
- `*execute-checklist` - Chạy checklist
- `*exit` - Thoát khỏi agent

### 📋 PM (John) - Product Manager
**Khi nào dùng:** Tạo PRD, chiến lược sản phẩm, ưu tiên tính năng, lập kế hoạch roadmap, giao tiếp với stakeholder

**Lệnh chính:**
- `*help` - Hiển thị danh sách lệnh
- `*create-prd` - Tạo PRD (Product Requirements Document)
- `*create-brownfield-prd` - Tạo PRD cho dự án brownfield
- `*create-epic` - Tạo epic
- `*create-story` - Tạo user story
- `*correct-course` - Điều chỉnh hướng đi
- `*shard-prd` - Chia nhỏ PRD
- `*exit` - Thoát khỏi agent

### 📝 PO (Sarah) - Product Owner
**Khi nào dùng:** Quản lý backlog, tinh chỉnh story, acceptance criteria, sprint planning, quyết định ưu tiên

**Lệnh chính:**
- `*help` - Hiển thị danh sách lệnh
- `*create-epic` - Tạo epic
- `*create-story` - Tạo user story
- `*validate-story-draft {story}` - Xác thực story draft
- `*execute-checklist-po` - Chạy PO checklist
- `*shard-doc` - Chia nhỏ tài liệu
- `*correct-course` - Điều chỉnh hướng đi
- `*exit` - Thoát khỏi agent

### 🏃 SM (Bob) - Scrum Master
**Khi nào dùng:** Tạo story, quản lý epic, retrospectives, hướng dẫn quy trình agile

**Lệnh chính:**
- `*help` - Hiển thị danh sách lệnh
- `*draft` - Tạo story mới
- `*story-checklist` - Chạy story draft checklist
- `*correct-course` - Điều chỉnh hướng đi
- `*exit` - Thoát khỏi agent

### 💻 Dev (James) - Full Stack Developer
**Khi nào dùng:** Triển khai code, debug, refactor, best practices phát triển

**Lệnh chính:**
- `*help` - Hiển thị danh sách lệnh
- `*develop-story` - Phát triển story (đọc task → implement → test → validate → cập nhật checkbox)
- `*explain` - Giải thích chi tiết những gì đã làm
- `*review-qa` - Áp dụng fixes từ QA
- `*run-tests` - Chạy linting và tests
- `*exit` - Thoát khỏi agent

### 🎭 BMad Orchestrator
**Khi nào dùng:** Điều phối workflow, nhiệm vụ đa agent, hướng dẫn chuyển đổi vai trò, khi không chắc nên dùng agent nào

**Lệnh chính:**
- `*help` - Hiển thị hướng dẫn đầy đủ
- `*agent [name]` - Chuyển đổi thành agent chuyên biệt (liệt kê nếu không có tên)
- `*workflow [name]` - Bắt đầu workflow cụ thể (liệt kê nếu không có tên)
- `*workflow-guidance` - Nhận hướng dẫn chọn workflow phù hợp
- `*plan` - Tạo kế hoạch workflow chi tiết
- `*status` - Hiển thị context hiện tại, agent đang active, và tiến độ
- `*chat-mode` - Bắt đầu chế độ trò chuyện
- `*kb-mode` - Load knowledge base đầy đủ
- `*task [name]` - Chạy task cụ thể
- `*checklist [name]` - Thực thi checklist
- `*exit` - Thoát

### 🧙 BMad Master
**Khi nào dùng:** Khi cần chuyên môn toàn diện, chạy các task đơn lẻ không cần persona, hoặc muốn dùng cùng một agent cho nhiều việc

**Lệnh chính:**
- `*help` - Hiển thị danh sách lệnh
- `*create-doc {template}` - Tạo tài liệu với template
- `*document-project` - Tài liệu hóa dự án
- `*task {task}` - Thực thi task
- `*execute-checklist {checklist}` - Chạy checklist
- `*kb` - Bật/tắt KB mode
- `*exit` - Thoát

## Quy Trình Sử Dụng Cơ Bản

### 1. Bắt Đầu Dự Án Mới (Greenfield)

```
1. @analyst → *create-project-brief (tạo project brief)
2. @analyst → *perform-market-research (nghiên cứu thị trường)
3. @pm → *create-prd (tạo PRD)
4. @architect → *create-full-stack-architecture (tạo kiến trúc)
5. @po → *create-epic (tạo epic)
6. @sm → *draft (tạo story)
7. @dev → *develop-story (phát triển)
8. @qa → (kiểm thử)
```

### 2. Dự Án Đã Có (Brownfield)

```
1. @analyst → *document-project (tài liệu hóa dự án hiện tại)
2. @pm → *create-brownfield-prd (tạo PRD cho brownfield)
3. @architect → *create-brownfield-architecture (tạo kiến trúc)
4. @po → *create-story (tạo story mới)
5. @dev → *develop-story (phát triển)
```

### 3. Sử Dụng Orchestrator

```
1. @bmad-orchestrator → *help (xem tất cả options)
2. @bmad-orchestrator → *workflow-guidance (nhận hướng dẫn)
3. @bmad-orchestrator → *agent pm (chuyển sang PM)
4. @bmad-orchestrator → *workflow greenfield-fullstack (chạy workflow)
```

## Các Lệnh Chung

Tất cả các lệnh đều bắt đầu bằng `*` (dấu sao):
- `*help` - Luôn có sẵn để xem danh sách lệnh
- `*yolo` - Bật/tắt chế độ skip confirmations
- `*doc-out` - Xuất tài liệu đầy đủ ra file
- `*exit` - Thoát khỏi agent hiện tại

## Cấu Trúc Thư Mục

BMAD sử dụng cấu trúc `.bmad-core/` để lưu trữ:
- `agents/` - Định nghĩa các agent
- `tasks/` - Các task có thể thực thi
- `templates/` - Các template tài liệu
- `checklists/` - Các checklist
- `workflows/` - Các workflow
- `data/` - Dữ liệu và knowledge base
- `core-config.yaml` - Cấu hình dự án

## Mẹo Sử Dụng

1. **Luôn bắt đầu với `*help`** - Mỗi agent sẽ tự động chạy `*help` khi được kích hoạt
2. **Sử dụng Orchestrator khi không chắc** - `@bmad-orchestrator` có thể hướng dẫn bạn chọn agent phù hợp
3. **Workflow Guidance** - Dùng `*workflow-guidance` để được tư vấn workflow phù hợp
4. **Numbered Lists** - Tất cả các lựa chọn đều hiển thị dạng số, bạn có thể gõ số để chọn
5. **Yolo Mode** - Bật `*yolo` để bỏ qua các xác nhận khi bạn đã quen

## Lưu Ý Quan Trọng

- Mỗi agent có vai trò riêng, không nên dùng agent này để làm việc của agent khác
- Dev agent chỉ được cập nhật các phần cụ thể trong story file, không được sửa các phần khác
- Tasks với `elicit=true` yêu cầu tương tác với user, không thể bỏ qua
- Luôn kiểm tra story status trước khi bắt đầu development

## Ví Dụ Thực Tế

### Tạo PRD cho một tính năng mới:

```
@pm
*create-prd
[Chọn template prd-tmpl.yaml]
[Điền thông tin theo hướng dẫn]
*doc-out
```

### Phát triển một story:

```
@dev
*develop-story
[Agent sẽ đọc story, implement từng task, test, và cập nhật]
```

### Brainstorming ý tưởng:

```
@analyst
*brainstorm "tính năng chat real-time"
[Theo dõi quy trình brainstorming có cấu trúc]
```

## Hỗ Trợ

Nếu bạn không chắc nên dùng agent nào hoặc cần hướng dẫn:
1. Gõ `@bmad-orchestrator`
2. Gõ `*help` để xem tất cả options
3. Gõ `*workflow-guidance` để được tư vấn

