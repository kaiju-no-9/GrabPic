import { GoogleButton } from "@/components/google-button";
import { GithubButton } from "@/components/github-button";
import Link from "next/link";

export default function SignIn() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[--color-canvas]">
      {/* Left Branding Panel */}
      <div className="flex-1 flex flex-col justify-between p-8 md:p-16 border-b md:border-b-0 md:border-r border-[--color-hairline]">
        <div className="flex items-center gap-2">
          <span className="text-[18px] font-semibold text-[--color-ink] tracking-tight font-mono">
            GrabPic
          </span>
        </div>
        
        <div className="my-auto py-12 md:py-0 max-w-lg space-y-8">
          <div className="space-y-4">
            <h1 className="text-display-lg md:text-display-mega leading-none">
              Find your face in the crowd.
            </h1>
            <p className="text-body-md text-[--color-body] max-w-sm">
              Create events, share photo decks, and let attendees locate their pictures instantly with our quietly powerful AI face scan.
            </p>
          </div>

          {/* AI Search/Processing Simulation Card */}
          <div className="relative w-full max-w-md border border-[--color-hairline] bg-[--color-surface-card] rounded-[--radius-lg] p-5 space-y-4 animate-scale-in">
            {/* Mock Window Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[--color-hairline-soft]">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[--color-hairline-strong]" />
                <div className="w-2 h-2 rounded-full bg-[--color-hairline-soft]" />
                <div className="w-2 h-2 rounded-full bg-[--color-hairline-soft]" />
              </div>
              <span className="text-[10px] font-mono text-[--color-muted] bg-[--color-canvas-soft] px-2 py-0.5 rounded border border-[--color-hairline] uppercase tracking-wider">
                A3X9K2
              </span>
            </div>
            
            {/* Mock Event Meta */}
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-sm font-semibold text-[--color-ink] font-sans">Company Retreat 2026</h3>
                <p className="text-[11px] text-[--color-muted] font-mono">142 photos</p>
              </div>
            </div>

            {/* Mock Photo Grid with Scanning Face */}
            <div className="grid grid-cols-3 gap-2">
              <div className="relative aspect-square rounded-[--radius-md] bg-[--color-canvas-soft] border border-[--color-hairline] overflow-hidden flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border border-dashed border-[--color-primary] animate-spin opacity-85" />
                <div className="absolute bottom-1 right-1 text-[9px] font-mono bg-[--color-primary] text-[--color-on-primary] px-1 rounded-[--radius-xs]">
                  Match
                </div>
              </div>
              <div className="aspect-square rounded-[--radius-md] bg-[--color-canvas-soft] border border-[--color-hairline]" />
              <div className="aspect-square rounded-[--radius-md] bg-[--color-canvas-soft] border border-[--color-hairline]" />
              <div className="aspect-square rounded-[--radius-md] bg-[--color-canvas-soft] border border-[--color-hairline]" />
              <div className="relative aspect-square rounded-[--radius-md] bg-[--color-canvas-soft] border border-[--color-hairline] overflow-hidden flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border border-[--color-success] flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-[--color-success]/10 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[--color-success]" />
                  </div>
                </div>
                <div className="absolute bottom-1 right-1 text-[9px] font-mono bg-[--color-success] text-white px-1 rounded-[--radius-xs]">
                  Match
                </div>
              </div>
              <div className="aspect-square rounded-[--radius-md] bg-[--color-canvas-soft] border border-[--color-hairline]" />
            </div>

            {/* Mock Status Pills */}
            <div className="flex gap-2 pt-3 border-t border-[--color-hairline-soft]">
              <span className="inline-flex items-center rounded-full bg-[--color-pill-processing]/15 px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase text-[--color-ink] border border-[--color-pill-processing]/30">
                Thinking
              </span>
              <span className="inline-flex items-center rounded-full bg-[--color-pill-detecting]/15 px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase text-[--color-ink] border border-[--color-pill-detecting]/30">
                Detecting
              </span>
              <span className="inline-flex items-center rounded-full bg-[--color-pill-complete]/15 px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase text-[--color-ink] border border-[--color-pill-complete]/30">
                Done
              </span>
            </div>
          </div>
        </div>

        <div className="text-caption">
          © {new Date().getFullYear()} GrabPic. Editorial Calm.
        </div>
      </div>

      {/* Right Auth Card Panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-16 bg-[--color-canvas-soft]">
        <div className="w-full max-w-sm space-y-8 animate-slide-up">
          <div className="space-y-2">
            <h2 className="text-display-sm font-sans font-normal text-[--color-ink]">
              Welcome back
            </h2>
            <p className="text-sm text-[--color-body]">
              Sign in to access your dashboard and event photo decks.
            </p>
          </div>

          <div className="p-8 rounded-[--radius-lg] border border-[--color-hairline] bg-[--color-surface-card] space-y-4">
            <GoogleButton />
            <GithubButton />
            
            <div className="pt-4 border-t border-[--color-hairline-soft] text-center text-xs text-[--color-muted]">
              Your selfies are processed in memory and never stored permanently.
            </div>
          </div>

          <p className="text-center text-sm text-[--color-muted]">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-[--color-ink] underline underline-offset-4 hover:text-[--color-primary] transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}