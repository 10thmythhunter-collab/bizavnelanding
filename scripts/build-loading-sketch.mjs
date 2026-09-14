// Turns the loading screen's background straight out of Figma into the asset
// the screen actually animates.
//
// The design draws that background as a pen-and-paper sketch of a jet over
// cloud, bled to all four edges — node 247:24781, "magnific__…sketch…", inside
// "Loading stage final — layout v2". It looks like a photograph and is not
// one: it is a thousand flat vector shapes, which is what lets the screen lay
// it down a line at a time while the bar fills rather than fading in a
// picture.
//
// To refresh it: export that node from Figma as SVG, save it beside this file
// as .sketch-raw.svg, and run `node scripts/build-loading-sketch.mjs`.
//
// What the raw export needs done to it:
//
//   - Figma exports the node with everything behind it. The canvas colour, the
//     grey page under it and the frame's own white all come out as full-bleed
//     rects, and painted in they would bury the drawing. They go.
//   - The two clip paths only ever cut outside the viewBox, so they are dead
//     weight in a file this size.
//   - Coordinates land at 15 decimal places. One is finer than a screen can
//     draw and takes a third off the file.
//   - Every drawing path is tagged with where it sits along a sweep of the
//     page, left to right, and that is what the stylesheet animates against.
//     The tag is the path's POSITION, not its rank in the file: paths standing
//     at the same place come in together, and the front crosses the page at an
//     even speed instead of racing through the crowded parts.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const RAW = join(here, ".sketch-raw.svg");
const OUT = join(here, "..", "src", "assets", "loading-sketch.svg");

// How many places along the sweep there are. The stylesheet divides the bar's
// own span by this, so it is the resolution of the draw, not its speed.
const STEPS = 600;
// Enough to place a line on any screen we will ever paint this on; the
// fifteen Figma writes are noise.
const DP = 1;

const raw = readFileSync(RAW, "utf8");

// The drawing is the one group Figma names after the sketch, held at the
// opacity the design holds it at. Everything outside it is backing.
const open = raw.match(/<g id="magnific[^"]*"([^>]*)>/);
if (!open) throw new Error("no sketch group in " + RAW);
const opacity = open[1].match(/opacity="([\d.]+)"/)?.[1] ?? "1";
const body = raw.slice(open.index + open[0].length, raw.indexOf("</g>", open.index));

const paths = [...body.matchAll(/<path\b[^>]*\bd="([^"]+)"[^>]*>/g)];
if (!paths.length) throw new Error("no paths in the sketch group");

// Every x the path touches, control points included. They overstate the reach
// of a curve by a hair, which costs nothing: this is only ever used to place
// the path along the sweep relative to its neighbours.
function xSpan(d) {
  const tokens = d.match(/[A-Za-z]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  let cmd = "";
  let lo = Infinity;
  let hi = -Infinity;
  const take = (v) => {
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  };

  for (let i = 0; i < tokens.length; ) {
    const t = tokens[i];
    if (/[A-Za-z]/.test(t)) {
      cmd = t;
      i += 1;
      continue;
    }
    const n = Number.parseFloat;
    // Figma writes absolute commands only, and never an arc — so an x is
    // always the first of a pair, and V is the only one that carries none.
    if (cmd === "M" || cmd === "L") {
      take(n(tokens[i]));
      i += 2;
    } else if (cmd === "C") {
      take(n(tokens[i]));
      take(n(tokens[i + 2]));
      take(n(tokens[i + 4]));
      i += 6;
    } else if (cmd === "H") {
      take(n(tokens[i]));
      i += 1;
    } else if (cmd === "V") {
      i += 1;
    } else {
      i += 1;
    }
  }
  return [lo, hi];
}

const centres = paths.map(([, d]) => {
  const [lo, hi] = xSpan(d);
  return (lo + hi) / 2;
});
const min = Math.min(...centres);
const max = Math.max(...centres);
const span = max - min || 1;

const round = (d) =>
  d.replace(/-?\d+\.\d+/g, (m) => String(Number(Number(m).toFixed(DP))));

const drawn = paths.map((match, index) => {
  const step = Math.round(((centres[index] - min) / span) * STEPS);
  return match[0]
    // Figma's own "Vector_413" tells nobody anything and there are a thousand
    // of them.
    .replace(/\s*id="[^"]*"/, "")
    .replace(/\bd="([^"]+)"/, (_, d) => `d="${round(d)}"`)
    .replace(/^<path/, `<path class="ink" style="--i:${step}"`);
});

const svg = `<!-- Built by scripts/build-loading-sketch.mjs from Figma node 247:24781
     ("Loading stage final — layout v2" / the pen sketch behind the copy).
     Do not edit by hand — re-export and re-run the script.
     ${drawn.length} paths, each tagged with its place in a sweep of ${STEPS}
     running left to right across the page. The place is where the path sits,
     not its rank, so paths at the same point come in together and the front
     crosses the drawing at a steady speed. -->
<svg width="1431" height="705" viewBox="0 0 1431 705" fill="none"
     preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
<g id="sketch" opacity="${opacity}">
${drawn.join("\n")}
</g>
</svg>
`;

writeFileSync(OUT, svg);
console.log(
  `${OUT}: ${drawn.length} paths, ${(svg.length / 1024).toFixed(0)}KB ` +
    `(raw ${(raw.length / 1024).toFixed(0)}KB), group opacity ${opacity}`,
);
