"use client";

import { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { joinEvent } from "@/api/events";
import { useToast } from "@/components/ui/toast";

interface JoinEventDialogProps {
  open: boolean;
  onClose: () => void;
  onJoined: (eventId: string) => void;
}

export function JoinEventDialog({ open, onClose, onJoined }: JoinEventDialogProps) {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async () => {
    if (!code.trim()) return;
    setJoining(true);
    setError("");
    try {
      const result = await joinEvent(code.trim());
      setCode("");
      onJoined(result.eventId);
    } catch (e: any) {
      const msg = e.response?.data?.message || "Failed to join event. Check the code.";
      setError(msg);
      toast(msg, "error");
    } finally {
      setJoining(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Join Event</DialogTitle>
        <DialogDescription>Enter the 6-character code provided by the organizer.</DialogDescription>
      </DialogHeader>

      <div className="space-y-4 my-6">
        <div className="space-y-1.5">
          <Label htmlFor="code" className="text-caption-uppercase">Access Code</Label>
          <Input
            id="code"
            placeholder="A3X9K2"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            disabled={joining}
            className="font-mono text-lg tracking-[0.25em] text-center"
          />
          {error && <p className="text-xs text-[--color-error]">{error}</p>}
        </div>
      </div>

      <DialogFooter>
        <Button variant="secondary" onClick={onClose} disabled={joining}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleJoin} disabled={code.length !== 6 || joining}>
          {joining ? "Joining..." : "Join Event"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}