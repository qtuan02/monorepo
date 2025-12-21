# Epic 3: Auto-Generation & Maintenance

**Epic ID:** Epic 3  
**Project:** Documents - UI Documentation Site  
**Related Documents:** [PRD](../prd.md), [Architecture](../architecture.md)  
**Status:** Ready for Story Creation  
**Created:** 2024-12-19

---

## Epic Goal

Automatically generate and maintain documentation from source code.

---

## Epic Description

This epic provides the core automation that eliminates manual documentation maintenance. It extracts props from TypeScript interfaces, reads source code from the file system, and generates component/hook metadata for categorization and discovery. This automation is the foundational capability that enables the documentation site to stay in sync with code automatically.

**Value Statement:** Auto-generation is the key differentiator that makes this documentation site maintainable at scale. Without it, the documentation would quickly become outdated, reducing its value and requiring constant manual updates.

---

## Context

**Project Type:** Greenfield  
**Technology Stack:** Node.js (build-time), TypeScript, ts-morph (or TypeScript compiler API), Vite plugins  
**Integration Points:**
- File system: `packages/ui/src/components/*.tsx`, `packages/hook/src/hooks/*.ts`
- Build-time processing via Vite plugins
- Monorepo package resolution
- TypeScript AST parsing for props extraction

**Dependencies:**
- Foundation for Epic 1 (discovery needs metadata)
- Foundation for Epic 2 (detail pages need props tables and source code)
- Must complete early in development timeline (Week 5-6)

---

## User Stories

### US-3.1: Auto-Generate Props Tables

**As a** system  
**I want to** automatically extract props from TypeScript interfaces  
**So that** documentation stays in sync with code

**Acceptance Criteria:**
- Props are extracted from component TypeScript interfaces
- Props table is generated automatically
- JSDoc comments are extracted for descriptions
- Default values are extracted where possible
- Complex types (unions, generics) are handled correctly
- Updates automatically when component code changes
- No manual intervention required

**Priority:** P0 (Critical)

**Technical Notes:**
- Use ts-morph or TypeScript compiler API
- Parse component props interface/type definitions
- Extract type information, required/optional status
- Handle complex types: unions, intersections, generics, utility types
- Extract JSDoc comments for prop descriptions
- Generate JSON or structured data for props tables

---

### US-3.2: Auto-Extract Source Code

**As a** system  
**I want to** automatically read component/hook source code from file system  
**So that** source code is always up-to-date

**Acceptance Criteria:**
- Source code is read from `packages/ui/src/components/*.tsx`
- Source code is read from `packages/hook/src/hooks/*.ts`
- File reading handles monorepo structure correctly
- Code is displayed accurately
- Excludes `/v1/*` components as specified
- Handles file system errors gracefully

**Priority:** P0 (Critical)

**Technical Notes:**
- Build-time file system reading via Vite plugin or Node.js script
- Handle monorepo package resolution (use workspace package references)
- Filter out `/v1/*` directory components
- Error handling for missing files or read failures
- Cache file content for performance during build

---

### US-3.3: Auto-Generate Component Metadata

**As a** system  
**I want to** automatically extract component metadata  
**So that** components are properly categorized and tagged

**Acceptance Criteria:**
- Component names are extracted from file names
- Categories are determined using automatic detection (file location patterns, naming conventions)
- Manual override capability via metadata files (e.g., `component.meta.json`) for category assignment
- Fallback to "Uncategorized" if automatic detection fails
- Package origin is identified automatically
- Metadata is stored and used for filtering/search
- Updates automatically when new components are added
- Manual review of first 20 components to validate category assignment accuracy

**Priority:** P1 (High)

**Technical Notes:**
- Category detection rules:
  - File location patterns (e.g., components in `form/` folder → Form category)
  - Naming conventions (e.g., `Button`, `Input` → Form category)
  - Component prop patterns or exports
- Metadata file format: `component.meta.json` in same directory as component
- Store metadata in JSON file or build-time generated index
- Support for multiple categories per component (tags)

**Category Detection Rules:**
- **Form:** Input, Button, Select, Checkbox, Radio, Textarea, etc.
- **Layout:** Container, Grid, Flex, Stack, etc.
- **Feedback:** Alert, Toast, Modal, Dialog, etc.
- **Data Display:** Table, Card, List, Badge, etc.
- **Navigation:** Nav, Menu, Tabs, Breadcrumb, etc.

---

## Success Criteria

- Props tables are 100% accurate for all components with TypeScript interfaces
- Source code extraction works for all components/hooks (excluding `/v1/*`)
- Category assignment is accurate for at least 80% of components (validated via manual review)
- Build-time generation completes in reasonable time (< 30 seconds for 100+ components)
- Manual override capability works correctly
- Metadata stays in sync with codebase automatically

---

## Technical Considerations

**Implementation Approach:**
- Build-time processing via Vite plugin or separate build script
- TypeScript AST parsing using ts-morph (recommended) or compiler API
- File system traversal for component discovery
- Metadata generation and caching for performance
- JSON output for metadata storage (can be imported by frontend)

**Build Process Integration:**
- Vite plugin runs during build
- Generates metadata files in `src/generated/` or similar
- Frontend imports generated metadata at build time
- Type-safe metadata types generated from JSON

**TypeScript Parsing Library Choice:**
- **ts-morph** (Recommended):
  - Higher-level API, easier to use
  - Better for AST manipulation
  - Good documentation and community support
  - May have performance overhead for large codebases
- **TypeScript Compiler API**:
  - Lower-level, more control
  - Better performance
  - Steeper learning curve
  - More verbose code

**Recommendation:** Start with ts-morph for faster development, migrate to compiler API if performance issues arise.

**Error Handling:**
- Graceful fallback when parsing fails (show raw type string)
- Log errors for debugging
- Continue processing other components if one fails
- Clear error messages for common failure scenarios

---

## Risk Assessment

**Primary Risk:** TypeScript parsing complexity - complex types may not be parsed correctly

**Mitigation:**
- Research and test parsing libraries early (Week 1)
- Build proof-of-concept with sample components (Week 1)
- Start with simple cases, iterate to complex types
- Fallback display for unsupported type patterns
- Manual override capability for edge cases
- Thorough testing with all component types

**Category Assignment Risk:** Automatic detection may not be accurate for all components

**Mitigation:**
- Manual review of first 20 components to validate accuracy
- Manual override capability via metadata files
- Clear category detection rules documented
- Iterate on detection algorithm based on review results
- Fallback to "Uncategorized" category

**Performance Risk:** Build-time processing may be slow with 100+ components

**Mitigation:**
- Implement caching for parsed results
- Process components in parallel where possible
- Optimize file system operations
- Profile and optimize slow operations
- Consider incremental builds (only process changed files)

**Monorepo Resolution Risk:** Package resolution may fail in build environment

**Mitigation:**
- Test monorepo package resolution early (Week 1)
- Use relative paths if package resolution fails
- Document workarounds if needed
- Ensure build environment has access to monorepo structure

---

## Definition of Done

- [ ] All user stories completed with acceptance criteria met
- [ ] Props extraction works for all components with TypeScript interfaces
- [ ] Source code extraction works for all components/hooks (excluding `/v1/*`)
- [ ] Category assignment accuracy validated (manual review of first 20 components)
- [ ] Manual override capability works correctly
- [ ] Build-time generation completes in acceptable time
- [ ] Error handling works gracefully for edge cases
- [ ] Generated metadata is type-safe and validated
- [ ] Integration with Epic 1 and Epic 2 verified
- [ ] Documentation updated with category detection rules
- [ ] Testing completed for all scenarios

---

## Related Epics

- **Epic 1:** Component Discovery & Navigation (depends on metadata for categorization and search)
- **Epic 2:** Component/Hook Detail Pages (depends on props tables and source code extraction)
- Foundation epic - other epics depend on this one

---

**Next Steps:**
1. Research and select TypeScript parsing library (ts-morph recommended)
2. Build proof-of-concept for props extraction (Week 1)
3. Create detailed user stories from this epic
4. Begin implementation with US-3.2 (Auto-Extract Source Code) as it's simpler
5. Then implement US-3.1 (Auto-Generate Props Tables)
6. Finally implement US-3.3 (Auto-Generate Component Metadata)
7. Conduct manual review of first 20 components for category validation

