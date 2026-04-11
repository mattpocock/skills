# Issue Taxonomy

Use this taxonomy to classify issues found during dogfood QA testing.

## Severity Levels

### Critical
The issue makes a core feature completely unusable or causes data loss.

**Examples:**
- Application crashes or shows a blank white page
- Form submission silently loses user data
- Authentication is completely broken (can't log in at all)
- Payment flow fails and charges the user without completing the order
- Security vulnerability (e.g., XSS, exposed credentials in console)

### High
The issue significantly impairs functionality but a workaround may exist.

**Examples:**
- A key button does nothing when clicked (but refreshing fixes it)
- Search returns no results for valid queries
- Form validation rejects valid input
- Page loads but critical content is missing or garbled
- Navigation link leads to a 404 or wrong page
- Uncaught JavaScript exceptions in the console on core pages

### Medium
The issue is noticeable and affects user experience but doesn't block core functionality.

**Examples:**
- Layout is misaligned or overlapping on certain screen sections
- Images fail to load (broken image icons)
- Slow performance (visible loading delays > 3 seconds)
- Form field lacks proper validation feedback (no error message on bad input)
- Console warnings that suggest deprecated or misconfigured features
- Inconsistent styling between similar pages

### Low
Minor polish issues that don't affect functionality.

**Examples:**
- Typos or grammatical errors in text content
- Minor spacing or alignment inconsistencies
- Placeholder text left in production ("Lorem ipsum")
- Favicon missing
- Console info/debug messages that shouldn't be in production
- Subtle color contrast issues that don't fail WCAG requirements

## Categories

### Functional
Issues where features don't work as expected.

- Buttons/links that don't respond
- Forms that don't submit or submit incorrectly
- Broken user flows (can't complete a multi-step process)
- Incorrect data displayed
- Features that work partially

### Visual
Issues with the visual presentation of the page.

- Layout problems (overlapping elements, broken grids)
- Broken images or missing media
- Styling inconsistencies
- Responsive design failures
- Z-index issues (elements hidden behind others)
- Text overflow or truncation

### Accessibility
Issues that prevent or hinder access for users with disabilities.

- Missing alt text on meaningful images
- Poor color contrast (fails WCAG AA)
- Elements not reachable via keyboard navigation
- Missing form labels or ARIA attributes
- Focus indicators missing or unclear
- Screen reader incompatible content

### Console
Issues detected through JavaScript console output.

- Uncaught exceptions and unhandled promise rejections
- Failed network requests (4xx, 5xx errors in console)
- Deprecation warnings
- CORS errors
- Mixed content warnings (HTTP resources on HTTPS page)
- Excessive console.log output left from development

### UX (User Experience)
Issues where functionality works but the experience is poor.

- Confusing navigation or information architecture
- Missing loading indicators (user doesn't know something is happening)
- No feedback after user actions (e.g., button click with no visible result)
- Inconsistent interaction patterns
- Missing confirmation dialogs for destructive actions
- Poor error messages that don't help the user recover

### Content
Issues with the text, media, or information on the page.

- Typos and grammatical errors
- Placeholder/dummy content in production
- Outdated information
- Missing content (empty sections)
- Broken or dead links to external resources
- Incorrect or misleading labels
