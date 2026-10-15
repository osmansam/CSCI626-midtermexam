# Direct Manipulation Matrix Sorting

This project implements a 30 by 40 numerical matrix containing 1,200 values. The matrix itself is the interaction surface: users sort rows, columns, or both axes by dragging directly from a cell. The page does not use buttons, menus, sliders, checkboxes, tooltips, or other UI widgets.

## Interaction instructions

Press a cell, drag in one of the following directions, and release:

- **Down:** sort rows in ascending order using the pressed cell's column.
- **Up:** sort rows in descending order using the pressed cell's column.
- **Right:** sort columns in ascending order using the pressed cell's row.
- **Left:** sort columns in descending order using the pressed cell's row.
- **Diagonal:** sort rows and columns together. The vertical direction controls row order, and the horizontal direction controls column order.

The originally pressed cell supplies both sort keys. During the drag, the selected cell and its row and column are highlighted. The arrow color previews the operation:

- Blue indicates row sorting.
- Green indicates column sorting.
- Purple indicates combined row and column sorting.

Drags shorter than 15 pixels are ignored. Darker blue cells contain higher values.

## Project setup

The application uses React, Vite, Tailwind CSS, Pointer Events, and inline SVG. D3.js is not required because React and CSS transforms provide the state management, positioning, and animation needed for this matrix.

To recreate the project:

```bash
npm create vite@latest matrix-sort -- --template react
cd matrix-sort
npm install
npm install tailwindcss @tailwindcss/vite
```

Configure `vite.config.js` with the React and Tailwind plugins, import Tailwind from `src/index.css`, and render the application from `src/main.jsx`.

## Running the application

From the `matrix-sort` directory:

```bash
npm install
npm run dev
```

Open the local address printed by Vite. To create the production bundle, run:

```bash
npm run build
```

The optimized output is written to `matrix-sort/dist`.

## Project structure

```text
matrix-sort/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── App.jsx
    ├── index.css
    └── main.jsx
```

- `index.html` contains the application root element.
- `src/main.jsx` creates the React root and renders `App`.
- `src/App.jsx` contains matrix generation, gesture recognition, sorting, feedback, and rendering.
- `src/index.css` imports Tailwind CSS.
- `vite.config.js` registers the React and Tailwind plugins.

## Implementation design

`makeMatrix` creates 30 arrays of 40 random integers from 0 through 99. React creates the matrix once with `useMemo`, so pointer interactions do not regenerate the values.

The original data remains unchanged. `rowOrder` and `colOrder` store permutations of the original indexes. Sorting copies and reorders one or both index arrays. `rowPos` and `colPos` then convert each original index into its current screen position. Every cell moves with a CSS transform and a 500 millisecond transition.

`classifyGesture` compares the horizontal and vertical drag distances. A gesture is diagonal when its smaller axis is at least half the length of its larger axis. Otherwise, its dominant axis determines whether rows or columns are sorted.

Pointer capture keeps the drag active when the pointer moves beyond the starting cell. The SVG line follows the pointer and uses the gesture color as immediate feedback.

## Verification checklist

1. Confirm that the page displays 30 rows and 40 columns.
2. Test downward and upward drags for ascending and descending row sorting.
3. Test rightward and leftward drags for ascending and descending column sorting.
4. Test diagonal drags in all four directions.
5. Confirm that a movement shorter than 15 pixels causes no sort.
6. Run `npm run build` and confirm that Vite completes without errors.
