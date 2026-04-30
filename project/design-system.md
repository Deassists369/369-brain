# Design System — DeAssists Portal
# Source file: apps/cms-next/styles/crmTokens.ts
# Currency verified via git log — not by date in this file

## THE RULE
Never hardcode hex values. Always use crmTokens.
import { crmTokens } from '../../styles/crmTokens';

## TYPOGRAPHY
Headlines/page titles:  Fraunces serif, 700 weight — crmTokens.fontDisplay
Body, inputs, labels:   Outfit sans-serif — crmTokens.fontBody
Internal pages:         Outfit only — Fraunces is display/marketing only
Page title size:        28px, weight 700
Section labels:         11px, weight 600, UPPERCASE, letter-spacing 0.08em
Labels:                 Always ABOVE fields — never placeholder-only

## COLOUR TOKENS (updated 30 April 2026 — EAGLE v2.1 Task 1)
crmTokens.g    #1D7A45  Primary green
crmTokens.gl   #2a9458  Green hover state
crmTokens.gx   #e8f5ee  Green light background (selected rows, highlights)
crmTokens.gxx  #d0ecda  Green border
crmTokens.dk   #0d1a10  Darkest (panel headers)
crmTokens.dk2  #1a3d26  Dark medium (lighter panel headers)
crmTokens.am   #F59E0B  Amber — was #c47b00
crmTokens.aml  #fff8ee  Amber light background
crmTokens.cr   #F6F7F4  Cream (page background — never pure white)
crmTokens.wh   #ffffff  White (card and panel backgrounds)
crmTokens.t1   #0d1a10  Primary text — was #1a1a1a
crmTokens.t2   #1a3d26  Secondary text — was #4a4a4a
crmTokens.t3   #4a7c59  Tertiary text / muted — was #888888
crmTokens.t4   #bbbbbb  Disabled / placeholder
crmTokens.bd   #E1EBE3  Border — was #e5e5e0
crmTokens.bdd  #d0d0c8  Border dark
crmTokens.red  #EF4444  Red — destructive actions only — was #c62828
crmTokens.blu  #3B82F6  Blue — informational — was #1565c0
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

## BORDER RADIUS TOKENS (updated 30 April 2026)
crmTokens.r1 = 8px   inputs, chips, small controls — was 6px
crmTokens.r2 = 10px  cards, panels
crmTokens.r3 = 12px  modals — was 14px
crmTokens.r4 = 20px  pill badges

## 4 DATA STATES — EVERY COMPONENT HANDLES ALL FOUR
Loading:   CircularProgress size 24-28, color crmTokens.g, centered
Empty:     Icon + message text + optional CTA button
Error:     Visible error message in red — never blank screen, never console-only
Populated: Normal data display

## STATUS BADGE COLOURS (updated 30 April 2026)
New:        green bg #e8f5ee, green text #1D7A45
Follow Up:  amber bg #fff8ee, amber text #F59E0B
Called 1-3: blue bg #e8f0fd, blue text #3B82F6
Converted:  green bg #ecfdf5, dark green text #065f46
Lost:       red bg #fef2f2, red text #EF4444
