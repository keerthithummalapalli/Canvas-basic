# Canvas Draw Studio

A browser-based interactive drawing application built with React, Vite, and Tailwind CSS.

## Features

- Drawing canvas using HTML5 Canvas API
- Toolbar with Pen, Eraser, Line, and Rectangle tools
- Color picker for stroke color selection
- Brush size slider
- Clear canvas button
- Undo last drawing action
- Save current drawing to Local Storage
- Gallery of saved drawings
- Load saved drawings onto the canvas
- Export current canvas as PNG
- `window.getCanvasDataURL()` available for verification

## Required Test Attributes

- `canvas[data-testid="drawing-canvas"]`
- `button[data-testid="tool-pen"]`
- `button[data-testid="tool-eraser"]`
- `button[data-testid="tool-line"]`
- `button[data-testid="tool-rectangle"]`
- `input[type="color"][data-testid="color-picker"]`
- `input[type="range"][data-testid="brush-size-slider"]`
- `button[data-testid="clear-canvas-button"]`
- `button[data-testid="undo-button"]`
- `button[data-testid="save-storage-button"]`
- `button[data-testid="export-png-button"]`
- `div[data-testid="gallery-container"]`
- `button[data-testid="gallery-item-0"]`

## Setup

1. Install dependencies

```bash
npm install
```

2. Start development server

```bash
npm run dev
```

3. Build for production

```bash
npm run build
```

4. Preview production build

```bash
npm run preview
```

## Notes

- Drawings saved via the `Save to Storage` button are persisted under the `savedDrawings` Local Storage key.
- The gallery loads saved drawings automatically when the page is refreshed.
- `window.getCanvasDataURL()` returns the current PNG data URL of the canvas.
