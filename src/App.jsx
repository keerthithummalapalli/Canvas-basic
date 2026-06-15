import { useEffect, useRef, useState } from 'react';
import Canvas from './components/Canvas';

const TOOL_BUTTONS = [
  { key: 'pen', label: 'Pen', testId: 'tool-pen' },
  { key: 'eraser', label: 'Eraser', testId: 'tool-eraser' },
  { key: 'line', label: 'Line', testId: 'tool-line' },
  { key: 'rectangle', label: 'Rectangle', testId: 'tool-rectangle' },
];

function App() {
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#0f172a');
  const [brushSize, setBrushSize] = useState(4);
  const [savedDrawings, setSavedDrawings] = useState([]);
  const canvasApiRef = useRef(null);

  useEffect(() => {
    const storageValue = localStorage.getItem('savedDrawings');
    if (storageValue) {
      try {
        setSavedDrawings(JSON.parse(storageValue));
      } catch (error) {
        setSavedDrawings([]);
      }
    }
  }, []);

  const handleCanvasReady = (api) => {
    canvasApiRef.current = api;
    window.getCanvasDataURL = () => api.getDataURL();
  };

  const saveCanvasToStorage = () => {
    if (!canvasApiRef.current) return;
    const currentDataUrl = canvasApiRef.current.getDataURL();
    const drawings = JSON.parse(localStorage.getItem('savedDrawings') || '[]');
    drawings.unshift({ id: Date.now(), data: currentDataUrl, createdAt: new Date().toISOString() });
    localStorage.setItem('savedDrawings', JSON.stringify(drawings));
    setSavedDrawings(drawings);
  };

  const clearCanvas = () => {
    canvasApiRef.current?.clearCanvas();
  };

  const undoLastAction = () => {
    canvasApiRef.current?.undo();
  };

  const loadGalleryItem = (drawing) => {
    canvasApiRef.current?.loadDataURL(drawing.data);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">Canvas Draw Studio</h1>
          <p className="mt-2 text-slate-600">
            Use the toolbar to pick a tool, paint on the canvas, save drawings, undo, clear, and load artwork from Local Storage.
          </p>
        </header>

        <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-3">
              {TOOL_BUTTONS.map((item) => (
                <button
                  key={item.key}
                  data-testid={item.testId}
                  type="button"
                  onClick={() => setTool(item.key)}
                  className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${tool === item.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                Color
                <input
                  data-testid="color-picker"
                  type="color"
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                  className="h-10 w-12 cursor-pointer rounded-lg border border-slate-300 p-0"
                />
              </label>

              <label className="flex items-center gap-3 text-sm text-slate-700">
                Brush
                <input
                  data-testid="brush-size-slider"
                  type="range"
                  min="1"
                  max="40"
                  value={brushSize}
                  onChange={(event) => setBrushSize(Number(event.target.value))}
                  className="h-2 cursor-pointer accent-slate-900"
                />
                <span className="w-10 text-right text-xs text-slate-500">{brushSize}px</span>
              </label>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              data-testid="clear-canvas-button"
              type="button"
              onClick={clearCanvas}
              className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-600"
            >
              Clear Canvas
            </button>
            <button
              data-testid="undo-button"
              type="button"
              onClick={undoLastAction}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Undo
            </button>
            <button
              data-testid="save-storage-button"
              type="button"
              onClick={saveCanvasToStorage}
              className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              Save to Storage
            </button>
            <button
              data-testid="export-png-button"
              type="button"
              onClick={() => {
                const png = window.getCanvasDataURL?.();
                if (png) {
                  const link = document.createElement('a');
                  link.href = png;
                  link.download = 'canvas-drawing.png';
                  link.click();
                }
              }}
              className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Export PNG
            </button>
          </div>
        </section>

        <main className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <Canvas
              tool={tool}
              color={color}
              size={brushSize}
              onReady={handleCanvasReady}
            />
          </div>

          <aside className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Saved Gallery</h2>
            <p className="mt-2 text-sm text-slate-600">Click an item to load it onto the canvas.</p>
            <div
              data-testid="gallery-container"
              className="mt-4 grid gap-3"
            >
              {savedDrawings.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 p-6 text-center text-slate-500">No saved drawings yet.</div>
              ) : (
                savedDrawings.map((drawing, index) => (
                  <button
                    data-testid={index === 0 ? 'gallery-item-0' : undefined}
                    key={drawing.id}
                    type="button"
                    onClick={() => loadGalleryItem(drawing)}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 text-left transition hover:border-slate-400"
                  >
                    <img
                      src={drawing.data}
                      alt={`Saved drawing ${index + 1}`}
                      className="h-28 w-full object-cover"
                    />
                    <div className="space-y-1 p-3">
                      <p className="text-sm font-medium text-slate-900">Drawing {index + 1}</p>
                      <p className="text-xs text-slate-500">Saved {new Date(drawing.createdAt).toLocaleString()}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

export default App;
