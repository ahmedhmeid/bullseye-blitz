# 🎯 Bullseye Blitz

A 3D paintball sniper game that runs entirely in your browser. There's no server and no database, and all progress is saved in your browser's `localStorage`.

## How to play

- **Paintball the bullseyes** before they disappear. Each one gives **+1 point** and **+1 coin**.
- **Watch out for trick bullseyes** with *your avatar's face* in the middle. Hitting one costs **−1 point**.
  If you hit one while you have **0 points**, you're sent back to the home page.
- Missing a bullseye (letting it disappear) costs nothing.
- Reach the world's goal to clear it. **Your score resets to 0 in each new world.**
- Clearing a world gives **100 coins**, and clearing World 5 gives **1000 coins**.

### Controls

| | Computer | Phone / tablet |
|---|---|---|
| Aim | Click the world once, then move the mouse | Drag |
| Shoot | Left click | Tap, or the **Fire** button |
| Scope | Hold right-click, or press Space | 🔭 button |
| Pause | Esc or P | ❚❚ button |

### Points needed per world

| Difficulty  | W1  | W2  | W3  | W4  | W5   |
|-------------|-----|-----|-----|-----|------|
| Easy        | 50  | 75  | 100 | 150 | 200  |
| Medium      | 150 | 175 | 200 | 250 | 300  |
| Hard        | 250 | 275 | 300 | 350 | 400  |
| Impossible  | 350 | 375 | 400 | 450 | 500  |

Higher difficulties also make targets faster, shorter-lived and more often tricks.

### Worlds

1. The Hot Sahara
2. Underwater Adventures
3. Computer Crazies
4. Astronomy Adventure
5. Football Fans

Unlocked worlds are saved per difficulty, so you can pick up from the furthest world you've reached.

## Avatar shop

Spend coins on **paintball guns** and **paintball colours**, plus hair styles, hair colors, outfits, hats, extras (glasses, headphones…), faces and skin tones.

- **Guns:** each has its own scope zoom, fire rate and paintball speed. They cost **5 coins**, except the **Bronze, Silver and Gold Snipers** at **10,000**.
- **Paintballs:** 10 colours at **5 coins**, plus **Bronze, Silver and Gold** paint at **10,000**.
- Everyone starts with the free Starter Marker and red paint.

Some items are free. New players start with a default look based on the player they pick:

- **Boy:** short black hair and a Blitz Tee with the game's bullseye logo
- **Girl:** long black hair and a dress

## Running it

No install or build step is needed.

- **Play online:** via GitHub Pages (see the repo's *About* link).
- **Play locally:** open `index.html` in any modern browser, or serve the folder:
  ```
  npx serve .
  ```

## Project layout

```
index.html        screens and layout
css/style.css     all styling
js/data.js        worlds, difficulties, shop items (tweak the game here)
js/storage.js     localStorage save/load
js/avatar.js      SVG avatar drawing
js/gear.js        SVG drawings of guns and paintballs for the shop
js/vendor/        Three.js r128 (3D graphics), kept locally so no internet is needed
js/sound.js       Web Audio sound effects
js/game.js        the 3D worlds, gun, paintballs, targets and scoring
js/ui.js          setup, home, shop and modal screens
```

To change goals, rewards, speeds or prices, edit `js/data.js`.
