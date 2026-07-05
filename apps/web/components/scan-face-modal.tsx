"use client";

import { useRef, useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { searchFace, type PhotoData } from "@/api/events";
import { useToast } from "@/components/ui/toast";

interface ScanFaceModalProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  onPhotosFound: (photos: PhotoData[]) => void;
}

export function ScanFaceModal({ open, onClose, eventId, onPhotosFound }: ScanFaceModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelfie(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleScan = async () => {
    if (!selfie) return;
    setScanning(true);
    setError(null);

    try {
      const result = await searchFace(eventId, selfie);
      if (result.photos.length > 0) {
        toast(`Found ${result.photos.length} photos with your face!`, "success");
      } else {
        toast("No matching photos found for this face.", "default");
      }
      onPhotosFound(result.photos);
      onClose();
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || "Face search failed. Please try again.";
      setError(msg);
      toast(msg, "error");
    } finally {
      setScanning(false);
    }
  };

  const reset = () => {
    setSelfie(null);
    setPreview(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogHeader>
        <DialogTitle>Find Your Photos</DialogTitle>
        <DialogDescription>
          Upload a selfie to locate all event pictures containing your face.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-6 flex flex-col items-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={scanning}
        />

        {preview ? (
          <div className="flex flex-col items-center gap-4 w-full animate-scale-in">
            <div className="relative h-44 w-44 rounded-full border border-[--color-hairline-strong] overflow-hidden bg-[--color-canvas-soft] flex items-center justify-center">
              <img
                src={preview}
                alt="Selfie preview"
                className="h-full w-full object-cover"
              />
              
              {/* Pulsing Scan Grid Animation overlay */}
              {scanning && (
                <div className="absolute inset-0 bg-[--color-ink]/60 flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 border-2 border-[--color-primary] border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-mono text-white/90 tracking-widest uppercase animate-pulse-soft">
                    Searching
                  </span>
                </div>
              )}
            </div>
            {!scanning && (
              <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                Change Selfie
              </Button>
            )}
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-[--radius-lg] border border-dashed border-[--color-hairline-strong] bg-[--color-canvas-soft] hover:border-[--color-primary] px-6 py-12 text-sm text-[--color-body] hover:text-[--color-ink] transition-all duration-200"
          >
            <div className="p-3 rounded-full bg-[--color-surface-card] border border-[--color-hairline] mb-1">
              <svg className="h-6 w-6 text-[--color-muted]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <span className="font-sans font-medium text-[--color-ink]">Upload a selfie</span>
            <span className="text-xs text-[--color-muted] font-mono">Processed in memory, never stored</span>
          </button>
        )}

        {error && (
          <p className="text-xs text-[--color-error] text-center max-w-xs font-mono">{error}</p>
        )}
      </div>

      <DialogFooter>
        <Button variant="secondary" onClick={handleClose} disabled={scanning}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleScan}
          disabled={!selfie || scanning}
        >
          {scanning ? "Searching..." : "Find My Photos"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}