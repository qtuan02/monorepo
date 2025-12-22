# Epic 2: Component/Hook Detail Pages

**Epic ID:** Epic 2  
**Project:** Documents - UI Documentation Site  
**Related Documents:** [PRD](../prd.md), [Architecture](../architecture.md)  
**Status:** Complete  
**Created:** 2024-12-19  
**Updated:** 2024-12-22

> **Completion Notes:** All 6 user stories completed. Stories 2.1-2.2 implemented first, then stories 2.3-2.6 were tracked separately as they were implemented within Story 2.1. All acceptance criteria met across all stories.

## Epic Goal

Provide comprehensive information about each component/hook.

---

## Epic Description

This epic delivers the core detail pages where users view comprehensive information about individual components and hooks. It includes visual previews, auto-generated props tables, source code display, and code copy functionality. These detail pages are the primary destination after discovery and form the core value proposition of the documentation site.

**Value Statement:** Detail pages transform the documentation from a simple listing into a practical reference tool, enabling developers to understand, evaluate, and implement components/hooks efficiently.

---

## Context

**Project Type:** Greenfield  
**Technology Stack:** React 18+, TypeScript, Vite 5+, React Router 6+, shadcn/ui, Tailwind CSS, Shiki (syntax highlighting)  
**Integration Points:**

- Monorepo packages: `@monorepo/ui` (components for previews), `@monorepo/hook` (hooks)
- Build-time processing for source code extraction
- TypeScript parsing for props extraction (Epic 3)
- Component preview rendering with context providers

**Dependencies:**

- Requires Epic 3 (Auto-Generation) for props tables and source code extraction
- Requires Epic 1 (Discovery) for navigation to detail pages
- Requires Epic 6 (Error Handling) for error states during preview loading

---

## User Stories

### US-2.1: View Component Details

**As a** developer  
**I want to** see comprehensive information about a component  
**So that** I can understand how to use it

**Acceptance Criteria:**

- Detail page shows:
  - Component name and description
  - Visual preview with live example
  - Props table (auto-generated)
  - Source code viewer
  - Usage examples
  - Category tags
- Page loads in < 2 seconds
- All sections are clearly organized
- Mobile-responsive layout

**Priority:** P0 (Critical)

**Dependencies:** Epic 3 (props table generation, source code extraction)

---

### US-2.2: View Hook Details

**As a** developer  
**I want to** see comprehensive information about a hook  
**So that** I can understand how to use it

**Acceptance Criteria:**

- Detail page shows:
  - Hook name and description
  - Parameters and return values (auto-generated)
  - Usage example with code
  - Source code viewer
  - Category tags
- Information is accurate and up-to-date
- Code examples are syntax-highlighted

**Priority:** P0 (Critical)

**Dependencies:** Epic 3 (parameter extraction, source code extraction)

---

### US-2.3: View Component Visual Preview

**As a** designer or developer  
**I want to** see a visual preview of the component  
**So that** I can understand its appearance and behavior

**Acceptance Criteria:**

- Preview section shows live component example (rendered React component, not static image)
- Preview is interactive (if component supports interaction)
- Preview is responsive (shows mobile/tablet/desktop views if applicable)
- Preview loads quickly (< 1 second)
- Preview is clearly labeled
- Loading state shown during preview initialization (see US-6.2)
- Error state shown if preview fails to load (see US-6.1)
- Preview container handles components requiring context providers or state setup

**Priority:** P0 (Critical)

**Technical Notes:**

- Need PreviewContainer component that wraps components with necessary providers
- Support for components requiring theme providers, state management, etc.
- Consider iframe isolation for complex components (optional enhancement)

---

### US-2.4: View Component Source Code

**As a** developer  
**I want to** view the full source code of a component  
**So that** I can understand implementation details

**Acceptance Criteria:**

- Source code is displayed with syntax highlighting
- Code is properly formatted
- Line numbers are optional (toggle)
- Copy to clipboard button is prominent
- Code viewer handles files up to 500 lines smoothly
- Full component file is shown (not truncated)

**Priority:** P0 (Critical)

**Dependencies:** Epic 3 (source code extraction), Shiki for syntax highlighting

---

### US-2.5: View Auto-Generated Props Table

**As a** developer  
**I want to** see a props table with types, descriptions, and defaults  
**So that** I can understand component API

**Acceptance Criteria:**

- Props table is auto-generated from TypeScript interfaces
- Table shows: prop name, type, description, default value, required
- Complex types are displayed clearly
- Union types are shown properly
- JSDoc comments are extracted and displayed
- Table is sortable and searchable
- Updates automatically when component code changes

**Priority:** P0 (Critical)

**Dependencies:** Epic 3 (TypeScript parsing for props extraction)

**Technical Notes:**

- Requires ts-morph or TypeScript compiler API
- Need to handle complex types: generics, unions, intersections, etc.
- JSDoc comment extraction for descriptions

---

### US-2.6: Copy Code to Clipboard

**As a** developer  
**I want to** copy code examples and source code to clipboard  
**So that** I can use them in my project

**Acceptance Criteria:**

- Copy button is visible for all code blocks
- Copy button shows feedback when clicked (toast notification)
- Copied code is properly formatted
- Works on all browsers
- Keyboard shortcut support (optional)

**Priority:** P1 (High)

**Technical Notes:**

- Use Clipboard API with fallback
- Toast notification component (shadcn/ui should provide)
- Preserve code formatting when copying

---

## Success Criteria

- Users can view complete component/hook information within 2 seconds
- All code examples are copyable and formatted correctly
- Props tables accurately reflect TypeScript interfaces
- Visual previews work for all component types (including those requiring providers)
- Source code display handles large files smoothly (up to 500 lines)
- Mobile users can access all detail page features

---

## Technical Considerations

**Implementation Approach:**

- Dynamic routing: `/components/:name`, `/hooks/:name`
- Lazy loading for code viewers and previews
- Client-side rendering for interactive previews
- Build-time metadata generation for props tables
- Syntax highlighting with Shiki (server-side rendering support)

**Component Preview Strategy:**

- PreviewContainer component wraps imported components
- Support for common providers (ThemeProvider, etc.)
- Error boundary around preview to catch rendering errors
- Consider code-splitting for large component libraries

**Integration with Other Epics:**

- Epic 3 provides all auto-generated data (props, source code, metadata)
- Epic 1 provides navigation links to detail pages
- Epic 4 provides breadcrumb navigation
- Epic 6 provides error and loading states

---

## Risk Assessment

**Primary Risk:** Component preview complexity - some components may require complex setup (context providers, state, etc.)

**Mitigation:**

- Start with simple components first
- Document preview setup requirements
- Provide fallback to static preview for problematic components
- Support common providers (ThemeProvider, etc.) in PreviewContainer
- Test with all component types early (Week 4)

**Performance Risk:** Large source files or complex props tables could slow down page rendering

**Mitigation:**

- Implement lazy loading for code viewers
- Virtual scrolling for large props tables (if needed)
- Code splitting for detail pages
- Test with largest components early

**TypeScript Parsing Risk:** Complex TypeScript types may not be parsed correctly (Epic 3 dependency)

**Mitigation:**

- Use proven library (ts-morph recommended)
- Fallback display for unsupported type patterns
- Manual override capability for edge cases
- Thorough testing with all component types

---

## Definition of Done

- [ ] All user stories completed with acceptance criteria met
- [ ] Component and hook detail pages display all required information
- [ ] Props tables are accurately auto-generated from TypeScript
- [ ] Visual previews work for all supported component types
- [ ] Source code display with syntax highlighting works correctly
- [ ] Copy to clipboard functionality works on all major browsers
- [ ] Page load performance meets requirements (< 2 seconds)
- [ ] Mobile-responsive design verified
- [ ] Integration with Epic 3 auto-generation verified
- [ ] Error and loading states handled appropriately (Epic 6)
- [ ] Testing completed for all scenarios

---

## Related Epics

- **Epic 1:** Component Discovery & Navigation (users navigate to details from discovery)
- **Epic 3:** Auto-Generation & Maintenance (provides props tables, source code, metadata)
- **Epic 4:** Navigation & User Experience (provides breadcrumb navigation)
- **Epic 6:** Error Handling & User Experience (handles error and loading states)

---

**Next Steps:**

1. Create detailed user stories from this epic
2. Begin implementation with US-2.1 (View Component Details) as foundation
3. Coordinate with Epic 3 to ensure TypeScript parsing supports props extraction needs
4. Design PreviewContainer architecture early to handle component preview requirements
