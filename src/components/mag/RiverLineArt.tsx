/**
 * Our own line drawing of the North Saskatchewan River valley: the High Level Bridge on its
 * steel towers, the Legislature dome on the north bank and the downtown towers behind.
 * Every stroke has pathLength=1 so MagMotion can draw it in on scroll (reduced motion: drawn).
 */

const W = 1600;
const DECK = 168;
const TOP = 136;
const X0 = 130;
const X1 = 1470;

/** Valley floor: a soft bowl from the bank tops down to the river. */
function ground(x: number) {
  const t = (x - 800) / 690;
  return Math.min(372, DECK + 4 + 200 * Math.max(0, 1 - t * t));
}

function valley(from: number, to: number, step = 20) {
  const pts: string[] = [];
  for (let x = from; x <= to; x += step) pts.push(`${x} ${ground(x).toFixed(1)}`);
  return "M" + pts.join(" L");
}

function truss() {
  const panel = 33.5;
  let d = `M${X0} ${TOP} H${X1} M${X0} ${DECK} H${X1}`;
  let i = 0;
  for (let x = X0; x < X1 - 1; x += panel, i++) {
    const nx = Math.min(X1, x + panel);
    d += ` M${x.toFixed(1)} ${TOP} V${DECK}`;
    d += i % 2 ? ` M${x.toFixed(1)} ${TOP} L${nx.toFixed(1)} ${DECK}` : ` M${x.toFixed(1)} ${DECK} L${nx.toFixed(1)} ${TOP}`;
  }
  return d + ` M${X1} ${TOP} V${DECK}`;
}

function towers() {
  const out: string[] = [];
  for (let x = 330; x <= 1270; x += 134) {
    const g = ground(x);
    if (g - DECK < 40) continue;
    const top = 13;
    const bot = 13 + (g - DECK) * 0.16;
    const mid = DECK + (g - DECK) / 2;
    const midW = (top + bot) / 2;
    out.push(
      `M${x - top} ${DECK} L${x - bot} ${g} M${x + top} ${DECK} L${x + bot} ${g}` +
        ` M${x - top} ${DECK} L${x + midW} ${mid} M${x + top} ${DECK} L${x - midW} ${mid}` +
        ` M${x - midW} ${mid} L${x + bot} ${g} M${x + midW} ${mid} L${x - bot} ${g}` +
        ` M${x - midW} ${mid} H${x + midW}`,
    );
  }
  return out;
}

function skyline() {
  // Downtown towers on the north bank, behind the Legislature (left of the bridge).
  const base = 150;
  const b: [number, number, number][] = [
    [14, 26, 70], [44, 30, 126], [80, 24, 96], [108, 30, 150],
    [344, 28, 84], [376, 22, 120], [402, 30, 62],
  ];
  return b.map(([x, w, h]) => `M${x} ${base} V${base - h} H${x + w} V${base}`);
}

function legislature() {
  const g = 150;
  return [
    `M150 ${g} V${g - 34} H330 V${g}`,
    `M200 ${g - 34} V${g - 48} H280 V${g - 34}`,
    `M216 ${g - 48} V${g - 64} H264 V${g - 64} V${g - 48}`,
    `M212 ${g - 64} C212 ${g - 104} 268 ${g - 104} 268 ${g - 64}`,
    `M236 ${g - 95} V${g - 112} H244 V${g - 95} M240 ${g - 112} V${g - 124}`,
    `M168 ${g - 34} V${g - 6} M186 ${g - 34} V${g - 6} M294 ${g - 34} V${g - 6} M312 ${g - 34} V${g - 6}`,
  ];
}

function spruce(x: number, y: number, h: number) {
  return `M${x} ${y} L${x + h * 0.32} ${y - h} L${x + h * 0.64} ${y} Z M${x + h * 0.32} ${y} V${y + 6}`;
}

export function RiverLineArt() {
  const strokes: { d: string; accent?: boolean }[] = [
    { d: valley(0, W) },
    { d: `M520 ${ground(520) + 6} C700 362 900 380 1100 ${ground(1100) + 6}`, accent: true },
    { d: `M590 382 C760 376 860 390 1010 380 M650 396 H720 M800 398 H900`, accent: true },
    ...legislature().map((d) => ({ d })),
    { d: truss() },
    ...towers().map((d) => ({ d })),
    ...skyline().map((d) => ({ d })),
    { d: [spruce(430, ground(430), 30), spruce(1130, ground(1130), 34), spruce(1186, ground(1186) - 4, 24), spruce(1500, ground(1500), 30), spruce(1540, ground(1540), 22), spruce(1566, ground(1566), 34)].join(" ") },
    { d: "M560 70 q10 -8 20 0 q10 -8 20 0 M640 52 q7 -6 14 0 q7 -6 14 0", accent: true },
  ];
  return (
    <figure className="mag-art" aria-labelledby="mag-art-cap">
      <div className="mag-art__frame">
        <svg className="mag-art__svg" viewBox={`0 0 ${W} 410`} role="img" aria-label="Line drawing of the High Level Bridge across the North Saskatchewan River valley in Edmonton" data-mag-art>
          {strokes.map((s, i) => (
            <path key={i} d={s.d} pathLength={1} className={s.accent ? "mag-art__accent" : undefined} data-draw />
          ))}
        </svg>
      </div>
      <figcaption id="mag-art-cap" className="mag-wrap mag-label mag-art__cap">
        The High Level Bridge and the river valley. Drawn for WhereToYEG.
      </figcaption>
    </figure>
  );
}
