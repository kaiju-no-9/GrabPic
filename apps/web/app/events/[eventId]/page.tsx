"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { UploadPhotosModal } from "@/components/upload-photos-modal";
import { ScanFaceModal } from "@/components/scan-face-modal";
import { PhotoLightbox } from "@/components/photo-lightbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";
import {
  getEvent,
  getPhotos,
  deleteEvent,
  leaveEvent,
  downloadPhotos,
  type EventDetail,
  type PhotoData,
} from "@/api/events";

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const eventId = params.eventId as string;
  const { user, loading: authLoading } = useAuth();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState<{ role: string } | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [matchedPhotoIds, setMatchedPhotoIds] = useState<Set<string>>(new Set());
  
  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/signin");
    }
  }, [user, authLoading, router]);

  const fetchDetail = useCallback(async () => {
    try {
      const detail = await getEvent(eventId);
      setEvent(detail);
      setPhotos(detail.photos || []);
      if (detail.photos && detail.photos.length >= 20) {
        setNextCursor(detail.photos[detail.photos.length - 1]?.id || null);
      }

      const { getMyEvents } = await import("@/api/events");
      const events = await getMyEvents();
      const membership = events.find((m: any) => m.eventId === eventId);
      if (membership) {
        setMembership(membership);
      }
    } catch {
      toast("Event not found or access denied.", "error");
      router.replace("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [eventId, router, toast]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const loadMore = async () => {
    if (!nextCursor) return;
    try {
      const result = await getPhotos(eventId, nextCursor);
      setPhotos((prev) => [...prev, ...result.photos]);
      setNextCursor(result.nextCursor);
    } catch {
      toast("Failed to load more photos.", "error");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    try {
      await deleteEvent(eventId);
      toast("Event deleted successfully", "success");
      router.push("/dashboard");
    } catch {
      toast("Failed to delete event.", "error");
    }
  };

  const handleLeave = async () => {
    try {
      await leaveEvent(eventId);
      toast("Left the event", "success");
      router.push("/dashboard");
    } catch {
      toast("Failed to leave event.", "error");
    }
  };

  const handlePhotosFound = (foundPhotos: PhotoData[]) => {
    setMatchedPhotoIds(new Set(foundPhotos.map((p) => p.id)));
  };

  const handleDownloadMatches = async () => {
    if (matchedPhotoIds.size === 0) return;
    try {
      toast("Preparing download archive...", "default");
      await downloadPhotos(eventId, Array.from(matchedPhotoIds));
      toast("Download started", "success");
    } catch {
      toast("Failed to download photos.", "error");
    }
  };

  const isOwner = membership?.role === "OWNER";

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[--color-canvas]">
        <p className="text-[--color-muted] animate-pulse-soft font-mono text-xs">Loading...</p>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="min-h-screen bg-[--color-canvas] text-[--color-body]">
      <Navbar
        showSettings
        eventCode={event.code}
        showUpload={isOwner}
        showScan
        onUploadClick={() => setShowUpload(true)}
        onScanClick={() => setShowScan(true)}
      />

      <main className="mx-auto max-w-5xl px-6 py-12 animate-fade-in">
        {/* Event Header Information */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-[--color-hairline] pb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-display-md font-sans font-normal text-[--color-ink]">
                {event.title}
              </h1>
              <Badge variant={isOwner ? "complete" : "default"}>
                {isOwner ? "Owner" : "Member"}
              </Badge>
            </div>
            {event.description ? (
              <p className="text-body-md text-[--color-body] max-w-xl">{event.description}</p>
            ) : (
              <p className="text-sm text-[--color-muted-soft] italic">No description provided.</p>
            )}
            <p className="text-xs text-[--color-muted] font-mono">
              {event._count.photos} {event._count.photos === 1 ? "photo" : "photos"}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="secondary" size="sm" onClick={() => setShowScan(true)}>
              Find My Photos
            </Button>
            {isOwner ? (
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                Delete Event
              </Button>
            ) : (
              <Button variant="destructive" size="sm" onClick={handleLeave}>
                Leave Event
              </Button>
            )}
          </div>
        </div>

        {/* AI Face Scan Match Notification Banner */}
        {matchedPhotoIds.size > 0 && (
          <div className="mb-8 rounded-[--radius-lg] border border-[--color-success] bg-[--color-surface-card] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-scale-in">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[--color-success] animate-pulse" />
              <p className="text-sm font-medium text-[--color-ink]">
                Found {matchedPhotoIds.size} {matchedPhotoIds.size === 1 ? "photo" : "photos"} with your face!
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={handleDownloadMatches}>
              Download Matched Photos
            </Button>
          </div>
        )}

        {/* Photo Gallery Deck Grid */}
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-[--color-hairline-strong] rounded-[--radius-lg] bg-[--color-surface-card] p-8 max-w-xl mx-auto">
            <div className="h-12 w-12 rounded-full bg-[--color-canvas-soft] border border-[--color-hairline] flex items-center justify-center text-[--color-muted] mb-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <h3 className="text-title-sm text-[--color-ink] font-sans font-medium mb-1">
              No photos in this deck
            </h3>
            <p className="text-sm text-[--color-muted] max-w-sm mb-6">
              {isOwner
                ? "Start uploading photos to share them with your attendees."
                : "Wait for the organizer to upload photos."}
            </p>
            {isOwner && (
              <Button size="sm" onClick={() => setShowUpload(true)}>
                Upload Photos
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 animate-slide-up">
              {photos.map((photo, index) => {
                const isMatch = matchedPhotoIds.has(photo.id);
                return (
                  <div
                    key={photo.id}
                    onClick={() => {
                      setLightboxIndex(index);
                      setLightboxOpen(true);
                    }}
                    className={`group relative aspect-square overflow-hidden rounded-[--radius-lg] border bg-[--color-surface-card] cursor-pointer transition-all duration-300 ${
                      isMatch
                        ? "border-[--color-success] ring-2 ring-[--color-success]/15 hover:scale-[1.02]"
                        : "border-[--color-hairline] hover:border-[--color-hairline-strong] hover:scale-[1.02]"
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300"
                      loading="lazy"
                    />
                    {isMatch && (
                      <div className="absolute right-2.5 top-2.5">
                        <Badge variant="success" className="scale-95 shadow-sm">
                          Match
                        </Badge>
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {nextCursor && (
              <div className="mt-12 flex justify-center">
                <Button variant="secondary" onClick={loadMore}>
                  Load More Photos
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {isOwner && (
        <UploadPhotosModal
          open={showUpload}
          onClose={() => {
            setShowUpload(false);
            fetchDetail();
          }}
          eventId={eventId}
        />
      )}

      {showScan && (
        <ScanFaceModal
          open={showScan}
          onClose={() => setShowScan(false)}
          eventId={eventId}
          onPhotosFound={handlePhotosFound}
        />
      )}

      <PhotoLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        photos={photos}
        currentIndex={lightboxIndex}
        onIndexChange={setLightboxIndex}
      />
    </div>
  );
}