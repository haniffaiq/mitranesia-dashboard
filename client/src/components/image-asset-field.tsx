import * as React from "react";
import { ImagePlus, Link2, Upload, X } from "lucide-react";
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
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.readAsDataURL(file);
  });
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
}: ImageAssetFieldProps) {
  const [mode, setMode] = React.useState<"url" | "upload">(base64Value ? "upload" : "url");
  const [fileName, setFileName] = React.useState("");

  React.useEffect(() => {
    setMode(base64Value ? "upload" : "url");
  }, [base64Value]);

  const previewSrc = base64Value || urlValue;

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const dataUrl = await readFileAsDataUrl(file);
    onBase64Change(dataUrl);
    onUrlChange("");
    setFileName(file.name);
  }

  function clearUpload() {
    onBase64Change("");
    setFileName("");
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>{label}</Label>
        <p className="text-xs text-muted-foreground">
          Gunakan URL publik atau upload gambar lokal yang akan dikonversi ke base64.
        </p>
      </div>

      <Tabs
        value={mode}
        onValueChange={(value) => {
          const nextMode = value as "url" | "upload";
          setMode(nextMode);
          if (nextMode === "url") {
            onBase64Change("");
            setFileName("");
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
              Format yang disarankan: PNG, JPG, atau WEBP.
            </p>
            {fileName ? (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-background px-3 py-2 text-sm">
                <span className="truncate">{fileName}</span>
                <Button type="button" variant="ghost" size="icon" onClick={clearUpload}>
                  <X className="h-4 w-4" />
                </Button>
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
        {previewSrc ? (
          <img src={previewSrc} alt={label} className="h-44 w-full object-cover" />
        ) : (
          <div className="flex h-44 flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImagePlus className="h-6 w-6" />
            <p className="text-sm">Preview gambar akan muncul di sini.</p>
          </div>
        )}
      </div>

      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
    </div>
  );
}
