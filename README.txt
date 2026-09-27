PROJECT: HiCircus Studio — website
ENTRY FILE: index.html

STRUCTURE
---------
index.html                 Homepage (header, hero, selected works, expertise
                           carousel — 5 services, testimonials, call to action,
                           footer)
portfolio.html             Portfolio: project grid with filters (menu "Portfolio",
                           "Explore More Projects" and each "View Project" link)
etheric-residence.html     Project detail page (the one project with real photos)
about.html                 About: studio intro, approach, "what we deliver"
                           (5 services), full-width image, closing band
architecture.html          Service detail: Architecture
products.html               Service detail: Products
motion.html                 Service detail: Motion
immersive.html               Service detail: Immersive
ai-visualization.html        Service detail: AI Visualization
blog.html                  Blog / journal listing (menu "Blog", footer "Journal")
why-we-render-at-dusk.html                      Blog article page
walking-through-a-space-before-it-is-built.html  Blog article page
one-visual-language-from-render-to-brochure.html Blog article page
pricing.html                Pricing: Per Project vs Credit Bank (process/terms
                           only, no € figures — see PRICING PAGE below)
contact.html                Contact page with the enquiry form (every "Contact Us"
                           button links here)
contact.php                Sends the contact form by email (needs PHP, see below)
privacy.html                Privacy policy
terms.html                  Terms of use (website terms + full engagement terms:
                           payment, revisions, Credit Bank, cancellation, IP,
                           confidentiality, force majeure, governing law)
favicon.ico                16/32/48 px icon (HI mark from the logo)
robots.txt                  Allows all crawlers (no sitemap yet — domain unknown;
                           see DEPLOYMENT NOTE below about staging)
assets/css/main.css        All styles (design tokens, layout, responsive rules)
assets/js/main.js          Menu + sticky header, hero video + parallax, project
                           panels + image trail, expertise carousel
assets/fonts/               Manrope WOFF2 files (self-hosted)
assets/images/               Logo (SVG), hero video poster, project photos and
                           service images, pre-blurred copies for panel backgrounds
assets/video/                hero-sculpture.mp4 — hero background video

SIZE
----
Uncompressed folder size: 2.7 MB
(Production budget: 80 MB. Verified with scripts/check_size.py.)

DEPLOYMENT NOTE — STAGING
--------------------------
This build is headed for staging.hicircus.com for client review, not the final
public domain yet. Before uploading:
  - Ask your host to password-protect the staging subdomain (cPanel: Directory
    Privacy / Password Protect Directories) so it isn't publicly browsable.
  - robots.txt currently allows all crawlers. That's fine behind a password,
    but if staging is ever left open without one, change it to "Disallow: /"
    until the site moves to its final production domain, then revert.
  - Once promoted to the real production domain, generate a sitemap.xml and
    add canonical/Open Graph tags (skipped for now — no final domain yet).

EXTERNAL DEPENDENCIES
---------------------
None. Fonts, images, CSS and JS are all local files.

FORM ENDPOINT STATUS
---------------------
contact.html has an enquiry form (name, email, company, service, message,
privacy consent). It posts to contact.php, which emails each message with
PHP's mail() function.

  NOT CONNECTED YET: open contact.php and set RECIPIENT to the email address
  that should receive the messages, e.g.
      const RECIPIENT = 'hello@yourdomain.com';
  Until then the form shows "The contact form is not connected to an email
  address yet".

  Optional: set SENDER to an address on the website's own domain (default:
  no-reply@<domain>). Some hosts only deliver mail from an existing mailbox;
  if messages do not arrive, create that mailbox or ask the host.

Behaviour: fields are checked in the browser and again in contact.php; line
breaks are stripped from single-line fields (no header injection); a hidden
field catches spam bots. With JavaScript the result appears under the button
without leaving the page; without it, contact.php redirects back to
contact.html#form-sent or #form-error. There is no rate limiting or CAPTCHA;
add one if the form starts receiving spam.
Tested locally with PHP 8.4 (all success and error paths, Greek text in
names and messages).

SERVER REQUIREMENTS
--------------------
Any standard hosting — Apache, Nginx, cPanel, Plesk, or any FTP host. No build
step and no Node.js. All pages are static HTML; only the contact form needs
PHP 7.4 or newer with mail() enabled (standard on cPanel/Plesk hosting).
Upload this folder's contents to the web root (or a subdirectory — all paths
are relative).

EXPORT DATE
-----------
2026-09-26

FONTS
-----
Manrope (SIL Open Font License), converted from the locally installed
Manrope 4.504 TTF files to WOFF2 and subset to Latin:
  manrope-regular.woff2          400
  manrope-medium.woff2           500
  manrope-semibold.woff2         600
  manrope-bold.woff2             700
  manrope-extrabold-caps.woff2   800, capitals A–Z only (large watermark words)
The site text is English only; Greek glyphs are not included in these subsets.
If Greek content is added later, re-export the fonts with the Greek range.

KNOWN LIMITATIONS
------------------
Still needed before launch:
  - contact.php: the RECIPIENT email address (see FORM ENDPOINT STATUS).
  - Footer: Instagram, LinkedIn, Behance on every page (<a data-social="...">
    elements — add the profile URL as href to each)

Placeholder content to replace before launch:
  - Project names and tags (index.html and portfolio.html). portfolio.html
    lists 7 example projects; the last four reuse the hero poster and the
    expertise images, so replace them with real project photos.
  - about.html: all text (studio introduction, "How we work" steps and the
    "What we deliver" lists) is example copy for the client to confirm.
  - blog.html: the three articles (titles, dates, excerpts) are examples
    written to show the layout; they have no full article pages yet.
  - privacy.html and terms.html: general texts that describe how this site
    actually works (contact form by email; no cookies or tracking; everything
    self-hosted).
    They do not include the company's legal name, address, VAT number,
    contact email or governing law. Have them reviewed and completed by the
    client or a lawyer before launch.

INNER PAGES
  portfolio.html, about.html, blog.html, contact.html, privacy.html and
  terms.html share the homepage header, menu, footer, fonts and colours; the menu marks the current
  page. Each opens with a dark title band (the header sits on it just as on
  the hero).
  - Portfolio: built for a growing list. Projects sit in a 3-column grid
    (2 on tablets, 1 on phones) with service filters (All / Visualization /
    Virtual Reality / Brand Strategy) that show how many projects each has,
    and a "Show more projects" button that reveals 6 at a time. Counts and
    filters update on their own; a filter with no projects is hidden.
    To add a project, copy one <li class="project-card"> block in
    portfolio.html, give it a unique id, set data-category to
    visualization, virtual-reality or brand-strategy, and update the image,
    number, service and title. Newest first is recommended. Links such as
    portfolio.html#aurora-tower (used by the homepage "View Project" buttons)
    open the right project even when it sits behind "Show more". Without
    JavaScript all projects are listed.
    Scroll motion, adapted from the Codrops demo "On-Scroll Column & Row
    Animations" (tympanus.net/Development/OnScrollColumnsRows, demo 1) and
    rebuilt in plain JavaScript (no GSAP or smooth-scroll library): while the
    grid scrolls by, each column travels a little faster than the one to its
    left, and every photo drifts inside its frame; the motion eases slightly
    behind the scroll for a gliding feel. Phones (one column) keep only the
    photo drift. Settings are COLUMN_SPEED, PHOTO_DRIFT and GLIDE in
    assets/js/main.js ("Column motion"). Switched off with "reduce motion".
  - About: its own sections, in the homepage style: studio introduction,
    "How we work" (4 steps), a full-width image, "What we deliver" (three
    service lists) and a closing band that links to the contact page.
  - Legal pages: a numbered "On this page" index that stays in view on
    desktop.
"Portfolio" and "About" currently scroll to the Selected Works and Expertise
sections on this page.

Layout matches the 1920 px reference screenshot (Homapage.png), except where
the client asked for changes:
  - Hero: a full-width background video (dark overlay, light text and logo);
    the sculpture card has been removed.
  - Selected Works: the three projects are full-screen panels instead of the
    wide + two-column layout (see PROJECT PANELS below).
  - Menu and text buttons (see MENU and TEXT BUTTONS below).
Smaller screens use responsive layouts derived from it.

HERO VIDEO
  File: assets/video/hero-sculpture.mp4 — H.264, 1920x1080, 30 fps, 12 s
  seamless loop, no audio (~1.6 MB). Poster: assets/images/hero-poster.webp.
  It was generated from the sculpture render (slow zoom, rotation and a light
  sweep); it is not a true 3D animation. To replace it, export a muted MP4
  (H.264, 1920x1080, ideally under 5 MB) with the same file name and update
  the poster image.
  Behaviour: autoplays muted and loops, pauses automatically when the hero is
  scrolled out of view, has a pause/play button (bottom right) and stays
  paused for visitors who set "reduce motion" in their operating system.
  Word swap: in "Welcome to the main act." the gold word "main" changes every
  1.5 s (main → next → star → grand → final) while "act." stays, sliding up.
  The word list is the data-swap="…" attribute on the h1 in index.html; the
  timing is SWAP_EVERY in
  assets/js/main.js ("Hero word swap"). Screen readers always read "Welcome to
  the main act.". The pause button stops the video and the word swap
  together; both also stop when the hero is off screen or with "reduce
  motion".
  Parallax: while scrolling, the video layer moves at about half the page
  speed and zooms in slightly, and the headline block drifts up and fades out.
  Tuning values are in assets/js/main.js ("Hero parallax"). Parallax is
  switched off for visitors who set "reduce motion".

PROJECT PANELS ("SELECTED WORKS")
  Adapted from the demo "On-scroll clipped sections"
  (onscroll-clipped-sections.vercel.app), rebuilt with CSS position: sticky and
  plain JavaScript (no library). Each project is a full-screen panel: a blurred
  copy of the photo as background, the photo on the left (on top below
  1024 px) and the details on the right. While the section scrolls, it stays
  pinned and each panel is wiped upwards to reveal the next; the photos follow
  the background with a short lag. Settings are in assets/js/main.js
  ("Selected works pinned panels"). With "reduce motion", or without
  JavaScript, the panels simply stack one below the other.
  Project names and tags ("Etheric Residence", "Monolith Atelier",
  "Aurora Tower") are placeholders; replace them with the real project names
  when available.

IMAGE TRAIL (FIRST PROJECT PHOTO ON THE HOMEPAGE)
  Based on the Codrops demo "Intro Image Trail Animation"
  (tympanus.net/Development/IntroTrailEffect), rebuilt in plain JavaScript.
  When the first project photo on the homepage scrolls into view, a small
  version of it appears beside it, then flies into place with a trail of 7
  copies behind it; the copies are removed once it lands. Plays once. The start point and size are set on
  the photo's wrapper with data-trail-from="centerX centerY scale"
  (fractions of the photo frame); timing is in assets/js/main.js
  ("Project image trail"). Switched off with "reduce motion".

MENU
  Desktop: the links sit in a translucent pill over the hero; the current page
  is highlighted. Below 1024 px the menu button opens a full-screen dark panel
  with large numbered links and the Contact Us button; while it is open the
  page behind it does not scroll or take keyboard focus, and Escape closes it.

PAGE MOTION
  Homepage intro (on load): the header's parts and the hero video fade in,
  the headline rises line by line, then the text, buttons and pause button
  follow. The word swap starts once the intro has finished.
  On scroll: section headings (Future Projects, Our Expertise, Echoes of
  Excellence, Ready to bring your idea on stage?) rise line by line from a
  mask; eyebrows, intro texts, quotes, buttons and the footer ease up, with a
  small stagger when several arrive together; each service opens its image,
  draws the line next to its number, then shows its title and text. The
  "VOICES" watermark drifts sideways and the glow behind the closing call to
  action breathes slowly.
  Inner pages: the page title rises from a mask on load and the rest of the
  title band eases in.
  About page: "We turn plans into places people can feel." rises word by
  word; each "How we work" step draws its line, then shows its number, title
  and text, one step after another; the full-width photo opens out from an
  inset, rounded frame as it scrolls in and drifts slightly slower than the
  page; each "What we deliver" column draws its rule and lists its items one
  by one; the closing band's title rises and its button follows.
  How to use it on new content: add data-reveal="up" to any element,
  data-reveal="words" to a heading that should rise word by word, or
  data-reveal="lines" to a heading whose lines are wrapped as
  <span class="line"><span class="line__inner">…</span></span>.
  How it works: a small inline script in each page's <head> hides the
  animated content before the first paint (class "js-reveal" on <html>), so
  content that is already on screen can animate in on load without
  flickering; main.js then reveals each element as it reaches the screen.
  Without JavaScript, with "reduce motion", or if main.js has not started
  within 3 seconds, everything is simply shown. The final layout is
  unchanged by the animations.

FOOTER (CURTAIN REVEAL)
  The footer is compact (about 360–440 px tall) and sits fixed at the bottom
  of the screen, behind the page content. At the end of every page the
  content slides up like a curtain, casting a soft shadow, and uncovers it:
  first the bottom row (copyright, links, back-to-top), then the large
  "HICIRCUS STUDIO" wordmark at the top of the footer, whose letters rise
  into place one after another (brightening to white) while it is being
  uncovered. Scrolling back up reverses it. On screens shorter than 560 px the footer scrolls normally
  (so it is never cut off). When a keyboard user tabs into the footer, the
  page scrolls to the end so the focused link is visible. The small
  "HICIRCUS" logo that used to sit in the footer was removed, as the large
  wordmark now plays that role.
  Settings: the curtain is in assets/css/main.css ("Footer"); the letter
  animation in main.css (.wordmark__char) and assets/js/main.js ("Footer
  wordmark"). The letter animation is off with "reduce motion".

HIGHLIGHT COLOUR
  Highlighted words on light backgrounds ("STAGE?" and "EXCELLENCE" on the
  homepage, "feel." on About) use terracotta #B5532F (the --accent token in
  assets/css/main.css). On dark backgrounds they stay sand/gold ("MAIN ACT."
  in the hero, "IN MIND?" on About).

TEXT BUTTONS
  "View Project" and "Explore More Projects" are underlined by default; on hover
  the text darkens and the underline redraws.

The deliberate mid-word breaks in the service title ("ARCHITECTU / RAL") come from the
reference design and apply only on screens 1024 px and wider. Below that width,
words stay whole.

All images were cropped from the reference screenshot (2x resolution). Replace
them with the original source renders for sharper results on very large screens.
The same applies to the hero video, which was made from that crop.

CHECKS PERFORMED
-----------------
[x] All image paths were checked and every referenced image exists in this folder.
[x] Unused assets were removed.
[x] Folder size confirmed below the 80 MB budget.
[x] All internal links, CSS, and JavaScript references were verified (scripts/audit_assets.py).
[x] Responsive layout checked at 1920 / 1440 / 1024 / 768 / 390 / 375 / 360 px,
    no horizontal overflow at any width.
[x] No console errors; menu (open, close, Escape, scroll lock), expertise
    buttons, project panels (checked at 1440, 1024, 768, 390 and 360 px) and
    the image trail tested; no horizontal overflow while animating.
[x] Portfolio filters, counts, "Show more", #project links and the column
    scroll motion tested (1440, 768 and 390 px; motion re-measured after
    filtering and "Show more").
[x] All 7 pages checked at 1440, 768 and 390 px: one h1 per page, no duplicate ids,
    every link between pages (including #anchors) resolves, the menu marks the
    current page, no horizontal overflow, no console errors.
[x] Footer: fits the page width, sticks behind the content and is revealed
    at the end of every page (checked at 1920, 1440, 1024, 768 and 390 px);
    keyboard focus in the footer scrolls it into view.
