"use client";

import { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createEvent } from "@/api/events";
import { useToast } from "@/components/ui/toast";

interface CreateEventDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (eventId: string) => void;
}

export function CreateEventDialog({ open, onClose, onCreated }: CreateEventDialogProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setCreating(true);
    try {
      const event = await createEvent(title.trim(), description.trim() || undefined);
      setTitle("");
      setDescription("");
      onCreated(event.id);
    } catch {
      toast("Failed to create event. Please try again.", "error");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>New Event</DialogTitle>
        <DialogDescription>Create a photo collection to share with attendees.</DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 my-6">
        <div className="space-y-1.5">
          <Label htmlFor="title" className="text-caption-uppercase">Title</Label>
          <Input
            id="title"
            placeholder="e.g. Wedding, Concert, Conference"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={creating}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-caption-uppercase">Description (optional)</Label>
          <Input
            id="description"
            placeholder="A brief note about this event"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={creating}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="secondary" onClick={onClose} disabled={creating}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleCreate} disabled={!title.trim() || creating}>
          {creating ? "Creating..." : "Create Event"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}