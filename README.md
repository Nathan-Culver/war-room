# War Room · The Situation Room

[Play in your browser](https://nathan-culver.github.io/war-room/)

A mobile-first, unofficial browser adaptation of **War Room: A Larry Harris Game**, using the Second Edition rules with the 2025 update. Original dark Situation Room interface, a reference board map with live game overlays, and original unit symbols.

## Play

1. Choose one of five theaters and the nation(s) you control. AI handles the rest.
2. Choose Easy, Normal or Hard. Standard rules are the default.
3. Follow **What to do next** and open the **?** controls for explanations.
4. On the map, drag to pan, pinch or double tap to zoom, and tap **?** beside a control for touch-friendly instructions. The whole board fits the screen initially. Use **Save → Export JSON** to download a portable save. Import it on another phone or computer. Every decision also autosaves in the current browser; named checkpoints are separate.

All game logic runs on your device. No accounts, external AI services, API keys or paid dependencies are needed. After an initial online visit, the service worker caches the app for offline use.

## Implemented

- Global War, War in Europe, War in the Pacific, North Africa and the Eastern Front.
- 131 territories, 56 sea regions and all seven nations' 175 command-token inventories.
- Simultaneous secret orders and production; oil bidding with choice of turn rank; written-order cancellation; constrained routes; land, rail, air, naval and transport movement; pinning and forced splits; carrier fighters.
- Battle stances per unit, custom d12, alternating batches, simultaneous stage strengths, one Air and Surface stage per round, Force/Port Advantage, escorts, garrisons, damage, repairs and submarine dives.
- Strategic bombing, convoy raids, construction capture and capacity loss, delayed deployment, Chinese mobilization, trade, medals, casualty conversion, cumulative homeland penalties, collapse and scenario victory.
- Optional Force Advantage batch caps, long-range landings, bomb repairs, both Take Her Down mechanisms and the official six-round limit.
- Easy/Normal/Hard heuristic AI with equal resources and rules; local multi-nation control, autosaves, checkpoints, file export/import, undo, contextual help and an operations journal.

## Status

**Playable alpha. Not a certified exact reproduction of every rule and asset.** The map uses the printed board reference; unit icons remain original vector graphics. Rare compound Soviet–Japanese pact encounters still need additional rules work; see [sources and known limitations](docs/SOURCES.md). Quick Play and Quick Battle are simplified optional variants and are not substituted for standard rules.

## Development

Node 22+ is sufficient; no dependency installation is needed.

```sh
npm test
npm run build
WAR_ROOM_LIMITED=1 node tests/full-games.mjs
```

Serve the repository root or `dist/` over HTTP. GitHub Pages serves `main` at the root. `components.json` and `command-inventory.json` preserve the factual transcription; `data.js` embeds them for browser compatibility.

The rulebook, physical game and original game artwork belong to their respective creators/publisher. This project is unaffiliated with Nightingale Games. See [source credits](docs/SOURCES.md).
