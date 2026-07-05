"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { EventCard } from "@/components/event-card";
import { CreateEventDialog } from "@/components/create-event-dialog";
import { JoinEventDialog } from "@/components/join-event-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { getMyEvents, getEvent, type EventMembership } from "@/api/events";
import { useToast } from "@/components/ui/toast";

export function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [memberships, setMemberships] = useState<EventMembership[]>([]);
  const [photoCounts, setPhotoCounts] = useState<Record<string, number>>({});
  const [fetching, setFetching] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setShowCreate(true);
      router.replace("/dashboard");
    } else if (searchParams.get("join") === "true") {
      setShowJoin(true);
      router.replace("/dashboard");
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/signin");
    }
  }, [user, loading, router]);

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    setFetching(true);
    try {
      const events = await getMyEvents();
      setMemberships(events);

      const counts: Record<string, number> = {};
      await Promise.all(
        events.map(async (m) => {
          try {
            const detail = await getEvent(m.eventId);
            counts[m.eventId] = detail._count.photos;
          } catch {
            counts[m.eventId] = 0;
          }
        }),
      );
      setPhotoCounts(counts);
    } catch {
      toast("Failed to load events", "error");
    } finally {
      setFetching(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <p className="text-muted animate-pulse-soft font-mono text-xs">Loading...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      const { logout } = await import("@/api/auth");
      await logout();
      toast("Signed out successfully", "success");
      router.replace("/signin");
    } catch {
      toast("Logout failed", "error");
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-body">
      <Navbar showSettings />
      <main className="mx-auto max-w-4xl px-6 py-20 animate-fade-in">
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 border-b border-hairline pb-8">
          <div className="space-y-2">
            <h1 className="text-display-md font-sans font-normal text-ink">
              Your Events
            </h1>
            <p className="text-sm text-muted">
              Logged in as <span className="font-mono text-ink">{user.email}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => setShowJoin(true)}>
              Join Event
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
              Create Event
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs hover:text-error">
              Sign out
            </Button>
          </div>
        </div>

        {fetching ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[92px] animate-shimmer rounded-lg border border-hairline" />
            ))}
          </div>
        ) : memberships.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-hairline-strong rounded-lg bg-surface-card p-8 max-w-xl mx-auto animate-scale-in">
            <div className="h-12 w-12 rounded-full bg-canvas-soft border border-hairline flex items-center justify-center text-muted mb-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
            </div>
            <h3 className="text-title-sm text-ink font-sans font-medium mb-1">
              No active event decks
            </h3>
            <p className="text-sm text-muted max-w-sm mb-6">
              Create a new photo collection deck or enter a 6-character access code from an organizer to get started.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" size="sm" onClick={() => setShowJoin(true)}>
                Join Event
              </Button>
              <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
                Create Event
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
            {memberships.map((m) => (
              <EventCard
                key={m.eventId}
                event={m.event!}
                photoCount={photoCounts[m.eventId] ?? 0}
                isOwner={m.role === "OWNER"}
              />
            ))}
          </div>
        )}
      </main>

      <CreateEventDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(eventId) => {
          toast("Event created successfully", "success");
          router.push(`/events/${eventId}`);
        }}
      />
      <JoinEventDialog
        open={showJoin}
        onClose={() => setShowJoin(false)}
        onJoined={(eventId) => {
          toast("Joined event successfully", "success");
          router.push(`/events/${eventId}`);
        }}
      />
    </div>
  );
}