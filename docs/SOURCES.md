# Sources, verification and remaining work

This is an unofficial playable alpha, not a claim of exhaustive certified rules parity. It uses original browser code, original vector unit icons and an original dark map rendering. It does not redistribute scans of the physical cards, miniature models, board artwork or the complete rulebook.

## Primary references

- [Nightingale Games: War Room](https://nightingale-games.com/war-room).
- [Second Edition rulebook, 2025 update, revision 3-28-2025](https://assets.zyrosite.com/mP4OXVj9X9Uo8qz1/wr_rules_2nd_edition_v27u-compressed-zgP83u8h9WHYTKgK.pdf). Baseline for movement, phases, full battle-board values, production prices, morale, diplomacy, scenarios and optional rules.
- [Publisher-authorized Tabletop Simulator reference](https://steamcommunity.com/sharedfiles/filedetails/?id=2419016456), credited there to jotakami, tomgale and shershot. Used as a factual component reference for 187 region boundaries/identifiers, names, adjacency, rail/port/passage annotations, resources, reduced income, factories, mobilization, convoys, setup, scenario coverage and command inventories. Simulator executable/implementation scripts are not included or reused in this browser engine.
- [Publisher's V2 upgrade notes](https://shop.nightingale-games.com/products/v-upgrade-kit): the world map did not change; Sicily starts with one infantry; sticker sheets include spares and should not define token limits.
- Italy territory card reference from the authorized digital components confirms the 115th command starts in **Balkans (T2)**, not Sicily. This corrects a region-label typo in the digital setup table. Its printed position was already in T2. The remaining setup positions were checked against their region geometry.

## Data adjustments and rules decisions

- Sicily's 112th command has one infantry, following the publisher's second-edition correction.
- Italy's 115th command is in T2, confirmed against the printed Balkans card.
- Eleven one-sided adjacency omissions in the digital reference are made bidirectional, preserving each existing link annotation. This includes the rulebook's explicit Italy–Sicily adjacency. No new territory or sea region is invented.
- The 2025 printed **Cruiser cost is 2 oil / 3 iron / 1 OSR**; the older digital reference's 2 OSR value is not used.
- Embattled income follows the component reference's card values: reduce the first present resource in oil/iron/OSR order by one. This matches the inspected card backs; it is not a generic percentage reduction.
- Carrier fighters remain through Combat and are removed in Refit, following the explicit instructions on pp18 and20. The short p11 summary conflicts with these pages.
- Unit pieces and counters are virtual and unlimited where the rules allow substitutes. National command tokens retain their exact limits. No artificial nine-round cap or simplified repeat-to-destruction combat is used.
- Each strategic bomber resolves its own roll; one raid remains subject to the thirty-dice cap. Surface dice are totaled before casualties from that stage, and submarines escape only after a full enemy batch.
- AI, guidance, undo and portable saves are digital features, not additional official board-game rules.

## Verification

`npm test` checks the component graph, setup corrections, bidding, rail and pact movement, transport/naval pinning, narrow passages, intermediate-region forced splits and loops, construction delay, China, fixed combat strength, damaged rows, wild/white rules, submarine dives, morale conversion, capitals, save round trips, malformed saves, air splitting and a complete standard Eastern Front AI game.

`tests/full-games.mjs` exercises five scenarios at three AI levels. With `WAR_ROOM_LIMITED=1`, all games must reach a terminal result within the official six-round variant. Additional no-cap simulations exercise longer standard games. The optional six-round rule is off by default. Some AI-versus-AI standard games can stalemate; there is no artificial concession or hidden victory timer. Results are recorded as data, including unfinished simulations at the test harness safety bound.

Browser QA covers desktop and 390px phone layouts, map selection, order entry, sealing, bid resolution, tap help, dialogs, local checkpoints and portable file controls. Device-specific browsers and a physical-game playtest remain additional validation work.

## Known limitations requiring further work

1. **Compound pact battles/raids:** when Japan and the Soviet Union coexist with other opposing nations in one region while their pact is active, the rules may require separate sequential encounters with different participants. The current alliance battle grouping does not fully partition these rare encounters. Basic pact movement, neutral-entry restrictions, optional breaking, penalties, dissolution and ordinary convoy/port restrictions are enforced. This gap prevents an exact-fidelity claim.
2. **Neutral defense assignment:** an allied commander is selected using turn rank initially; surviving neutral forces become the defending battle commander's nation. There is no separate pre-battle negotiation screen for choosing any aligned nation's officer.
3. **Shared convoy coordination:** shared Axis endpoint liability is selectable in region intelligence, but compound multinational raids involving a still-active Soviet–Japanese pact need the same participant partition work as item1.
4. **AI strategy:** local heuristic opponents, not a trained War Room expert. Hard uses stronger threat/combined-arms preferences; it does not promise expert competitive strength. Long ocean campaigns can stall. AI never reads an opponent's sealed orders or production plan.
5. **Physical assets and optional variants:** the UI uses functional original representations, not exact photographic assets. The Quick Play and Quick Battle variants, simultaneous physical battle-board handling and officer-role administration are not alternative automated modes in this build. Standard combat and the listed advanced toggles remain available.
6. **Verification:** digital component facts have not been audited face-by-face against a current physical set. No publisher endorsement or certification is implied. Save format v1 is intended for this build; future migrations need explicit handling.

These are recorded implementation gaps, not replacement house rules. The project should not be described as a comprehensive, precise copy of every mechanism and asset until they are resolved and independently playtested.
