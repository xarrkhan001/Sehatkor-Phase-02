import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Upload, Camera, ImageIcon, Crop, RotateCcw, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import Cropper, { Area, MediaSize } from 'react-easy-crop';

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void;
  onImageRemove: () => void;
  currentImage?: string;
  className?: string;
  placeholder?: string;
  aspectRatio?: number; // New prop for aspect ratio (width/height)
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  onImageRemove,
  currentImage,
  className,
  placeholder = "Upload service image",
  aspectRatio = 16 / 9
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropping state
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const ASPECT = aspectRatio; // Configurable aspect ratio

  // Transform controls
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [mediaSize, setMediaSize] = useState<MediaSize | null>(null);
  const [mediaReady, setMediaReady] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      // Fallback to a sensible width if not measured yet
      const baseW = rect?.width && rect.width > 0 ? rect.width : 720;
      const w = Math.min(760, baseW);
      const h = Math.max(ASPECT === 1 ? 400 : 320, Math.round(w / ASPECT));
      setContainerSize({ w, h });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isCropOpen, ASPECT]);

  // Compute minZoom on media load so the image always covers the crop area
  useEffect(() => {
    if (!mediaSize || !containerSize.w || !containerSize.h) return;
    const coverZoom = Math.max(containerSize.w / mediaSize.naturalWidth, containerSize.h / mediaSize.naturalHeight);
    const mz = Math.min(Math.max(coverZoom, 0.1), 3);
    setMinZoom(mz);
    setZoom((prev) => Math.max(prev, mz));
  }, [mediaSize, containerSize.w, containerSize.h]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      startCropForFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const files = e.target.files;
    if (files && files[0]) {
      startCropForFile(files[0]);
    }
  };

  const startCropForFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setRawImageSrc(dataUrl);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setIsCropOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const clampZoom = (z: number) => Math.max(minZoom, Math.min(3, z));

  const renderCropped = async () => {
    if (!rawImageSrc || !croppedAreaPixels) return;
    // Load image from data URL
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject as any;
      img.src = rawImageSrc;
    });

    // Target output size (consistent card quality)
    const outW = 1600;
    const outH = Math.round(outW / ASPECT);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = outW;
    canvas.height = outH;

    const { x, y, width, height } = croppedAreaPixels;
    if (ctx) {
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(
        image,
        x, // source x
        y, // source y
        width, // source width
        height, // source height
        0, // dest x
        0, // dest y
        outW, // dest width
        outH // dest height
      );
    }

    return new Promise<{ file: File; preview: string }>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const file = new File([blob], `${ASPECT === 1 ? 'profile' : 'service'}-image-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({ file, preview: (e.target?.result as string) || '' });
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.9);
    });
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      {currentImage ? (
        <Card className="relative group">
          <div className={`relative w-full max-w-xs overflow-hidden rounded-lg ${ASPECT === 1 ? 'aspect-square' : 'aspect-video'}`}>
            <img
              src={currentImage}
              alt="Service preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleButtonClick}
                  className="bg-white/90 hover:bg-white text-black text-xs px-2 py-1"
                >
                  <Camera className="w-3 h-3 mr-1" />
                  Change
                </Button>
                {/* Open crop dialog by selecting a new image; editing existing web image isn't supported without raw file */}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onImageRemove}
                  className="bg-red-500/90 hover:bg-red-600 text-xs px-2 py-1"
                >
                  <X className="w-3 h-3 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card
          className={cn(
            "border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer bg-gray-300",
            dragActive && "border-primary bg-primary/5"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <div className="p-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                {dragActive ? (
                  <Upload className="w-5 h-5 text-primary animate-bounce" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium">
                  {dragActive ? "Drop image here" : placeholder}
                </p>
                <p className="text-xs text-muted-foreground">
                  Click to browse
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Cropper Dialog */}
      <Dialog open={isCropOpen} onOpenChange={setIsCropOpen}>
        <DialogContent className="sm:max-w-[900px] w-[96vw] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-700/60 rounded-2xl shadow-2xl backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Crop className="w-4 h-4" />
              Adjust image ({ASPECT === 1 ? '1:1' : '16:9'})
            </DialogTitle>
            <p className="text-xs text-slate-300 mt-1">Zoom and drag to frame your {ASPECT === 1 ? 'profile' : 'service'} image. The exact cropped area will be uploaded.</p>
          </DialogHeader>
          <div className="space-y-4">
            <div
              ref={containerRef}
              className="w-full"
            >
              <div
                className="relative rounded-xl overflow-hidden select-none shadow-inner ring-1 ring-white/15"
                style={{ width: '100%', maxWidth: 860, height: containerSize.h }}
              >
                {!mediaReady && (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 animate-pulse" />
                )}
                {rawImageSrc && (
                  <Cropper
                    image={rawImageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={ASPECT}
                    zoomWithScroll
                    minZoom={minZoom}
                    maxZoom={3}
                    showGrid
                    cropShape="rect"
                    objectFit="contain"
                    onCropChange={setCrop}
                    onZoomChange={(z) => setZoom(clampZoom(z))}
                    onCropComplete={(area, areaPx) => setCroppedAreaPixels(areaPx)}
                    onMediaLoaded={(ms) => { setMediaSize(ms); setMediaReady(true); }}
                    style={{ containerStyle: { width: '100%', height: containerSize.h } as any }}
                  />
                )}
                {/* Elegant frame */}
                <div className="pointer-events-none absolute inset-0 ring-1 ring-white/25 rounded-xl" />
              </div>
            </div>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-xs text-slate-300">Zoom</span>
                <Button type="button" variant="outline" size="sm" className="border-slate-600 text-white bg-slate-800/60 hover:bg-slate-800" onClick={() => setZoom(clampZoom(zoom - 0.1))}>
                  <Minus className="w-3.5 h-3.5" />
                </Button>
                <input
                  type="range"
                  min={minZoom}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Math.max(minZoom, parseFloat(e.target.value)))}
                  className="flex-1 accent-red-500"
                />
                <Button type="button" variant="outline" size="sm" className="border-slate-600 text-white bg-slate-800/60 hover:bg-slate-800" onClick={() => setZoom(clampZoom(zoom + 0.1))}>
                  <Plus className="w-3.5 h-3.5" />
                </Button>
                <span className="text-xs text-slate-300 w-12 text-right">{zoom.toFixed(2)}x</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-slate-200 hover:bg-white/5"
                  onClick={() => {
                    setZoom(minZoom);
                    setCrop({ x: 0, y: 0 });
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-1" /> Reset
                </Button>
                <Button type="button" variant="outline" className="border-slate-600 text-white bg-slate-800/60 hover:bg-slate-800" onClick={() => setIsCropOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={!mediaReady || !croppedAreaPixels}
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 border-0"
                  onClick={async () => {
                    const result = await renderCropped();
                    if (result) {
                      onImageSelect(result.file, result.preview);
                    }
                    setIsCropOpen(false);
                  }}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageUpload;