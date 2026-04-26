---
name: feature-complete
description: Audit a feature or change for production readiness across 8 dimensions - tests, errors, docs, types, a11y, performance, security, and observability. Use when user says "is this ready to ship", "feature complete check", "completeness audit", or before marking work as done.
---

# Feature Complete

Systematically verify a feature is production-ready across all quality dimensions. This prevents the "done but not done" problem where code works but lacks tests, error handling, docs, or other production necessities.

## Quick Start

```bash
# In the terminal
/feature-complete

# Or with a specific scope
/feature-complete src/components/user-profile.tsx
```

The skill will audit the feature and create a checklist of what's missing.

## The 8 Dimensions

### 1. Test Coverage
- [ ] Happy path covered
- [ ] Edge cases tested (empty, null, max length, special chars)
- [ ] Error cases tested
- [ ] Integration tests for critical paths
- [ ] Tests are readable and maintainable

### 2. Error Handling
- [ ] All failure modes handled gracefully
- [ ] User-friendly error messages (no stack traces to users)
- [ ] Proper error boundaries (React) or try-catch blocks
- [ ] Failed states have clear recovery paths
- [ ] No silent failures

### 3. Documentation
- [ ] Public APIs documented (JSDoc/TSDoc)
- [ ] README updated if user-facing
- [ ] CHANGELOG entry added
- [ ] Complex logic has WHY comments (not WHAT)
- [ ] Migration guide if breaking change

### 4. Type Safety
- [ ] No `any` types without justification
- [ ] Proper input/output typing
- [ ] Null/undefined handled explicitly
- [ ] Type errors resolved (not ignored)
- [ ] Shared types extracted to common location

### 5. Accessibility (for UI)
- [ ] Keyboard navigation works
- [ ] Screen reader friendly (ARIA labels, semantic HTML)
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] Forms have proper labels and validation messages

### 6. Performance
- [ ] No obvious inefficiencies (N+1 queries, unnecessary re-renders)
- [ ] Large lists virtualized or paginated
- [ ] Images optimized and lazy-loaded
- [ ] Appropriate caching strategy
- [ ] No blocking operations on main thread

### 7. Security
- [ ] Input sanitized and validated
- [ ] No XSS vulnerabilities
- [ ] No SQL injection risks
- [ ] Authentication/authorization checked
- [ ] Secrets not hardcoded or logged
- [ ] CSRF protection if state-changing

### 8. Observability
- [ ] Key user actions logged
- [ ] Errors logged with context
- [ ] Performance metrics tracked if critical path
- [ ] Debug information available for troubleshooting
- [ ] No sensitive data in logs

## Process

### 1. Identify scope

Ask the user:
- Which files/components are in scope for this feature?
- Is this a new feature, enhancement, or bug fix?
- Is it user-facing or internal?

If they don't specify, use git to find recently changed files on the current branch.

### 2. Audit each dimension

For each of the 8 dimensions, examine the code:

- Read relevant source files
- Check for related test files
- Look for error handling patterns
- Review documentation
- Check type definitions
- Assess accessibility (if UI)
- Look for performance issues
- Review security considerations
- Check logging/monitoring

Use the Agent tool with subagent_type=Explore for broad codebase exploration when needed.

### 3. Generate completeness report

Create a **completeness report** using the TodoWrite tool with findings organized by dimension:

```markdown
# Feature Completeness Report

**Feature**: [name]
**Scope**: [files in scope]
**Type**: [new feature | enhancement | bug fix]

## Completeness Score: X/8 dimensions ready

### ✅ 1. Test Coverage - READY
- Happy path covered in user-profile.test.tsx
- Edge cases tested (empty name, long bio)

### ⚠️ 2. Error Handling - NEEDS WORK
- [ ] Add error boundary around profile image upload
- [ ] Handle network timeout in fetchUserData()
- [ ] Show user-friendly message when profile save fails

### ✅ 3. Documentation - READY
- JSDoc added to public methods
- README updated with new profile fields

... continue for all 8 dimensions ...

## Priority Fixes (before shipping)

1. **Error Handling**: Add error boundary for image upload (prevents app crash)
2. **Security**: Sanitize bio field to prevent XSS
3. **Accessibility**: Add aria-label to profile edit button

## Nice-to-Have (can defer)

1. **Performance**: Virtualize follower list (only needed at 1000+ followers)
2. **Observability**: Add analytics for profile view events
```

### 4. Assess ship-readiness

Based on findings, tell the user:

- **READY TO SHIP** if 7-8 dimensions pass and no critical issues
- **NOT READY - Priority fixes needed** if critical gaps exist (security, error handling for critical paths, broken a11y)
- **READY with follow-up** if minor issues can be tracked separately

### 5. Offer to fix or file issues

Ask the user:
- "Want me to fix these now?"
- "Should I file GitHub issues for the follow-up items?"
- "Want to ship with the priority fixes done first?"

## Advanced Usage

### Skip dimensions

```bash
/feature-complete --skip-perf --skip-observability
```

Useful for internal tools or non-critical paths where some dimensions matter less.

### Focus on specific dimensions

```bash
/feature-complete --only security,tests,errors
```

Good for security-critical features or when you know specific areas need attention.

### Custom thresholds

For different project types, adjust what "ready" means:

- **Internal tools**: Can skip a11y, relax observability
- **Public APIs**: Strict on docs, types, security, tests
- **UI components**: Strict on a11y, types, tests
- **Data pipelines**: Strict on errors, observability, tests

Ask the user what type of feature this is to calibrate standards.

## Common Patterns

### For React components

Focus on:
- Tests (react-testing-library)
- Error boundaries
- Prop types / TypeScript
- Accessibility (keyboard, screen reader)
- Performance (memo, useMemo, useCallback only when needed)

### For API endpoints

Focus on:
- Tests (integration tests calling the endpoint)
- Error handling (proper HTTP status codes)
- Input validation and sanitization
- Authentication/authorization
- Rate limiting and observability

### For database migrations

Focus on:
- Tests (up and down migrations)
- Error handling (rollback plan)
- Documentation (why the change, data impact)
- Performance (won't lock tables for hours)
- Observability (monitoring for migration failures)

## Integration with Other Skills

This skill pairs well with:

- `/review` - Run feature-complete after code review before merge
- `/security-review` - Deep-dive into dimension #7 (security)
- `/triage-issue` - Create issues for gaps found
- `/simplify` - Fix over-engineered code found during audit

## Anti-Patterns to Avoid

**Don't** create the completeness report as a markdown file in the repo - use TodoWrite so it stays in the conversation context.

**Don't** block on every dimension for every feature - use judgment. A quick internal admin page doesn't need the same rigor as a payment flow.

**Don't** just generate a checklist and stop - actually examine the code and provide specific findings.

**Don't** treat this as a gate that prevents shipping - it's a tool to surface blind spots. The user decides what's required.

## Philosophy

Features are "done" when they're **durable** - they handle failure, are understandable, are accessible, and can be maintained. This skill helps make the invisible visible: all the work that separates a demo from production code.

The goal isn't perfection - it's informed trade-offs. Sometimes shipping with missing observability is fine. But that should be a conscious choice, not an oversight.
