import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Play, CheckCircle, XCircle, Eye, ArrowRight } from "lucide-react";

interface EventLifecycleControlsProps {
  eventId: string;
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
}

const STATUS_FLOW: Record<string, { next: string[]; label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { next: ["published", "cancelled"], label: "Draft", variant: "secondary" },
  published: { next: ["live", "cancelled"], label: "Published", variant: "default" },
  live: { next: ["completed", "cancelled"], label: "Live", variant: "default" },
  completed: { next: [], label: "Completed", variant: "outline" },
  cancelled: { next: [], label: "Cancelled", variant: "destructive" },
};

const TRANSITION_INFO: Record<string, { icon: React.ElementType; description: string; buttonLabel: string; requiresReason?: boolean }> = {
  published: {
    icon: Eye,
    description: "Make this event visible to participants. They will be able to register.",
    buttonLabel: "Publish Event",
  },
  live: {
    icon: Play,
    description: "Start the event. Participants can check in and attendance can be recorded.",
    buttonLabel: "Go Live",
  },
  completed: {
    icon: CheckCircle,
    description: "Mark the event as completed. All participation records will be locked.",
    buttonLabel: "Complete Event",
  },
  cancelled: {
    icon: XCircle,
    description: "Cancel this event. This action cannot be undone.",
    buttonLabel: "Cancel Event",
    requiresReason: true,
  },
};

export function EventLifecycleControls({ eventId, currentStatus, onStatusChange }: EventLifecycleControlsProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [transitioning, setTransitioning] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const currentFlow = STATUS_FLOW[currentStatus];
  const availableTransitions = currentFlow?.next || [];

  const handleTransition = async (newStatus: string, reason?: string) => {
    setTransitioning(newStatus);

    const { error } = await supabase.rpc("transition_event_status", {
      p_event_id: eventId,
      p_new_status: newStatus,
      p_reason: reason || null,
    });

    if (error) {
      toast({
        title: "Transition failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Status updated",
        description: `Event is now ${newStatus}.`,
      });
      onStatusChange(newStatus);

      // Redirect to live page if event went live
      if (newStatus === "live") {
        navigate(`/events/${eventId}/live`);
      }
    }

    setTransitioning(null);
    setCancelReason("");
  };

  if (availableTransitions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Event Status</CardTitle>
          <CardDescription>This event has reached its final state</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant={currentFlow?.variant || "secondary"} className="text-sm">
            {currentFlow?.label || currentStatus}
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-lg">Event Lifecycle</CardTitle>
        <CardDescription>
          Transition your event through its lifecycle stages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status Display */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Current Status:</span>
          <Badge variant={currentFlow?.variant || "secondary"}>
            {currentFlow?.label || currentStatus}
          </Badge>
        </div>

        {/* Status Flow Visualization */}
        <div className="flex items-center gap-2 py-2 flex-wrap">
          {["draft", "published", "live", "completed"].map((status, index) => (
            <div key={status} className="flex items-center gap-2">
              <Badge
                variant={
                  status === currentStatus
                    ? "default"
                    : Object.keys(STATUS_FLOW).indexOf(currentStatus) > index
                      ? "outline"
                      : "secondary"
                }
                className={status === currentStatus ? "ring-2 ring-primary ring-offset-2" : "opacity-60"}
              >
                {STATUS_FLOW[status].label}
              </Badge>
              {index < 3 && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
            </div>
          ))}
        </div>

        {/* Transition Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          {availableTransitions.map((nextStatus) => {
            const info = TRANSITION_INFO[nextStatus];
            const Icon = info.icon;
            const isCancellation = nextStatus === "cancelled";

            if (isCancellation) {
              return (
                <AlertDialog key={nextStatus}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={transitioning !== null}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {info.buttonLabel}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Event?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {info.description}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <Label htmlFor="cancel-reason">Reason for cancellation</Label>
                      <Input
                        id="cancel-reason"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Enter reason..."
                        className="mt-2"
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setCancelReason("")}>
                        Keep Event
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleTransition(nextStatus, cancelReason)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {transitioning === nextStatus ? "Cancelling..." : "Confirm Cancel"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              );
            }

            return (
              <AlertDialog key={nextStatus}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant={nextStatus === "completed" ? "outline" : "default"}
                    disabled={transitioning !== null}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {info.buttonLabel}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{info.buttonLabel}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {info.description}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleTransition(nextStatus)}
                    >
                      {transitioning === nextStatus ? "Processing..." : "Confirm"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
