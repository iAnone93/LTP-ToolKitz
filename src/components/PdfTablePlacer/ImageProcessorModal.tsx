import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Sliders, PenTool, Upload, RotateCcw } from 'lucide-react';

interface ImageProcessorModalProps {
  file: File | null;
  onConfirm: (dataUrl: string) => void;
  onCancel: () => void;
}

const ImageProcessorModal: React.FC<ImageProcessorModalProps> = ({ file, onConfirm, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'draw' | 'upload'>(file ? 'upload' : 'draw');
  
  // Upload & Clean State
  const [currentFile, setCurrentFile] = useState<File | null>(file);
  const [threshold, setThreshold] = useState<number>(200);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const cleanCanvasRef = useRef<HTMLCanvasElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // Draw Signature State
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [penColor, setPenColor] = useState<'#0f172a' | '#1e40af'>('#0f172a');
  const [penWidth, setPenWidth] = useState<number>(2.5);

  // Load image from file
  useEffect(() => {
    if (!currentFile) return;
    const img = new Image();
    const url = URL.createObjectURL(currentFile);
    img.onload = () => {
      setOriginalImage(img);
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [currentFile]);

  // Process image when threshold or image changes
  useEffect(() => {
    if (activeTab !== 'upload' || !originalImage || !cleanCanvasRef.current) return;

    const canvas = cleanCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;

    ctx.drawImage(originalImage, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Background Removal
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;

      if (brightness > threshold) {
        data[i + 3] = 0;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [originalImage, threshold, activeTab]);

  // Initialize draw canvas
  useEffect(() => {
    if (activeTab === 'draw' && drawCanvasRef.current) {
      const canvas = drawCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [activeTab]);

  // Draw Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.beginPath();
    ctx.moveTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const drawMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.lineTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearDrawing = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasDrawn(false);
  };

  const handleSave = () => {
    if (activeTab === 'draw') {
      if (drawCanvasRef.current) {
        const dataUrl = drawCanvasRef.current.toDataURL('image/png');
        onConfirm(dataUrl);
      }
    } else {
      if (cleanCanvasRef.current) {
        const dataUrl = cleanCanvasRef.current.toDataURL('image/png');
        onConfirm(dataUrl);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col border border-slate-200">
        
        {/* Header with Mode Switcher */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-xs">
              <PenTool size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Add Electronic Signature</h3>
              <p className="text-[11px] text-slate-500">Draw a signature or clean up an uploaded signature image</p>
            </div>
          </div>
          <button 
            onClick={onCancel} 
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-5 pt-4 pb-2 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('draw')}
              className={`px-3 py-1.5 font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'draw'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PenTool size={13} />
              <span>Draw Signature</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload size={13} />
              <span>Upload & Clean Image</span>
            </button>
          </div>

          {activeTab === 'draw' && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setPenColor('#0f172a')}
                  className={`w-5 h-5 rounded-full bg-slate-900 transition-transform ${penColor === '#0f172a' ? 'scale-110 ring-2 ring-indigo-500' : 'opacity-70'}`}
                  title="Black Ink"
                />
                <button
                  type="button"
                  onClick={() => setPenColor('#1e40af')}
                  className={`w-5 h-5 rounded-full bg-blue-700 transition-transform ${penColor === '#1e40af' ? 'scale-110 ring-2 ring-indigo-500' : 'opacity-70'}`}
                  title="Blue Ink"
                />
              </div>

              <button
                onClick={clearDrawing}
                className="p-1.5 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1"
                title="Clear Signature"
              >
                <RotateCcw size={13} />
                <span className="text-[11px] hidden sm:inline">Clear</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab Body */}
        <div className="p-5 flex flex-col gap-4">
          {activeTab === 'draw' ? (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-slate-600">
                Use your mouse, trackpad, or touch screen to sign below. The signature has a transparent background.
              </p>

              {/* Drawing Pad with Checkerboard Background */}
              <div 
                className="w-full h-48 border-2 border-dashed border-slate-300 rounded-xl relative overflow-hidden bg-slate-50 flex items-center justify-center"
                style={{
                  backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                  backgroundSize: '16px 16px'
                }}
              >
                <canvas
                  ref={drawCanvasRef}
                  width={600}
                  height={240}
                  onMouseDown={startDrawing}
                  onMouseMove={drawMove}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={drawMove}
                  onTouchEnd={stopDrawing}
                  className="w-full h-full cursor-crosshair touch-none"
                />
                {!hasDrawn && (
                  <div className="absolute pointer-events-none text-center text-slate-400 text-xs">
                    <PenTool size={20} className="mx-auto mb-1 opacity-40" />
                    <span>Sign here with your mouse or finger</span>
                  </div>
                )}
              </div>

              {/* Stroke Size Selector */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Stroke Weight:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPenWidth(1.8)}
                    className={`px-2 py-0.5 rounded ${penWidth === 1.8 ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'hover:bg-slate-100'}`}
                  >
                    Fine (1.8px)
                  </button>
                  <button
                    onClick={() => setPenWidth(2.5)}
                    className={`px-2 py-0.5 rounded ${penWidth === 2.5 ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'hover:bg-slate-100'}`}
                  >
                    Normal (2.5px)
                  </button>
                  <button
                    onClick={() => setPenWidth(3.8)}
                    className={`px-2 py-0.5 rounded ${penWidth === 3.8 ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'hover:bg-slate-100'}`}
                  >
                    Thick (3.8px)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Adjust sensitivity to eliminate paper/background color. Transparent areas show as a checkered pattern.
                </p>
                <input
                  type="file"
                  ref={uploadInputRef}
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setCurrentFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <button
                  onClick={() => uploadInputRef.current?.click()}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 shrink-0"
                >
                  <Upload size={12} />
                  <span>Choose Image</span>
                </button>
              </div>

              {/* Range Slider */}
              <div className="flex flex-col gap-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Sliders size={13} className="text-indigo-600" />
                    <span>Background Removal Sensitivity</span>
                  </span>
                  <span className="font-mono text-indigo-700 font-bold">
                    {Math.round((threshold / 255) * 100)}%
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="255" 
                  value={threshold} 
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Keep more ink</span>
                  <span>Remove light backgrounds</span>
                </div>
              </div>

              {/* Preview with Pure CSS Checkerboard */}
              <div 
                className="w-full h-48 border border-slate-300 rounded-xl overflow-hidden relative flex items-center justify-center bg-slate-100"
                style={{
                  backgroundImage: `
                    linear-gradient(45deg, #e2e8f0 25%, transparent 25%),
                    linear-gradient(-45deg, #e2e8f0 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #e2e8f0 75%),
                    linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)
                  `,
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
                }}
              >
                {currentFile ? (
                  <canvas 
                    ref={cleanCanvasRef} 
                    className="max-w-full max-h-full object-contain p-2"
                  />
                ) : (
                  <div 
                    onClick={() => uploadInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <Upload size={24} className="text-slate-400 mb-2" />
                    <span className="text-xs font-semibold text-slate-700">Click to upload signature photo</span>
                    <span className="text-[11px] text-slate-500">PNG, JPG, or WebP</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          
          <button 
            onClick={handleSave}
            disabled={activeTab === 'draw' ? !hasDrawn : !currentFile}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Check size={14} />
            <span>Place on PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageProcessorModal;
