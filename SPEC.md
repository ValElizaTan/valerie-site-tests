# valerie-site specification

## Conventions
- Sections with ids: #hero #about #skills #projects #repos #contact. All six must exist.
- Responsive: no horizontal scroll at a viewport width of 375px.
- #repos lists the user's public GitHub repos as cards, excluding the profile README repo (the repo named after the user), or shows a plain message if there are none or the fetch fails.
- #hero, #contact contain links to email, GitHub and LinkedIn.

## Issue #1: dark-mode toggle
- A button in the nav toggles a 'dark' class on <body>.
- The choice is kept for the session.

## Issue #5: back-to-top button
Add a back-to-top button that appears once the user has scrolled past the hero section.
- The button is hidden at the top of the page.
- The button is visible after scrolling past #hero.
- Clicking the button scrolls back to the top.
