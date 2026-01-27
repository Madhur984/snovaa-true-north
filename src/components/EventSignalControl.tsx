import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RadioTower, Send, AlertTriangle, Bell, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface EventSignalControlProps {
    eventId: string;
    currentStatus: string;
}

export const EventSignalControl = ({ eventId, currentStatus }: EventSignalControlProps) => {
    const { toast } = useToast();
    const { profile } = useAuth();
    const [message, setMessage] = useState("");
    const [type, setType] = useState<"announcement" | "emergency" | "info">("announcement");
    const [sending, setSending] = useState(false);

    const handleSendSignal = async () => {
        if (!message.trim() || !profile) return;
        setSending(true);

        try {
            // Piggyback on event_lifecycle_log since event_signals table is missing
            // We use a prefix "SIGNAL:" to distinguish these from actual status changes
            const { error } = await supabase.from("event_lifecycle_log").insert({
                event_id: eventId,
                changed_by: profile.id,
                new_status: `SIGNAL:${type.toUpperCase()}`,
                previous_status: currentStatus,
                reason: message.trim(),
                changed_at: new Date().toISOString()
            });

            if (error) throw error;

            toast({
                title: "Signal Broadcast",
                description: `Sent ${type}: "${message}"`,
            });
            setMessage("");
        } catch (err: any) {
            toast({
                title: "Broadcast Failed",
                description: err.message,
                variant: "destructive"
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <Card className="border-l-4 border-l-primary">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                    <RadioTower className="w-5 h-5 text-primary" />
                    Live Signals
                </CardTitle>
                <CardDescription>
                    Broadcast real-time messages to all checked-in staff and participants.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-4">
                    <div className="w-1/3 space-y-2">
                        <label className="text-sm font-medium">Signal Type</label>
                        <Select value={type} onValueChange={(v: "announcement" | "emergency" | "info") => setType(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="announcement">
                                    <div className="flex items-center gap-2">
                                        <Bell className="w-4 h-4 text-orange-500" /> Announcement
                                    </div>
                                </SelectItem>
                                <SelectItem value="info">
                                    <div className="flex items-center gap-2">
                                        <Info className="w-4 h-4 text-blue-500" /> General Info
                                    </div>
                                </SelectItem>
                                <SelectItem value="emergency">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-red-600" /> Emergency
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="pt-2">
                            {type === "emergency" && (
                                <Badge variant="destructive" className="w-full justify-center animate-pulse">
                                    OVERRIDES SILENT MODE
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium">Message Payload</label>
                        <Textarea
                            placeholder={type === "emergency" ? "EVACUATE TO NORTH EXIT..." : "Free drinks at the bar..."}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button
                        variant={type === "emergency" ? "destructive" : "default"}
                        disabled={sending || !message.trim()}
                        onClick={handleSendSignal}
                    >
                        <Send className="w-4 h-4 mr-2" />
                        {sending ? "Broadcasting..." : "Broadcast Signal"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
