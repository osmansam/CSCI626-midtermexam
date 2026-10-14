import { useMemo, useRef, useState } from 'react';

const ROWS = 30;
const COLS = 40;
const CELL_W = 26;
const CELL_H = 20;
const MIN_DRAG = 15;
const DIAGONAL_RATIO = 0.5;

const GESTURE_COLORS = { vertical: '#2563eb', horizontal: '#16a34a', diagonal: '#9333ea' };

const range = (n) => Array.from({ length: n }, (_, i) => i);

function makeMatrix() {
  return range(ROWS).map(() => range(COLS).map(() => Math.floor(Math.random() * 100)));
}

function classifyGesture(dx, dy) {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (Math.max(ax, ay) < MIN_DRAG) return null;
  const isDiagonalGesture = Math.min(ax, ay) / Math.max(ax, ay) >= DIAGONAL_RATIO;
  if (isDiagonalGesture) return 'diagonal';
  return ay > ax ? 'vertical' : 'horizontal';
}

export default function App() {
  const data = useMemo(makeMatrix, []);
  const [rowOrder, setRowOrder] = useState(range(ROWS));
  const [colOrder, setColOrder] = useState(range(COLS));
  const [selected, setSelected] = useState(null);
  const [line, setLine] = useState(null);
  const start = useRef(null);

  const sortRows = (keyCol, asc) =>
    setRowOrder((order) =>
      [...order].sort((a, b) => (asc ? 1 : -1) * (data[a][keyCol] - data[b][keyCol]))
    );

  const sortCols = (keyRow, asc) =>
    setColOrder((order) =>
      [...order].sort((a, b) => (asc ? 1 : -1) * (data[keyRow][a] - data[keyRow][b]))
    );

  const point = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - box.left, y: e.clientY - box.top };
  };

  const endDrag = () => {
    start.current = null;
    setSelected(null);
    setLine(null);
  };

  const onDown = (e) => {
    const { row, col } = e.target.dataset;
    if (row === undefined) return;
    const p = point(e);
    start.current = { ...p, row: +row, col: +col };
    e.currentTarget.setPointerCapture(e.pointerId);
    setSelected({ row: +row, col: +col });
    setLine({ x1: p.x, y1: p.y, x2: p.x, y2: p.y });
  };

  const onMove = (e) => {
    if (!start.current) return;
    const p = point(e);
    setLine((l) => ({ ...l, x2: p.x, y2: p.y }));
  };

  // Both sorts of a diagonal drag use the row and column of the cell that was
  // pressed, so the keys do not change after the first sort moves things around.
  const onUp = (e) => {
    const s = start.current;
    if (!s) return;
    const p = point(e);
    const dx = p.x - s.x;
    const dy = p.y - s.y;
    const gesture = classifyGesture(dx, dy);
    endDrag();

    if (gesture === 'vertical' || gesture === 'diagonal') sortRows(s.col, dy > 0);
    if (gesture === 'horizontal' || gesture === 'diagonal') sortCols(s.row, dx > 0);
  };

  const rowPos = useMemo(() => Object.fromEntries(rowOrder.map((r, i) => [r, i])), [rowOrder]);
  const colPos = useMemo(() => Object.fromEntries(colOrder.map((c, i) => [c, i])), [colOrder]);

  const gesture = line ? classifyGesture(line.x2 - line.x1, line.y2 - line.y1) : null;
  const arrowColor = GESTURE_COLORS[gesture] ?? '#6b7280';

  return (
    <div className="p-4 font-sans text-sm text-gray-800">
      <div className="max-w-3xl leading-relaxed">
        <h1 className="text-lg font-semibold mb-2">Sorting the matrix by direct manipulation</h1>
        <p>
          Press on a cell, drag, and release. The pressed cell is highlighted together with its
          row and column, because they supply the sort keys. Whole rows and whole columns are
          reordered; the numbers inside a row or column are never rearranged.
        </p>
        <ul className="list-disc ml-6 my-2">
          <li>
            <b className="text-blue-600">Drag down / up:</b> reorder the <b>rows</b> by the values
            in the pressed cell's column (down = ascending, up = descending).
          </li>
          <li>
            <b className="text-green-600">Drag right / left:</b> reorder the <b>columns</b> by the
            values in the pressed cell's row (right = ascending, left = descending).
          </li>
          <li>
            <b className="text-purple-600">Drag diagonally:</b> do both at once. The vertical part
            sets the row order and the horizontal part sets the column order. Both sorts use the
            row and column of the cell you originally pressed.
          </li>
        </ul>
        <p>
          The arrow color shows which sort will happen. Darker cells have higher values. Drags
          shorter than a few pixels are ignored.
        </p>
      </div>

      <div
        className="relative mt-4 select-none cursor-crosshair touch-none"
        style={{ width: COLS * CELL_W, height: ROWS * CELL_H }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={endDrag}
      >
        {data.map((values, r) =>
          values.map((value, c) => {
            const isSelected = selected?.row === r && selected?.col === c;
            const inKeyLine = selected && (selected.row === r || selected.col === c);
            const background = isSelected
              ? '#facc15'
              : inKeyLine
              ? `hsl(45, 90%, ${95 - value * 0.5}%)`
              : `hsl(210, 70%, ${95 - value * 0.6}%)`;
            return (
              <div
                key={`${r}-${c}`}
                data-row={r}
                data-col={c}
                className="absolute left-0 top-0 flex items-center justify-center text-[9px] border border-white transition-transform duration-500"
                style={{
                  width: CELL_W,
                  height: CELL_H,
                  transform: `translate(${colPos[c] * CELL_W}px, ${rowPos[r] * CELL_H}px)`,
                  backgroundColor: background,
                  color: value > 60 && !inKeyLine ? '#fff' : '#000',
                }}
              >
                <span className="pointer-events-none">{value}</span>
              </div>
            );
          })
        )}
        {line && (
          <svg className="absolute inset-0 pointer-events-none overflow-visible" width="100%" height="100%">
            <defs>
              {Object.entries(GESTURE_COLORS).map(([name, color]) => (
                <marker key={name} id={`arrow-${name}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 z" fill={color} />
                </marker>
              ))}
            </defs>
            <line
              {...line}
              stroke={arrowColor}
              strokeWidth="3"
              markerEnd={gesture ? `url(#arrow-${gesture})` : undefined}
            />
          </svg>
        )}
      </div>
    </div>
  );
}
