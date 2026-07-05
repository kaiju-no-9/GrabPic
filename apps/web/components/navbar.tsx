"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface NavbarProps {
  showCreateEvent?: boolean;
  showJoinEvent?: boolean;
  showSettings?: boolean;
  eventCode?: string;
  showUpload?: boolean;
  showScan?: boolean;
  onUploadClick?: () => void;
  onScanClick?: () => void;
}

export function Navbar({
  showCreateEvent,
  showJoinEvent,
  showSettings,
  eventCode,
  showUpload,
  showScan,
  onUploadClick,
  onScanClick,
}: NavbarProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isLoggedIn = !!user;

  const handleCopyCode = () => {
    if (eventCode) {
      navigator.clipboard.writeText(eventCode);
      toast("Event code copied to clipboard", "success");
    }
  };

  return (
    <nav className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[--color-hairline] bg-[--color-canvas] px-6">
      <div className="flex items-center gap-4">
        {showSettings && isLoggedIn && (
          <Link href="/dashboard" aria-label="Go to Dashboard">
            <Button variant="ghost" size="icon" className="text-[--color-body] hover:text-[--color-ink]">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Button>
          </Link>
        )}
        <Link href="/" className="text-[18px] font-semibold tracking-tight text-[--color-ink] font-mono">
          GrabPic
        </Link>
      </div>

      {eventCode && (
        <div className="flex items-center gap-2 rounded-[--radius-sm] border border-[--color-hairline] bg-[--color-canvas-soft] px-3 py-1 text-sm font-mono text-[--color-ink]">
          <span>{eventCode}</span>
          <button
            onClick={handleCopyCode}
            className="text-[--color-muted] hover:text-[--color-ink] transition-colors"
            title="Copy code"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        {!isLoggedIn ? (
          <>
            <Link href="/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary">Get Started</Button>
            </Link>
          </>
        ) : (
          <>
            {showUpload && onUploadClick && (
              <Button onClick={onUploadClick} size="sm">
                Upload Photos
              </Button>
            )}
            {showScan && onScanClick && (
              <Button onClick={onScanClick} variant="primary" size="sm">
                Scan Face
              </Button>
            )}
            {showCreateEvent && (
              <Link href="/dashboard?create=true">
                <Button variant="primary" size="sm">
                  Create Event
                </Button>
              </Link>
            )}
            {showJoinEvent && (
              <Link href="/dashboard?join=true">
                <Button variant="secondary" size="sm">
                  Join Event
                </Button>
              </Link>
            )}
          </>
        )}
      </div>
    </nav>
  );
}