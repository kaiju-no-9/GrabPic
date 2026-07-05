"use client";

import { useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface Photo {
  id: string;
  url: string;
}

interface PhotoLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  photos: Photo[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export function PhotoLightbox({
  isOpen,
  onClose,
  photos,
  currentIndex,
  onIndexChange,
}: PhotoLightboxProps) {
  const currentPhoto = photos[currentIndex];

  const handleNext = useCallback(() => {
    if (currentIndex < photos.length - 1) {
      onIndexChange(currentIndex + 1);
    }
  }, [currentIndex, photos.length, onIndexChange]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  }, [currentIndex, onIndexChange]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    },
    [onClose, handleNext, handlePrev]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !currentPhoto) return null;

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(currentPhoto.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `photo-${currentPhoto.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // fallback
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between bg-[--color-ink]/98 p-6 animate-fade-in text-[--color-canvas]"
      onClick={onClose}
    >
      {/* Top Header Controls */}
      <div className="flex items-center justify-between w-full p-2 z-10 border-b border-white/5 pb-4">
        <span className="text-xs font-mono text-[--color-muted-soft] select-none">
          {currentIndex + 1} <span className="text-white/20">/</span> {photos.length}
        </span>
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownload}
            className="h-8 text-xs bg-white/5 border-white/10 hover:bg-white/10 text-white hover:border-white/20"
          >
            Download
          </Button>
          <button
            onClick={onClose}
            className="p-1 rounded-[--radius-sm] text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close lightbox"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Center Image Deck */}
      <div className="relative flex-1 flex items-center justify-center w-full my-6 select-none">
        {/* Navigation Arrow Left */}
        {currentIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-0 p-3 rounded-[--radius-md] bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 hover:text-white transition-colors z-10 cursor-pointer"
            aria-label="Previous photo"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* The Frame */}
        <div 
          className="relative max-w-full max-h-[75vh] flex items-center justify-center p-2 rounded-[--radius-lg] border border-white/5 bg-black/20"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={currentPhoto.url}
            alt=""
            className="max-w-full max-h-[70vh] object-contain select-none rounded-[--radius-md] border border-white/5 animate-scale-in"
          />
        </div>

        {/* Navigation Arrow Right */}
        {currentIndex < photos.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-0 p-3 rounded-[--radius-md] bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 hover:text-white transition-colors z-10 cursor-pointer"
            aria-label="Next photo"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Bottom Info Offset */}
      <div className="h-8" />
    </div>
  );
}
