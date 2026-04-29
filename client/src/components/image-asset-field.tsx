import * as React from "react";
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Crop as CropIcon, ImagePlus, Link2, RotateCcw, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type ImageAssetFieldProps = {
  label: string;
  urlLabel: string;
  uploadLabel: string;
  urlValue: string;
  base64Value: string;
  error?: string;
  onUrlChange: (value: string) => void;
  onBase64Change: (value: string) => void;
  /** Aspect ratio (width / height). Omit to allow free crop. */
  cropAspect?: number;
  /** Max width in pixels for the cropped output (downscale). Default 1600. */
  maxOutputWidth?: number;
  /** Output mime. Default image/jpeg. */
  outputMime?: "image/jpeg" | "image/png" | "image/webp";
  /** JPEG/WebP quality 0..1. Default 0.85. */
  outputQuality?: number;
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.readAsDataURL(file);
  });
}

function buildInitialCrop(width: number, height: number, aspect?: number): Crop {
  if (!aspect) {
    return centerCrop(
      { unit: "%", x: 5, y: 5, width: 90, height: 90 },
      width,
      height,
    );
  }
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, width, height),
    width,
    height,
  );
}

async function cropToDataUrl(
  image: HTMLImageElement,
  crop: PixelCrop,
  maxWidth: number,
  mime: string,
  quality: number,
) {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const sourceWidth = crop.width * scaleX;
  const sourceHeight = crop.height * scaleY;
  const ratio = Math.min(1, maxWidth / sourceWidth);
  const targetWidth = Math.max(1, Math.round(sourceWidth * ratio));
  const targetHeight = Math.max(1, Math.round(sourceHeight * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context tidak tersedia.");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    targetWidth,
    targetHeight,
  );

  return canvas.toDataURL(mime, quality);
}

export function ImageAssetField({
  label,
  urlLabel,
  uploadLabel,
  urlValue,
  base64Value,
  error,
  onUrlChange,
  onBase64Change,
  cropAspect,
  maxOutputWidth = 1600,
  outputMime = "image/jpeg",
  outputQuality = 0.85,
}: ImageAssetFieldProps) {
  const [mode, setMode] = React.useState<"url" | "upload">(base64Value ? "upload" : "url");
  const [fileName, setFileName] = React.useState("");
  const [originalDataUrl, setOriginalDataUrl] = React.useState<string>("");
  const [crop, setCrop] = React.useState<Crop>();
  const [completedCrop, setCompletedCrop] = React.useState<PixelCrop>();
  const [cropMode, setCropMode] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement | null>(null);

  React.useEffect(() => {
    setMode(base64Value ? "upload" : "url");
  }, [base64Value]);

  const previewSrc = base64Value || urlValue;

  const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2MB
  const ALLOWED_MIMES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];
  const [validationError, setValidationError] = React.useState<string>("");

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    setValidationError("");
    if (!file) return;
    if (!ALLOWED_MIMES.includes(file.type)) {
      setValidationError(`Format ${file.type || "unknown"} tidak didukung. Pakai PNG/JPEG/WebP/GIF/SVG.`);
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setValidationError(`File terlalu besar: ${(file.size / 1024 / 1024).toFixed(2)}MB (max 2MB).`);
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    setOriginalDataUrl(dataUrl);
    setFileName(file.name);
    setCropMode(true);
    onUrlChange("");
    onBase64Change(dataUrl);
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(buildInitialCrop(width, height, cropAspect));
  }

  async function applyCrop() {
    if (!imgRef.current || !completedCrop || completedCrop.width === 0 || completedCrop.height === 0) {
      return;
    }
    const dataUrl = await cropToDataUrl(
      imgRef.current,
      completedCrop,
      maxOutputWidth,
      outputMime,
      outputQuality,
    );
    onBase64Change(dataUrl);
    setCropMode(false);
  }

  function useOriginal() {
    if (originalDataUrl) onBase64Change(originalDataUrl);
    setCropMode(false);
  }

  function reEnterCrop() {
    if (originalDataUrl) {
      onBase64Change(originalDataUrl);
      setCropMode(true);
    }
  }

  function clearUpload() {
    onBase64Change("");
    setFileName("");
    setOriginalDataUrl("");
    setCropMode(false);
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>{label}</Label>
        <p className="text-xs text-muted-foreground">
          Pakai URL publik atau upload gambar lokal — bisa di-crop sebelum disimpan ke DB sebagai base64.
        </p>
      </div>

      <Tabs
        value={mode}
        onValueChange={(value) => {
          const nextMode = value as "url" | "upload";
          setMode(nextMode);
          if (nextMode === "url") {
            clearUpload();
            return;
          }
          onUrlChange("");
        }}
        className="space-y-3"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url" className="gap-2">
            <Link2 className="h-4 w-4" />
            URL
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="space-y-2">
          <Input
            value={urlValue}
            onChange={(event) => onUrlChange(event.target.value)}
            placeholder={urlLabel}
          />
        </TabsContent>

        <TabsContent value="upload" className="space-y-3">
          <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-4">
            <Label htmlFor={`${label}-upload`} className="sr-only">
              {uploadLabel}
            </Label>
            <Input
              id={`${label}-upload`}
              type="file"
              accept="image/*"
              onChange={(event) => {
                void handleFileChange(event);
              }}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Format: PNG, JPG, WEBP. Max output {maxOutputWidth}px lebar (auto downscale).
            </p>
            {fileName ? (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-background px-3 py-2 text-sm">
                <span className="truncate">{fileName}</span>
                <div className="flex gap-1">
                  {!cropMode && originalDataUrl ? (
                    <Button type="button" variant="ghost" size="icon" onClick={reEnterCrop} title="Crop ulang">
                      <CropIcon className="h-4 w-4" />
                    </Button>
                  ) : null}
                  <Button type="button" variant="ghost" size="icon" onClick={clearUpload} title="Hapus">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : null}

            {cropMode && originalDataUrl ? (
              <div className="mt-3 space-y-2">
                <div className="overflow-hidden rounded-lg bg-background">
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percent) => setCrop(percent)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={cropAspect}
                    keepSelection
                  >
                    <img
                      ref={imgRef}
                      alt="Crop source"
                      src={originalDataUrl}
                      onLoad={onImageLoad}
                      className="max-h-[400px] w-full object-contain"
                    />
                  </ReactCrop>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" onClick={applyCrop} className="gap-2">
                    <CropIcon className="h-4 w-4" />
                    Apply crop
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={useOriginal} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Pakai original
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </TabsContent>
      </Tabs>

      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-border/60 bg-muted/20",
          !previewSrc && "border-dashed",
        )}
      >
        {previewSrc && !cropMode ? (
          <img src={previewSrc} alt={label} className="h-44 w-full object-cover" />
        ) : !previewSrc ? (
          <div className="flex h-44 flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImagePlus className="h-6 w-6" />
            <p className="text-sm">Preview gambar akan muncul di sini.</p>
          </div>
        ) : null}
      </div>

      {validationError ? <p className="text-sm font-medium text-destructive">{validationError}</p> : null}
      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
    </div>
  );
}
