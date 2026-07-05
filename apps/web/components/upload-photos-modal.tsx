"use client";

import { useRef, useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getSignedUrl, confirmPhotos } from "@/api/events";
import { useToast } from "@/components/ui/toast";

interface UploadPhotosModalProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
}

interface UploadedFile {
  publicId: string;
  url: string;
  width: number;
  height: number;
}

export function UploadPhotosModal({ open, onClose, eventId }: UploadPhotosModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<UploadedFile[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setUploaded([]);
      setDone(false);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);

    try {
      const signed = await getSignedUrl(eventId);
      const results: UploadedFile[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", signed.apiKey);
        formData.append("timestamp", String(signed.timestamp));
        formData.append("signature", signed.signature);
        formData.append("folder", signed.folder);

        const resp = await fetch(
          `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`,
          { method: "POST", body: formData }
        );

        if (!resp.ok) {
          const err = await resp.json();
          throw new Error(err.error?.message || "Upload failed");
        }

        const result = await resp.json();
        results.push({
          publicId: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
        });
      }

      setUploaded(results);
      toast("Photos uploaded to cloud. Please confirm to finalize.", "success");
    } catch (e: any) {
      const msg = e.message || "Upload failed";
      toast(msg, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = async () => {
    if (uploaded.length === 0) return;
    setConfirming(true);
    try {
      await confirmPhotos(eventId, uploaded);
      setDone(true);
      toast("Photos registered successfully!", "success");
    } catch {
      toast("Confirmation failed.", "error");
    } finally {
      setConfirming(false);
    }
  };

  const reset = () => {
    setFiles([]);
    setUploaded([]);
    setDone(false);
    setConfirming(false);
    setUploading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogHeader>
        <DialogTitle>{done ? "Complete" : "Upload Photos"}</DialogTitle>
        <DialogDescription>
          {done ? "Embedding extraction is now queued in background" : "Add event photos to the collection."}
        </DialogDescription>
      </DialogHeader>

      {done ? (
        <div className="py-6 text-center space-y-4 animate-scale-in">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-[--color-success]/10 text-[--color-success] border border-[--color-success]/20">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-[--color-body] max-w-xs mx-auto">
            {uploaded.length} {uploaded.length === 1 ? "photo" : "photos"} saved. The AI face scanning service is processing embeddings in the background.
          </p>
          <DialogFooter className="pt-2">
            <Button variant="default" onClick={handleClose} className="w-full">
              Done
            </Button>
          </DialogFooter>
        </div>
      ) : uploaded.length > 0 ? (
        <div className="space-y-4 py-4 animate-scale-in">
          <p className="text-sm text-[--color-body] text-center bg-[--color-canvas-soft] border border-[--color-hairline] p-4 rounded-[--radius-md]">
            Ready to index <span className="font-mono font-semibold text-[--color-ink]">{uploaded.length}</span> {uploaded.length === 1 ? "photo" : "photos"}.
          </p>
          <DialogFooter>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirm} disabled={confirming}>
              {confirming ? "Processing..." : "Confirm & Save"}
            </Button>
          </DialogFooter>
        </div>
      ) : (
        <div className="space-y-4 py-2 animate-scale-in">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          {files.length === 0 ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-[--radius-lg] border border-dashed border-[--color-hairline-strong] bg-[--color-canvas-soft] hover:border-[--color-primary] px-6 py-12 text-sm text-[--color-body] hover:text-[--color-ink] transition-all duration-200"
            >
              <div className="p-3 rounded-full bg-[--color-surface-card] border border-[--color-hairline] mb-1">
                <svg className="h-6 w-6 text-[--color-muted]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-sans font-medium text-[--color-ink]">Select event photos</span>
              <span className="text-xs text-[--color-muted] font-mono">Multiple selection supported</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs uppercase tracking-wider text-[--color-muted] font-mono font-semibold">
                <span>{files.length} selected</span>
                <button onClick={() => setFiles([])} className="text-[--color-error] hover:underline cursor-pointer">
                  Clear
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1.5 border border-[--color-hairline] rounded-[--radius-md] p-2 bg-[--color-canvas-soft] font-mono text-xs">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-[--color-body] py-1 px-1.5 rounded-[--radius-xs] hover:bg-black/5">
                    <span className="truncate flex-1">{f.name}</span>
                    <button
                      className="text-[--color-muted] hover:text-[--color-error] transition-colors cursor-pointer"
                      onClick={() => setFiles(files.filter((_, j) => j !== i))}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs h-9 bg-white"
                onClick={() => fileInputRef.current?.click()}
              >
                Add more files
              </Button>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button variant="secondary" onClick={handleClose} disabled={uploading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
            >
              {uploading ? "Uploading..." : "Start Upload"}
            </Button>
          </DialogFooter>
        </div>
      )}
    </Dialog>
  );
}