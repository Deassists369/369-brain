# Design System — DeAssists Portal

# Last updated: 27 April 2026

# Source file: apps/cms-next/styles/crmTokens.ts

## THE RULE

Never hardcode hex values. Always use crmTokens.

import { crmTokens } from '../../styles/crmTokens';

## TYPOGRAPHY

Headlines/page titles:  Fraunces serif, 700 weight — crmTokens.fontDisplay

Body, inputs, labels:   Outfit sans-serif — crmTokens.fontBody

Page title size:        28px, weight 700

Section labels:         11px, weight 600, UPPERCASE, letter-spacing 0.08em

Labels:                 Always ABOVE fields — never placeholder-only

## COLOUR TOKENS

crmTokens.g    #1D7A45  Primary green

crmTokens.gl   #2a9458  Green hover state

crmTokens.gx   #e8f5ee  Green light background (selected rows, highlights)

crmTokens.gxx  #d0ecda  Green border

crmTokens.dk   #0d1a10  Darkest (panel headers)

crmTokens.dk2  #1a3d26  Dark medium (lighter panel headers)

crmTokens.am   #c47b00  Amber

crmTokens.aml  #fff8ee  Amber light background

crmTokens.cr   #F6F7F4  Cream (page background — never pure white)

crmTokens.wh   #ffffff  White (card and panel backgrounds)

crmTokens.t1   #1a1a1a  Primary text

crmTokens.t2   #4a4a4a  Secondary text

crmTokens.t3   #888888  Tertiary text / muted

crmTokens.t4   #bbbbbb  Disabled / placeholder

crmTokens.bd   #e5e5e0  Border

crmTokens.bdd  #d0d0c8  Border dark

crmTokens.red  #c62828  Red — destructive actions only

crmTokens.blu  #1565c0  Blue — informational

crmTokens.blul #e8f0fd  Blue light background

## SEMANTIC COLOUR LANGUAGE — LOCKED 16 APRIL 2026

Green  = positive, active, total counts, constructive actions

Amber  = needs attention, open items, warnings

Grey   = done, quiet, closed, inactive

Red    = destructive actions ONLY: Sign Out, Delete, Remove

Never use red for information. Never use green for warnings.

## CARDS

No box shadow — flat design only

1px border: crmTokens.bd

Border radius: crmTokens.r2 (10px)

No emojis. No unicode symbols. No other icon libraries.

18px inline, 20px section headers, 24px page actions

## BORDER RADIUS TOKENS

crmTokens.r1 = 6px   inputs, chips, small controls

crmTokens.r2 = 10px  cards, panels

crmTokens.r3 = 14px  modals

crmTokens.r4 = 20px  pill badges

## 4 DATA STATES — EVERY COMPONENT HANDLES ALL FOUR

Loading:   CircularProgress size 24-28, color crmTokens.g, centered

Empty:     Icon + message text + optional CTA button

Error:     Visible error message in red — never blank screen, never console-only

Populated: Normal data display

## STATUS BADGE COLOURS (from crmTokens.ts statusBadgeColors)

New:       green bg #e8f5ee, green text #1D7A45

Follow Up: amber bg #fff8ee, amber text #c47b00

Called 1-3: blue bg #e8f0fd, blue text #1565c0

Converted: green bg #ecfdf5, dark green text #065f46

Lost:      red bg #fef2f2, red text #c62828
