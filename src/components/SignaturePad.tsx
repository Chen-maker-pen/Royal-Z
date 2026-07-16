import React, { useEffect, useRef, useState } from "react";
import SignaturePadClass from "signature_pad";
import { PenTool, Type as TypeIcon, Upload, RotateCcw, Trash2 } from "lucide-react";

interface SignaturePadProps {
  label: string;
  onSave: (base64: string) => void;
  savedData?: string;
  isExporting: boolean;
  highlighted?: boolean;
}

export function SignaturePad({ label, onSave, savedData, isExporting, highlighted }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePadClass | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  
  // Tab and input states
  const [activeTab, setActiveTab] = useState<"draw" | "type" | "upload">("draw");
  const [typedText, setTypedText] = useState("");
  const [selectedFont, setSelectedFont] = useState<"casual" | "elegant" | "delicate" | "bold">("casual");
  const [canvasActive, setCanvasActive] = useState(false);

  // Initialize typing or upload based on loaded savedData if wanted,
  // but keeping it simple is best.

  // Effect for canvas-based Signature Pad (Draw Tab)
  useEffect(() => {
    if (activeTab !== "draw" || !canvasRef.current || (savedData && !canvasActive)) {
      if (padRef.current) {
        padRef.current.off();
        padRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    const pad = new SignaturePadClass(canvas, {
      backgroundColor: "rgba(255, 255, 255, 0)",
      penColor: "#002147", // Navy blue
    });

    padRef.current = pad;

    pad.addEventListener("endStroke", () => {
      setIsEmpty(pad.isEmpty());
      if (!pad.isEmpty()) {
        onSave(pad.toDataURL("image/png"));
      } else {
        onSave("");
      }
    });

    const resizeCanvas = () => {
      if (!canvas || !containerRef.current) return;
      
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      // Determine appropriate width
      const width = canvas.parentElement?.clientWidth || containerRef.current.clientWidth - 24;
      const height = 80;
      
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);
      
      pad.clear();
      setIsEmpty(true);

      if (savedData && savedData.startsWith("data:image")) {
        pad.fromDataURL(savedData);
        setIsEmpty(false);
      }
    };

    // Small delay to let styles settle
    const timeoutId = setTimeout(() => {
      resizeCanvas();
    }, 80);

    const observer = new ResizeObserver(() => {
      resizeCanvas();
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      pad.off();
      observer.disconnect();
    };
  }, [activeTab, canvasActive]);

  // Effect for generating "Type" signature
  useEffect(() => {
    if (activeTab === "type") {
      if (typedText.trim()) {
        const canvas = document.createElement("canvas");
        const scale = 2;
        canvas.width = 300 * scale;
        canvas.height = 75 * scale;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.scale(scale, scale);
          ctx.clearRect(0, 0, 300, 75);
          
          let fontName = "'Caveat', cursive";
          if (selectedFont === "elegant") fontName = "'Great Vibes', cursive";
          if (selectedFont === "delicate") fontName = "'Sacramento', cursive";
          if (selectedFont === "bold") fontName = "'Pacifico', cursive";

          ctx.font = `italic 36px ${fontName}`;
          ctx.fillStyle = "#002147"; // Navy blue
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(typedText, 150, 37);
          
          const base64 = canvas.toDataURL("image/png");
          onSave(base64);
        }
      } else {
        onSave("");
      }
    }
  }, [typedText, selectedFont, activeTab]);

  const handleClear = () => {
    if (padRef.current) {
      padRef.current.clear();
    }
    setIsEmpty(true);
    setTypedText("");
    onSave("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        onSave(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const getFontFamily = (style: string) => {
    switch (style) {
      case "elegant": return "'Great Vibes', cursive";
      case "delicate": return "'Sacramento', cursive";
      case "bold": return "'Pacifico', cursive";
      case "casual":
      default:
        return "'Caveat', cursive";
    }
  };

  // RENDER FOR EXPORT / PRINT (Clean static image only)
  if (isExporting) {
    return (
      <div className="flex flex-col items-center justify-end h-[100px] relative p-1 bg-transparent">
        <span className="absolute top-1 left-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <div className="w-11/12 border-t border-slate-300 absolute bottom-5"></div>
        {savedData && (
          <img 
            src={savedData} 
            alt={`${label} Signature`} 
            className="h-[60px] object-contain mb-4 z-10" 
          />
        )}
      </div>
    );
  }

  // RENDER FOR INTERACTIVE WORKSPACE
  return (
    <div 
      ref={containerRef} 
      className={`flex flex-col h-[190px] relative rounded-xl border p-2.5 transition-all ${
        highlighted 
          ? "border-2 border-royal-gold shadow-md bg-white" 
          : "border-slate-200 bg-white shadow-xs"
      }`}
    >
      {/* Tab bar header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1.5 shrink-0">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-royal-navy">
          {label}
        </span>
        
        <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setActiveTab("draw");
              setCanvasActive(true);
            }}
            className={`flex items-center gap-1 text-[9px] px-1.5 py-1 rounded-md font-bold transition ${
              activeTab === "draw" 
                ? "bg-white text-royal-navy shadow-xs" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <PenTool className="w-2.5 h-2.5" />
            Draw
          </button>
          
          <button
            type="button"
            onClick={() => {
              setActiveTab("type");
              setCanvasActive(false);
            }}
            className={`flex items-center gap-1 text-[9px] px-1.5 py-1 rounded-md font-bold transition ${
              activeTab === "type" 
                ? "bg-white text-royal-navy shadow-xs" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <TypeIcon className="w-2.5 h-2.5" />
            Type
          </button>
          
          <button
            type="button"
            onClick={() => {
              setActiveTab("upload");
              setCanvasActive(false);
            }}
            className={`flex items-center gap-1 text-[9px] px-1.5 py-1 rounded-md font-bold transition ${
              activeTab === "upload" 
                ? "bg-white text-royal-navy shadow-xs" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Upload className="w-2.5 h-2.5" />
            Upload
          </button>
        </div>
      </div>

      {/* Mode container */}
      <div className="relative flex-1 flex flex-col items-center justify-center bg-slate-50/50 rounded-lg border border-slate-100 p-1 overflow-hidden">
        
        {/* DRAW MODE */}
        <div className={`w-full h-full flex flex-col items-center justify-center relative ${activeTab === "draw" ? "block" : "hidden"}`}>
          {savedData && !canvasActive && (
            <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center z-20 rounded-lg">
              <img src={savedData} alt="Saved signature" className="h-[55px] object-contain mb-1.5" />
              <button
                type="button"
                onClick={() => {
                  setCanvasActive(true);
                  handleClear();
                }}
                className="text-[9px] font-bold text-royal-navy hover:underline flex items-center gap-1 bg-royal-gold-light/40 px-2 py-0.5 rounded"
              >
                <RotateCcw className="w-2.5 h-2.5 text-royal-gold-dark" />
                Redraw Signature
              </button>
            </div>
          )}
          <canvas
            ref={canvasRef}
            className="w-full h-[70px] cursor-crosshair signature-canvas z-10"
          />
          <div className="absolute bottom-0.5 text-[8px] text-slate-400 select-none">
            Draw your signature above
          </div>
        </div>

        {/* TYPE MODE */}
        <div className={`w-full h-full flex flex-col items-center justify-between p-1 ${activeTab === "type" ? "flex" : "hidden"}`}>
          <div className="w-full flex items-center gap-1 mb-1 shrink-0">
            <input
              type="text"
              value={typedText}
              onChange={(e) => {
                setTypedText(e.target.value);
              }}
              placeholder="Type your name..."
              className="flex-1 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px] outline-none focus:border-royal-navy/50"
            />
            
            <select
              value={selectedFont}
              onChange={(e) => {
                setSelectedFont(e.target.value as any);
              }}
              className="bg-white border border-slate-200 rounded px-1 py-0.5 text-[9px] font-bold outline-none focus:border-royal-navy/50"
            >
              <option value="casual">Casual</option>
              <option value="elegant">Elegant</option>
              <option value="delicate">Delicate</option>
              <option value="bold">Bold</option>
            </select>
          </div>

          <div className="flex-1 w-full flex items-center justify-center bg-white rounded border border-slate-100 relative min-h-[40px]">
            {typedText ? (
              <span 
                className="text-xl text-royal-navy select-none px-2 text-center truncate w-full"
                style={{ fontFamily: getFontFamily(selectedFont) }}
              >
                {typedText}
              </span>
            ) : (
              <span className="text-[9px] text-slate-300 italic">Signature preview</span>
            )}
          </div>
        </div>

        {/* UPLOAD MODE */}
        <div className={`w-full h-full flex flex-col items-center justify-center ${activeTab === "upload" ? "flex" : "hidden"}`}>
          {savedData && !savedData.startsWith("data:image/svg") ? (
            <div className="flex flex-col items-center justify-center w-full h-full bg-white rounded-lg p-1.5 relative">
              <img src={savedData} alt="Uploaded Signature" className="h-[55px] object-contain mb-1" />
              <button
                type="button"
                onClick={handleClear}
                className="text-[9px] font-bold text-red-500 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Remove & Upload New
              </button>
            </div>
          ) : (
            <label className="w-full h-full flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-lg hover:bg-slate-100/50 cursor-pointer transition p-2">
              <Upload className="w-4 h-4 text-slate-400 mb-0.5" />
              <span className="text-[9px] font-bold text-slate-500">Upload Signature Image</span>
              <span className="text-[7px] text-slate-400">PNG / JPG (Transparent is best)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

      </div>

      {/* Control bar for drawing clear */}
      {!isExporting && savedData && activeTab === "draw" && canvasActive && (
        <div className="flex justify-end mt-1 shrink-0">
          <button
            type="button"
            onClick={handleClear}
            className="text-[8px] font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-1.5 py-0.5 rounded transition"
          >
            Clear Drawing
          </button>
        </div>
      )}
    </div>
  );
}
