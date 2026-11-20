# 0006. Events go to the dataLayer of the owner's GTM

Status: accepted

## Context

ADR 0005 allows the owner's GTM script and nothing else that tracks visitors. The owner wants to know which game cards get clicked and how long visitors look at them, through the Google Analytics that the container already loads.

## Decision

A tiny first-party script (`src/scripts/tracking.js`) pushes events into `window.dataLayer`. It adds no third-party script, request or cookie of its own. The events, their parameters and the privacy rules are in `docs/tracking-standards.md`; the markup describes what to track with `data-track-*` attributes. Consent handling (a notice, Global Privacy Control) is left for later.

## Consequences

Adding a game needs no change in the script. Which events reach Google Analytics depends on the container, which is outside this repository. A new event needs a line in the catalog and a test.
