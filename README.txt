PROJECT: HiCircus Studio — website
ENTRY FILE: index.html

DESIGN SYSTEM
-------------
The site follows the client's design system brief (hicircus-design-spec.pdf,
v1.0, October 2026). Every value lives in the --hc-* tokens at the top of
assets/css/main.css — change a token, not a hex value in a rule.

  Colour      page #0D0D0D, panel #1A1A1A, card #242424, border #2E2E2E,
              text cream #F0E6CC, accent amber gold #C9A84C, muted #888888,
              red #E8341A (call-to-action buttons only).
              Cream is for text, never for backgrounds; no pure white, no
              pure black in shadows.
  Type        Playfair Display (headlines, italic gold accent),
              Bebas Neue (labels, navigation, numbers),
              DM Mono (body copy, captions).
  Gold bands  The call-to-action sections and the About statement have a
              solid gold (#C9A84C) background with near-black text; the
              brief says gold is an accent only, so confirm with the client.
  Shape       border-radius 0 everywhere.
  Motion      one orchestrated page-load sequence (title rises, lead and
              actions ease in). No scroll-triggered fade-ins, no hover
              animation on cards. Motion answers an action: the mobile menu,
              the portfolio filters, the pause button, the contact form.
              Scroll-linked exceptions, all requested by the agency (the
              client's brief asks for none): the Manifesto lights the line
              being read (main.js, "Manifesto"); the Selected Works panels
              stack, each sliding over the previous one (pure CSS
              position: sticky, off below 1024 px); and the footer is revealed
              like a curtain at the end of every page while the big wordmark's
              letters rise into place (main.css "Footer", main.js "Footer
              wordmark"). With "reduce motion" the manifesto stays lit and
              the footer wordmark is static.
  Width       1440 px container for grids and media; the 960 px token
              (--hc-max-width) is the reading measure for statements,
              the manifesto, articles and headings blocks.

Deliberate deviations from the brief (to confirm with the client):
  - Body text is 15 px (the brief says 12-13 px, which read too small in DM
    Mono), long-form copy is 16 px, leads 17 px, form fields 16 px.
  - Metadata text uses #888888, not #555555 (which is too faint to read).
  - Primary button: red background with near-black text (cream on that red
    does not reach contrast AA for small text).
  - Fonts are self-hosted, not loaded through the @import in the brief
    (faster, and no visitor data goes to Google).
  - Greek glyphs: the three families are Latin-only subsets; Playfair Display
    has no Greek. Greek pages will need a Greek-capable fallback.

STRUCTURE
---------
index.html                 Homepage: hero (reel only), intro (headline + lead),
                           manifesto, selected works
                           (3 project panels), "No Specialty" expertise list
                           (5 mediums), Brand DNA, testimonials, call to
                           action, footer
portfolio.html             Portfolio: project grid with filters
etheric-residence.html     Project detail page (the one project with real photos)
about.html                 About: studio intro, approach, "what we deliver",
                           full-width image, closing band
architecture.html, products.html, motion.html, immersive.html,
ai-visualization.html     Service detail pages
blog.html                  Journal listing
why-we-render-at-dusk.html, walking-through-a-space-before-it-is-built.html,
one-visual-language-from-render-to-brochure.html   Journal articles
pricing.html               Pricing: Per Project vs Credit Bank (process/terms
                           only, no € figures)
contact.html               Enquiry form (every "Contact Us" button links here)
contact.php                Sends the form by email (needs PHP, see below)
privacy.html, terms.html   Legal texts
favicon.ico, robots.txt
assets/css/main.css        All styles (tokens, layout, responsive rules)
assets/js/main.js          Mobile menu + sticky header, back-to-top, hero video
                           pause, portfolio filters, contact form, expertise
                           previous/next
assets/fonts/              Playfair Display (normal + italic, variable),
                           Bebas Neue, DM Mono 300/400/500 — WOFF2, Latin
assets/images/             Logo (SVG), hero poster, project photos, service images.
                           All but the hero poster were upscaled 4x with
                           Real-ESRGAN (x4plus) and resampled to 1024-3360 px
                           wide. The originals are in the git history; the
                           "night" render is a blocky source and only gets
                           cleaner edges. Send the original renders if they
                           exist: no upscaler can add real detail.
assets/video/              hero-reel.mp4 (desktop, 16:9) + hero-reel-mobile.mp4
                           (phones, vertical 9:16), H.264, ~23 s each

DEPLOYMENT NOTE — STAGING
--------------------------
This build is on staging.hicircus.com for client review (Plesk Git deploy from
the GitHub main branch).
  - robots.txt is "Disallow: /" so search engines stay out. When the site moves
    to the production domain, change it back to "User-agent: *  /  Allow: /",
    and add a sitemap.xml and canonical/Open Graph tags.

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

SERVER REQUIREMENTS
--------------------
Any standard hosting — Apache, Nginx, Plesk, cPanel, or any FTP host. No build
step and no Node.js. All pages are static HTML; only the contact form needs
PHP 7.4 or newer with mail() enabled. Upload this folder's contents to the web
root (or a subdirectory — all paths are relative).

FONTS
-----
Playfair Display, Bebas Neue and DM Mono (all SIL Open Font License), served
from assets/fonts as WOFF2, Latin subset:
  playfair-display-normal.woff2   400–900 (variable)
  playfair-display-italic.woff2   400–900 (variable)
  bebas-neue.woff2                400
  dm-mono-light.woff2             300
  dm-mono-regular.woff2           400
  dm-mono-medium.woff2            500

CONTENT STATUS
--------------
Positioning is "No Specialty" — an idea-led studio ("One Wheel. Every World.").
Copy taken from the client's brand material: the hero line and lead, the
manifesto, Brand DNA, and the "idea leads, the medium follows" expertise intro.

Still to do before launch:
  - contact.php: the RECIPIENT email address.
  - Footer social links: Instagram, Facebook, LinkedIn, YouTube and TikTok point
    to the @hicircus.studio profiles; confirm they are the real accounts.
  - Contact details: the client's brief says "Athens · hicircus.studio" while
    the site lives on hicircus.com. Confirm the domain.

Placeholder content to replace:
  - Project names and tags (index.html and portfolio.html). portfolio.html
    lists 7 example projects; the last four reuse the hero poster and the
    expertise images — replace them with real project photos.
  - Testimonials on the homepage are example quotes written for an
    architectural-visualization studio; replace them with real client quotes.
  - Service pages, About "What we deliver" and the three journal articles are
    still written from the earlier architectural-visualization positioning.
  - privacy.html and terms.html are general texts. They do not include the
    company's legal name, address, VAT number, contact email or governing law;
    have them reviewed and completed before launch.

PORTFOLIO
---------
Built for a growing list: a 3-column grid (2 on tablets, 1 on phones) with
service filters (All / Visualization / Virtual Reality / Brand Strategy) that
show how many projects each has, and a "Show more projects" button that
reveals 6 at a time. Counts and filters update on their own; a filter with no
projects is hidden. Without JavaScript all projects are listed.

To add a project, copy one <li class="project-card"> block in portfolio.html,
give it a unique id, set data-category to visualization, virtual-reality or
brand-strategy, and update the image, number, service and title. Links such as
portfolio.html#aurora-tower (used by the homepage "View Project" buttons) open
the right project even when it sits behind "Show more".

HERO VIDEO
----------
File: assets/video/hero-reel.mp4 (H.264, 1920x1080, 30 fps, 22.5 s, ~4 MB, audio
removed), supplied by the studio as a brand reel (Hi. / Stop moving and you
fall / 3D / Motion / AI / The idea leads / logo). Poster:
assets/images/hero-poster.webp (frame at 0.6 s). The reel has its own text, so
it is shown uncropped (16:9) under the header with no copy of ours on top
(the headline and lead sit in the "intro" section right below it) and a flat
black 25% mask (.hero__shade in main.css). Phones (up to 767 px)
load hero-reel-mobile.mp4 (vertical, 720x1280, ~2.5 MB) and its own poster,
chosen in main.js, so only one file is downloaded. To replace either, export
a muted MP4 with the same name.
Behaviour: autoplays muted and loops, pauses automatically when the hero is
scrolled out of view, has a pause/play button (bottom right) and stays paused
for visitors who set "reduce motion" in their operating system.

MENU
----
Desktop: Bebas links in the header; the current page has a gold underline.
Below 1024 px the menu button opens a full-screen dark panel with large
numbered links and the Contact Us button; while it is open the page behind it
does not scroll or take keyboard focus, and Escape closes it.

CHECKS PERFORMED
-----------------
[x] All 373 internal references (links, images, fonts, video) resolve.
[x] No horizontal overflow at 375 px on any of the 17 pages.
[x] Display text (22 px and up) uses Playfair / Bebas on the 8 pages sampled
    (home, portfolio, project, service, blog, article, terms).
[x] Mobile menu, portfolio filters, counts and "Show more" tested.
