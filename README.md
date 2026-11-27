[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/hioraeriska/turkey-run-game/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard)
[![reward](https://make.fun/badge/turkey-run-game-01/hioraeriska/turkey-run-game/reward.svg)](https://make.fun/bounty/turkey-run-game-01)

# Turkey Run — Escape Thanksgiving

A complete turkey escape game that plays offline in a desktop browser from
its own files. You are Gus the turkey. It is Thanksgiving morning, the
farmer is coming for you with his carving knife, and the farmhouse oven is
already hot. Run 1000 metres to the pine forest and you are free. Trip up
three times and you are dinner.

## How to play

- **Run:** the turkey runs on its own. Your job is the timing.
- **Jump:** `Space`, `ArrowUp`, `W`, or click / tap — hop the hay bales, the
  brick oven, and the spinning knives.
- **Duck:** `ArrowDown` or `S` — slide under the flying carving knives.
- **Pick up corn** (+50) and the rare golden feather (+150) on the way.
- **The farmer** gains on you every time you stumble. Three stumbles and he
  catches you. Reach the pines at 1000 m to escape.
- `P` pauses, `M` mutes the sounds, `R` restarts after an ending.

## Run it

Open `game/index.html` in desktop Chrome, or serve the folder and open
`http://localhost:8080/game/`:

```sh
python3 -m http.server 8080
```

No network, no build step, no dependencies — plain HTML, CSS and JavaScript
on a canvas, with sounds synthesised in the browser.

## What is in here

- `main.ts` — the entrypoint: copies `game/` and `screenshots/` into the
  output directory and writes `dossier.json` with the kit's
  `vendor/makefun-game.ts`.
- `game/` — the playable game: `index.html` plus one clear job per script
  under `game/src/` (tuning, seeded random, sounds, input, world rules,
  drawing, screenshot states, the loop).
- `screenshots/` — four real renders of the game's own code: title screen,
  a run in play, a jump over the oven, and the caught end screen.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.

Made for the make.fun bounty
[turkey-run-game-01](https://make.fun/bounty/turkey-run-game-01).
