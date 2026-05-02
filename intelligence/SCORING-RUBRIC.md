DeAssists — GAN Evaluator Scoring Rubric
Version: 1.0 | Date: 2 May 2026
Owner: Shon AJ | Brain: VEERABHADRA
Used by: GAN Evaluator in Phase 6 autonomous build loop

A feature scores 0-10 against this rubric.
Score 8 or above = loop closes. Present to Shon for review.
Score below 8 = send feedback to Generator. Iterate.

HOW SCORING WORKS

The GAN Evaluator opens localhost:4002 using Playwright.
It tests the feature against each criterion below.
Each criterion is worth 1 point.
Maximum score: 10 points.
Passing threshold: 8 points.
If score is below 8 — write specific feedback for each failed criterion.
Send feedback to the Generator. Generator fixes and resubmits.
Loop continues until score reaches 8 or above.

THE 10 CRITERIA

CRITERION 1 — Page loads without error (1 point)
Test: navigate to the page URL as SUPER_ADMIN.
Pass: page loads within 5 seconds. No error messages. No blank screen.
Fail: page shows error, blank screen, or redirects to /signin or workinprogress.

CRITERION 2 — SUPER_ADMIN can access the page (1 point)
Test: log in as SUPER_ADMIN. Navigate to the page URL directly.
Pass: page renders with content.
Fail: redirected away from the page.

CRITERION 3 — MANAGER can access the page (1 point)
Test: log in as MANAGER. Navigate to the page URL directly.
Pass: page renders with content.
Fail: redirected away when MANAGER should have access.

CRITERION 4 — Unauthorised roles cannot access the page (1 point)
Test: log in as AGENT. Navigate to the page URL directly.
Pass: AGENT is redirected away from the page.
Fail: AGENT can see the page when they should not.

CRITERION 5 — Sidebar entry is correct (1 point)
Test: log in as SUPER_ADMIN. Check sidebar structure.
Pass: the new page appears in the correct sidebar section with correct title and icon.
Fail: page is missing from sidebar or appears in wrong section.

CRITERION 6 — No hardcoded colours or values (1 point)
Test: run grep checks on all new files.
  grep -rn "'#" [new-files]
  grep -rn "await fetch(" [new-files]
Pass: all greps return empty.
Fail: any hardcoded hex colour or raw fetch found.

CRITERION 7 — Build passes with zero new errors (1 point)
Test: run npx nx build cms-next --skip-nx-cache
Pass: build succeeds with no new TypeScript errors.
Fail: any new TypeScript error introduced by this feature.

CRITERION 8 — Empty state is designed for State 2A or 2B features (1 point)
Test: if feature is State 2A or 2B, check that an empty state exists when no data is present.
Pass: empty state shows icon, headline, explanation, and CTA where appropriate.
Fail: blank white space when no data exists. No guidance for the user.

CRITERION 9 — Mobile responsive at 375px width (1 point)
Test: set viewport to 375px width. Navigate to the page.
Pass: content is readable and usable. No horizontal scroll. No overlapping elements.
Fail: layout breaks at mobile width.

CRITERION 10 — No console errors in browser (1 point)
Test: open browser console while on the page. Check for errors.
Pass: zero console errors or warnings related to the new feature.
Fail: TypeScript errors, React warnings, or API errors visible in console.

FEEDBACK FORMAT FOR GENERATOR

When score is below 8, send this exact format back to the Generator:

EVALUATOR FEEDBACK
Score: [N]/10
Passed: [list criteria that passed]
Failed: [list criteria that failed]
Required fixes:
  Criterion [N]: [exact description of what must change]
  Criterion [N]: [exact description of what must change]
Resubmit after fixing all items above.

SCORE HISTORY

Track scores across iterations here.
Format: Date | Feature | Attempt | Score | Outcome

Scoring Rubric — DeAssists GAN Evaluator
Owner: Shon AJ | Brain: VEERABHADRA
Created: 2 May 2026
