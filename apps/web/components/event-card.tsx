import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EventData } from "@/api/events";

interface EventCardProps {
  event: EventData;
  photoCount: number;
  isOwner: boolean;
}

export function EventCard({ event, photoCount, isOwner }: EventCardProps) {
  return (
    <Link href={`/events/${event.id}`}>
      <Card className="w-full border border-hairline hover:border-hairline-strong hover:-translate-y-[1px] transition-all duration-200 cursor-pointer bg-surface-card select-none">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h3 className="text-title-sm truncate text-ink font-sans font-medium">
                {event.title}
              </h3>
              <Badge variant={isOwner ? "complete" : "default"} className="scale-90 origin-left">
                {isOwner ? "Owner" : "Member"}
              </Badge>
            </div>
            {event.description ? (
              <p className="text-sm text-body truncate max-w-sm">
                {event.description}
              </p>
            ) : (
              <p className="text-xs text-muted-soft italic">
                No description provided.
              </p>
            )}
            <p className="mt-3 text-xs text-muted font-mono">
              {photoCount} {photoCount === 1 ? "photo" : "photos"}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-mono text-[11px] font-semibold text-ink bg-canvas-soft px-2.5 py-1 rounded-sm border border-hairline uppercase tracking-wider">
              {event.code}
            </span>
            <svg className="h-4 w-4 text-muted transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}