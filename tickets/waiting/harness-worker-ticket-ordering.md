# Ticket: harness-worker-ticket-ordering
Priority: MEDIUM — reliability

## Problem
Worker picks tickets in filesystem order not priority order.
On Mac filesystem order is unpredictable.
Low priority tickets get picked before high priority ones.

## Fix
In harness-worker.js, when scanning tickets/open/:
1. Read all ticket files
2. Parse priority from first lines (CRITICAL, HIGH, MEDIUM, LOW)
3. Sort: CRITICAL first, then HIGH, then MEDIUM, then LOW
4. Within same priority: sort alphabetically
5. Pick the first ticket in sorted order

## Result
CRITICAL tickets always run before HIGH.
HIGH always before MEDIUM.
Predictable. Correct. No surprises.
