import React, { useEffect, useImperativeHandle, useRef } from 'react';

const Canvas = React.forwardRef(({ tool, color, size, onReady }, ref) => {
  const canvasRef = useRef(null);
  const historyRef = useRef([]);
  const drawingRef = useRef({ isDrawing: false, startX: 0, startY: 0, lastX: 0, lastY: 0, snapshot: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 1000;
    canvas.height = 620;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    historyRef.current = [canvas.toDataURL()];

    if (typeof onReady === 'function') {
      onReady({ getDataURL, undo, clearCanvas, loadDataURL });
    }
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.lineWidth = size;
  }, [size]);

  const getDataURL = () => canvasRef.current?.toDataURL() || '';

  const getContext = () => canvasRef.current?.getContext('2d');

  const toCanvasCoords = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const restoreSnapshot = () => {
    const ctx = getContext();
    if (!ctx || !drawingRef.current.snapshot) return;
    ctx.putImageData(drawingRef.current.snapshot, 0, 0);
  };

  const commitHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    historyRef.current.push(canvas.toDataURL());
  };

  const drawCurrentShape = (x, y, preview = false) => {
    const ctx = getContext();
    if (!ctx) return;

    if (tool === 'pen' || tool === 'eraser') {
      const strokeStyle = tool === 'eraser' ? '#ffffff' : color;
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = size;
      ctx.lineTo(x, y);
      ctx.stroke();
      return;
    }

    if (preview) {
      restoreSnapshot();
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = size;

    if (tool === 'line') {
      ctx.beginPath();
      ctx.moveTo(drawingRef.current.startX, drawingRef.current.startY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    if (tool === 'rectangle') {
      const width = x - drawingRef.current.startX;
      const height = y - drawingRef.current.startY;
      ctx.strokeRect(drawingRef.current.startX, drawingRef.current.startY, width, height);
    }
  };

  const startDrawing = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = toCanvasCoords(event);
    drawingRef.current.isDrawing = true;
    drawingRef.current.startX = x;
    drawingRef.current.startY = y;
    drawingRef.current.lastX = x;
    drawingRef.current.lastY = y;
    drawingRef.current.snapshot = null;

    const ctx = getContext();
    if (!ctx) return;

    canvas.setPointerCapture(event.pointerId);

    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      drawingRef.current.snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
  };

  const stopDrawing = (event) => {
    if (!drawingRef.current.isDrawing) return;
    drawingRef.current.isDrawing = false;

    if (tool !== 'pen' && tool !== 'eraser') {
      const { x, y } = toCanvasCoords(event);
      drawCurrentShape(x, y, false);
    }

    const ctx = getContext();
    if (ctx && (tool === 'pen' || tool === 'eraser')) {
      ctx.closePath();
    }

    commitHistory();
  };

  const penMove = (event) => {
    if (!drawingRef.current.isDrawing) return;
    const { x, y } = toCanvasCoords(event);
    drawCurrentShape(x, y, tool !== 'pen' && tool !== 'eraser');
    drawingRef.current.lastX = x;
    drawingRef.current.lastY = y;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    commitHistory();
  };

  const undo = () => {
    if (historyRef.current.length < 2) return;
    historyRef.current.pop();
    const previous = historyRef.current[historyRef.current.length - 1];
    const image = new Image();
    image.onload = () => {
      const ctx = getContext();
      if (!ctx) return;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(image, 0, 0);
    };
    image.src = previous;
  };

  const loadDataURL = (dataURL) => {
    if (!dataURL) return;
    const image = new Image();
    image.onload = () => {
      const ctx = getContext();
      if (!ctx) return;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(image, 0, 0);
      commitHistory();
    };
    image.src = dataURL;
  };

  useImperativeHandle(ref, () => ({ getDataURL, undo, clearCanvas, loadDataURL }), [tool, color, size]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="drawing-canvas"
      className="w-full rounded-3xl border border-slate-300 bg-white shadow-sm"
      onPointerDown={startDrawing}
      onPointerMove={penMove}
      onPointerUp={stopDrawing}
      onPointerLeave={stopDrawing}
    />
  );
});

export default Canvas;
