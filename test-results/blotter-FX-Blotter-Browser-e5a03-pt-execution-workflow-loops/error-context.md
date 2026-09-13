# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: blotter.spec.ts >> FX Blotter Browser Pipeline Validations >> 8. Page loads correctly, applies filters, and completes full accept execution workflow loops
- Location: tests/blotter.spec.ts:9:5

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: locator('.app-header h2')
Expected: "FX Option Live Quote Blotter"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveText" with timeout 5000ms
  - waiting for locator('.app-header h2')

```

```yaml
- link "Skip to content":
  - /url: "#main"
- banner:
  - link "domg.o home":
    - /url: "#top"
    - text: domg.o
  - navigation "Site":
    - list:
      - listitem:
        - link "About":
          - /url: "#about"
      - listitem:
        - link "Community":
          - /url: "#community"
      - listitem:
        - link "Brand work":
          - /url: "#work"
      - listitem:
        - link "Contact":
          - /url: "#contact"
  - link "Open to work":
    - /url: "#contact"
- main:
  - link "Open to work · booking now":
    - /url: "#contact"
  - paragraph: Creator media kit · @domg.o · UK
  - heading "I built a student community. Now we're going to work." [level=1]
  - paragraph:
    - text: I've built a strong community of students, aspiring workers and those already in work. My personality is
    - strong: funny, witty and direct
    - text: — and that community comes with me, from uni life into work. 90K+ followers and 19.2M+ campaign views.
  - link "See the campaigns":
    - /url: "#work"
  - link "About Dom":
    - /url: "#about"
  - complementary "Creator results statement":
    - paragraph: Statement of results
    - paragraph: "CANDIDATE: DOM · CREATOR STUDIES"
    - text: FOLLOWERS 90,846 CAMPAIGN VIEWS 19,243,900 BEST TIKTOK · RAINS 6.1M BEST REEL · UNIDAYS 1.7M OVERALL GRADE DISTINCTION STATUS STUDENT → WORK RESIT REQUIRED NO A* VERIFIED
    - paragraph: ORGANIC & PAID · FULL TRANSCRIPT ON REQUEST
  - region "Brands I have worked with": UNIDAYS CURRYS ACER TACO BELL DAIU COVENTRY FINAL ROUND AI RYMAN C4 ENERGY
  - img "Dom, creator behind @domg.o"
  - link "Let's work together →":
    - /url: "#contact"
  - paragraph: About
  - heading "The personality behind the feed." [level=2]
  - blockquote: “I'm @domg.o, a relatable, personable content creator taking you through my life, from the ups and downs of each stage.”
  - paragraph:
    - text: My personality is
    - strong: funny, witty and direct
    - text: . I often say what people don't want to say, and that's what brings people back to relate to the experiences we all go through.
  - paragraph: "I take an audience-first approach: I create briefs that my fans, and yours, actually want to see. My community comes with me everywhere: through uni life and now into work permanently for the first time."
  - text: Open to representation
  - link "@domg.0 · Instagram":
    - /url: https://www.instagram.com/domg.0/
  - link "@domg.o · TikTok":
    - /url: https://www.tiktok.com/@domg.o
  - link "@domg.o · YouTube":
    - /url: https://www.youtube.com/@domg.o
  - paragraph: The community
  - heading "One audience, two eras." [level=2]
  - paragraph: "Students, aspiring workers and those already in work: a community built over years and growing stronger."
  - text: The foundation
  - heading "The student era" [level=3]
  - list:
    - listitem: → Relatable, everyday uni-life videos
    - listitem: → Internship stories and behind-the-scenes
    - listitem: → Student discounts and deals, incl. repeat Unidays work
    - listitem: → Budget challenges and cheapest-vs-most-expensive formats
  - text: Now building
  - heading "The graduate era" [level=3]
  - list:
    - listitem: "→ Going to work for the first time: new routine, new nerves"
    - listitem: → Trying new hobbies now there’s time (and money) for them
    - listitem: → Budgeting on a first salary, and what actually changes
    - listitem: → The same honesty, now with real money on the line
  - paragraph:
    - strong: "Why this matters for brands:"
    - text: the audience stayed for the personality, not just the deals. That makes this a natural fit for finance, fashion, tech, food & drink and career brands.
  - paragraph: Engagement snapshot · TikTok & Instagram
  - heading "Straight from the app." [level=2]
  - paragraph: Pulled directly from platform analytics, no rounding up.
  - paragraph: TikTok
  - strong: 72,468
  - text: Followers
  - strong: 4.2M
  - text: Total likes
  - strong: 58K
  - text: Avg. likes per post
  - strong: 5.8%
  - text: Avg. engagement rate
  - strong: 5.2M
  - text: Interactions
  - paragraph: Instagram
  - strong: 18,378
  - text: Followers
  - strong: 17.4K
  - text: Avg. likes per post
  - strong: 6.4%
  - text: Avg. engagement rate
  - strong: 592K
  - text: Interactions
  - strong: "340"
  - text: Total posts
  - heading "Age range · TikTok" [level=3]
  - text: 18–24 48.5% 25–34 37.4% 35–44 8.1% 45+ 6%
  - heading "Age range · Instagram" [level=3]
  - text: 18–24 55.9% 25–34 28.6% 35–44 6.8% 45+ 6.4%
  - heading "Top locations · TikTok" [level=3]
  - text: United Kingdom 44.2% United States 8.7% Canada 2.3%
  - heading "Top locations · Instagram" [level=3]
  - text: United Kingdom 48% United States 11.3% Canada 3.1%
  - paragraph: Full breakdown by gender, hourly activity and platform available on request.
  - paragraph: Brand work
  - heading "The results." [level=2]
  - article:
    - button "View details for Rains":
      - img "Rains"
      - text: +
      - paragraph: Outerwear · TikTok
      - heading "Rains" [level=3]
      - strong: 11M
      - text: views · organic + UGC, 3 videos
      - paragraph: Fashion and UGC content for the Danish rainwear brand.
      - text: UGC + organic
  - article:
    - button "View details for The Intern":
      - img "The Intern"
      - text: +
      - paragraph: TV & broadcast · Channel 4.0
      - heading "The Intern" [level=3]
      - paragraph: Cast on Channel 4.0’s The Intern alongside Nella, Chloe and HP.
      - text: TV feature
  - article:
    - button "View details for “Fed Up” With Rejections":
      - img "“Fed Up” With Rejections"
      - text: +
      - paragraph: Press · Newsweek
      - heading "“Fed Up” With Rejections" [level=3]
      - strong: 3.6M
      - text: views · 392K likes on featured TikTok
      - paragraph: Interviewed by Newsweek after a job-interview TikTok went viral.
      - text: Press feature
  - article:
    - button "View details for Unidays":
      - img "Unidays"
      - text: +
      - paragraph: Student discounts · Instagram & TikTok
      - heading "Unidays" [level=3]
      - strong: 2.4M
      - text: views across 6 posts
      - paragraph: Repeat work with the student discount platform, right in front of the exact audience I built.
      - text: Collaboration
  - article:
    - button "View details for Daiu Coventry":
      - img "Daiu Coventry"
      - text: +
      - paragraph: Local spotlight · IG + TikTok
      - heading "Daiu Coventry" [level=3]
      - strong: 1.9M
      - text: combined views · both platforms
      - paragraph: An organic spotlight on a Coventry local that landed on both platforms.
      - text: Organic
  - article:
    - button "View details for Taco Bell UK":
      - img "Taco Bell UK"
      - text: +
      - paragraph: QSR · TikTok takeover
      - heading "Taco Bell UK" [level=3]
      - strong: 160K
      - text: views · 16K+ likes
      - paragraph: "Ran the Taco Bell UK TikTok for a day: BTS, store visits and staff takeovers."
      - text: Account takeover
  - article:
    - button "View details for Final Round AI":
      - img "Final Round AI"
      - text: +
      - paragraph: Career tech · TikTok
      - heading "Final Round AI" [level=3]
      - strong: 190K
      - text: views · paid partnership
      - paragraph: Career-tech sponsored content that landed with the graduate audience.
      - text: Sponsored video
  - article:
    - button "View details for Currys × Acer":
      - img "Currys × Acer"
      - text: +
      - paragraph: Tech · TikTok & Instagram
      - heading "Currys × Acer" [level=3]
      - paragraph: A tech partnership and the first step into a category I’m actively growing.
      - text: Sponsored
  - article:
    - button "View details for Can 5 Students Agree?":
      - img "Can 5 Students Agree?"
      - text: +
      - paragraph: Panel show · Make It Common
      - heading "Can 5 Students Agree?" [level=3]
      - paragraph: Cast on Make It Common's group discussion format, alongside four other students, tackling questions and seeing where the group lands.
      - text: Panel guest
  - paragraph: Contact
  - heading "Let's make the grade." [level=2]
  - paragraph: For brand partnerships, campaigns and talent representation. I reply fastest by email, with full analytics and audience breakdowns available on request.
  - link "Email · dominicgoofficial@gmail.com":
    - /url: mailto:dominicgoofficial@gmail.com
  - link "Instagram":
    - /url: https://instagram.com
  - link "Tiktok":
    - /url: https://tiktok.com
  - link "Youtube":
    - /url: https://youtube.com
  - link "Snapchat":
    - /url: https://snapchat.com
  - paragraph: Currently open to talent representation
  - paragraph: Contact
  - heading "Let's make the grade." [level=2]
  - paragraph: For brand partnerships, campaigns and talent representation. I reply fastest by email, with full analytics and audience breakdowns available on request.
  - link "Email · dominicgoofficial@gmail.com":
    - /url: mailto:dominicgoofficial@gmail.com
  - link "Instagram":
    - /url: https://www.instagram.com/domg.0/
  - link "TikTok":
    - /url: https://www.tiktok.com/@domg.o
  - link "YouTube":
    - /url: https://www.youtube.com/@domg.o
  - link "Snapchat":
    - /url: https://www.snapchat.com/add/domg.o
  - paragraph: Currently open to talent representation
- contentinfo: © 2026 Dom · @domg.o · UK Open to talent representation
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('FX Blotter Browser Pipeline Validations', () => {
  4  |     test.beforeEach(async ({ page }) => {
  5  |         // Navigate straight to your active local development build address
  6  |         await page.goto('http://localhost:5173/');
  7  |     });
  8  | 
  9  |     test('8. Page loads correctly, applies filters, and completes full accept execution workflow loops', async ({ page }) => {
  10 |         // A. Prove layout header mounts successfully
  11 |         const mainTitle = page.locator('.app-header h2');
> 12 |         await expect(mainTitle).toHaveText('FX Option Live Quote Blotter');
     |                                 ^ Error: expect(locator).toHaveText(expected) failed
  13 |         
  14 |         // B. Select the first actionable quote row button that is not locked
  15 |         const actionableButton = page.locator('.rfq-row button:not([disabled])').first();
  16 |         await expect(actionableButton).toBeVisible();
  17 |         await actionableButton.click();
  18 | 
  19 |         // C. Confirm accessibility dialog focus layer triggers
  20 |         const dialogOverlayHeader = page.locator('#modal-title');
  21 |         await expect(dialogOverlayHeader).toHaveText('Confirm Trade Execution', { ignoreCase: true });
  22 | 
  23 |         // D. Fire server execute mock promise action
  24 |         await page.click('.btn-primary');
  25 | 
  26 |         // E. Assert that success context banners update dynamically onto the interface view screen
  27 |         const successToastAlert = page.locator('.notification-banner.success');
  28 |         await expect(successToastAlert).toBeVisible();
  29 |         await expect(successToastAlert).toContainText('Successfully executed trade');
  30 |     });
  31 | });
```