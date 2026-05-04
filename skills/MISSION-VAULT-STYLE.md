# MISSION VAULT — Design Style Guide v2.0
# Skill: Dark Terminal (Nous Research / Hermes Agent aesthetic)
# Owner: Shon AJ / VEERABHADRA
# Updated: 5 May 2026

## Core Identity
369 Mission Vault is a local-first AI business operating system.
Design philosophy: Nous Research terminal aesthetic.
Dark deep green base. Bold condensed display type. Monospace secondary.
Technical, serious, editorial. Like a command center built for operators.

## Font Stack
--font-display: 'Barlow Condensed', sans-serif → headers, titles, numbers
--font-mono:    'Courier Prime', monospace    → labels, status, body, nav
--font-ui:      -apple-system, 'SF Pro Text' → UI elements only

Rules:
- All headings → Barlow Condensed weight 700 or 800
- All labels, status, small text → Courier Prime
- ALL CAPS for section labels and status text
- Letter spacing .15em–.25em on monospace labels
- Numbers and counts → Barlow Condensed or Courier Prime with letter-spacing: -.02em

## Colour Palette — Dark Terminal
--bg:        #0C1F16   (deep dark green — primary background)
--bg2:       #0F2419   (slightly lighter — card surfaces)
--bg3:       #142C1E   (elevated surfaces)
--card:      #0F2419
--border:    rgba(29,122,69,.2)  (green-tinted border)
--t1:        #E8DEB8   (cream — primary text)
--t2:        #B8AE90   (muted cream — secondary text)
--t3:        rgba(232,222,184,.35)  (very muted — labels)
--green:     #1D7A45   (brand green)
--green2:    #22c55e   (live / connected / success)
--red:       #C0392B   (Mission Vault red / danger / guardian)
--amber:     #d97706   (warning / Gate 1)
--blue:      #2563eb   (build / code)
--teal:      #0d9488   (RAG / knowledge)
--purple:    #7c3aed   (self-improvement)

## Status Colours
Connected / live:  #22c55e  (green2)
Warning / review:  #d97706  (amber)
Error / blocked:   #C0392B  (red)
Offline:           rgba(232,222,184,.2)

## Gate Level Colours
Gate 0 (auto):     #22c55e
Gate 1 (Shon):     #d97706
Gate 2 (Latha):    #2563eb
Gate 3 (manual):   rgba(232,222,184,.3)
Gate 4 (block):    #C0392B

## Animation Rules
369 number:        greenblink 2.5s ease-in-out infinite (opacity 1→.4)
Mission Vault:     redpulse 3.5s ease-in-out infinite (opacity 1→.6)
Live dot:          blink 2s ease-in-out infinite (opacity 1→.2)
Status indicators: same blink pattern
Never: flash, strobe, or rapid animation

## Typography Scale
Display (Barlow Condensed 800):
  Login 369:       88px
  Login title:     52px uppercase
  Dashboard H1:    32px
  Section H2:      22px

Mono labels (Courier Prime):
  Section label:   8–9px, letter-spacing .2–.25em, uppercase, opacity .35
  Status text:     9px, letter-spacing .15–.2em, uppercase
  Body:            13px, letter-spacing .04em
  Small note:      8px, letter-spacing .15em

## Card / Surface Design
background: var(--bg2) #0F2419
border: 1px solid rgba(29,122,69,.2)
border-radius: 2px (minimal — not rounded SaaS)
No drop shadows — flat surfaces only
Hover: border-color → rgba(29,122,69,.4)

## Connected State
Connected card: border-color → rgba(34,197,94,.4) (green2 tint)
Blocked card:   border-color → rgba(192,57,43,.4)  (red tint)

## Layout
Max content width: 960px centered
Gap between cards: 8px
Gap between sections: 20px
Section label margin-bottom: 10px
Tab panel padding: 0 0 40px

## Navigation
Desktop tabs: horizontal, Courier Prime, 11px, letter-spacing .1em, uppercase
Mobile tabs: bottom bar
Active: green2 dot indicator
Tab colours: each has coloured dot
  Build:        #2563eb
  Docs:         #d97706
  RAG:          #0d9488
  Connections:  #0ea5e9
  Self-Improve: #7c3aed
  Guardian:     #C0392B
  Settings:     rgba(232,222,184,.3)

## Login Page
Full dark green background — same colour inside and outside card
No card container — content floats on dark green
369: Barlow Condensed 800, 88px, green2, blinking
Mission Vault: Barlow Condensed 800, 52px uppercase, red, pulsing
Labels: Courier Prime, 8px, uppercase, spaced, muted cream
Links: Courier Prime, 13px, cream2, underline border-bottom, → arrow right
Status bar: live dot + version string, top of screen

## Voice
Every element answers: does this help the operator make a decision?
No decorative elements that carry no information.
The UI tells the truth always. No fake data, no fake counts.
Dark green = focus. Cream = information. Green = alive. Red = critical.

## Key Components

Login link row:
  flex row, gap 10px, padding 12px 0
  border-bottom 1px var(--border)
  icon 14px + label cream2 + → arrow muted right

AI Model Card:
  icon 18px + name (display font) + provider (mono t3)
  LOCAL/CLOUD badge + speed + cost
  Strengths in t3 small mono
  Install cmd in mono if not connected
  Status: ✓ Connected (green2) or ○ coming soon (muted)
  Green border when live

Data Source Row:
  icon + label + privacy badge + cloud redaction badge
  Description or fix instruction
  Allowed models in mono small
  Right: dot status + chunk count + file count

Routing Rule Row:
  Gate circle (coloured) + task type mono + reason t3
  Right: preferred model + fallback + reviewer

Hard Block:
  Red bg tint + red border + 🚫 + GATE 4 mono label

## Saved: 5 May 2026
## Version: 2.0
