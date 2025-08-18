import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { RotateCcw, RotateCw, Crop, Check, X } from 'lucide-react';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  imageSrc,
  onCropComplete,
  onCancel,
  isOpen
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState([1]);
  const [rotation, setRotation] = useState(0);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context
    ctx.save();

    // Apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom[0], zoom[0]);
    ctx.translate(-image.width / 2, -image.height / 2);

    // Draw image
    ctx.drawImage(image, 0, 0);

    // Restore context
    ctx.restore();

    // Draw crop overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Clear crop area
    ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    
    // Draw crop border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
  }, [cropArea, zoom, rotation]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is inside crop area
    if (
      x >= cropArea.x &&
      x <= cropArea.x + cropArea.width &&
      y >= cropArea.y &&
      y <= cropArea.y + cropArea.height
    ) {
      setIsDragging(true);
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newX = Math.max(0, Math.min(x - dragStart.x, canvas.width - cropArea.width));
    const newY = Math.max(0, Math.min(y - dragStart.y, canvas.height - cropArea.height));

    setCropArea(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    // Create a new canvas for the cropped image
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');
    if (!cropCtx) return;

    cropCanvas.width = cropArea.width;
    cropCanvas.height = cropArea.height;

    // Get the image data from the main canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    cropCtx.putImageData(imageData, 0, 0);

    // Convert to blob and return
    cropCanvas.toBlob((blob) => {
      if (blob) {
        const reader = new FileReader();
        reader.onload = () => {
          onCropComplete(reader.result as string);
        };
        reader.readAsDataURL(blob);
      }
    }, 'image/jpeg', 0.9);
  };

  const handleImageLoad = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    // Set canvas size to image size
    canvas.width = Math.min(image.width, 600);
    canvas.height = Math.min(image.height, 400);

    // Initialize crop area to center
    const cropSize = Math.min(canvas.width, canvas.height) * 0.6;
    setCropArea({
      x: (canvas.width - cropSize) / 2,
      y: (canvas.height - cropSize) / 2,
      width: cropSize,
      height: cropSize
    });

    drawCanvas();
  };

  React.useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Hidden image for loading */}
          <img
            ref={imageRef}
            src={imageSrc}
            onLoad={handleImageLoad}
            className="hidden"
            alt="Source"
          />
          
          {/* Canvas for cropping */}
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="border border-gray-300 cursor-move"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Zoom: {zoom[0].toFixed(1)}x</label>
              <Slider
                value={zoom}
                onValueChange={setZoom}
                min={0.5}
                max={3}
                step={0.1}
                className="mt-2"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRotation(prev => prev - 90)}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Rotate Left
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRotation(prev => prev + 90)}
              >
                <RotateCw className="w-4 h-4 mr-1" />
                Rotate Right
              </Button>
              <span className="text-sm text-gray-500">Rotation: {rotation}°</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
          <Button onClick={handleCrop}>
            <Check className="w-4 h-4 mr-1" />
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropper;
