import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image, Video, X, Loader2, Check, Clock } from "lucide-react";

interface MediaItem {
  id: string;
  storage_path: string;
  media_type: string;
  status: "pending" | "approved" | "rejected";
  uploaded_at: string;
  uploaded_by: string;
  uploader?: { display_name: string };
}

interface EventMediaUploadProps {
  eventId: string;
  isOrganizer: boolean;
  onMediaChange?: () => void;
}

export const EventMediaUpload = ({ eventId, isOrganizer, onMediaChange }: EventMediaUploadProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMedia();
  }, [eventId]);

  const fetchMedia = async () => {
    const { data, error } = await supabase
      .from("event_media")
      .select("*, uploader:profiles!event_media_uploaded_by_fkey(display_name)")
      .eq("event_id", eventId)
      .order("uploaded_at", { ascending: false });

    if (!error && data) {
      setMedia(data as unknown as MediaItem[]);
    }
    setLoading(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !profile) return;

    setUploading(true);

    for (const file of Array.from(files)) {
      // Validate file type
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      
      if (!isImage && !isVideo) {
        toast({
          title: "Invalid file type",
          description: "Only images and videos are allowed.",
          variant: "destructive",
        });
        continue;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB.",
          variant: "destructive",
        });
        continue;
      }

      try {
        // Upload to storage
        const fileExt = file.name.split(".").pop();
        const fileName = `${profile.user_id}/${eventId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("event-media")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Create database record
        const { error: dbError } = await supabase.from("event_media").insert({
          event_id: eventId,
          storage_path: fileName,
          media_type: isImage ? "image" : "video",
          uploaded_by: profile.id,
          status: isOrganizer ? "approved" : "pending", // Auto-approve for organizers
        });

        if (dbError) throw dbError;

        toast({
          title: "Upload successful",
          description: isOrganizer ? "Media added to event." : "Media submitted for approval.",
        });

        fetchMedia();
        onMediaChange?.();
      } catch (error: any) {
        toast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive",
        });
      }
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleApprove = async (mediaId: string) => {
    if (!profile) return;
    setProcessingId(mediaId);

    const { error } = await supabase
      .from("event_media")
      .update({
        status: "approved",
        approved_by: profile.id,
        approved_at: new Date().toISOString(),
      })
      .eq("id", mediaId);

    if (error) {
      toast({ title: "Failed to approve", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Media approved" });
      fetchMedia();
      onMediaChange?.();
    }
    setProcessingId(null);
  };

  const handleReject = async (mediaId: string, storagePath: string) => {
    setProcessingId(mediaId);

    // Delete from storage
    await supabase.storage.from("event-media").remove([storagePath]);

    // Update status or delete record
    const { error } = await supabase
      .from("event_media")
      .update({ status: "rejected" })
      .eq("id", mediaId);

    if (error) {
      toast({ title: "Failed to reject", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Media rejected" });
      fetchMedia();
      onMediaChange?.();
    }
    setProcessingId(null);
  };

  const getMediaUrl = (path: string) => {
    const { data } = supabase.storage.from("event-media").getPublicUrl(path);
    return data.publicUrl;
  };

  const pendingMedia = media.filter((m) => m.status === "pending");
  const approvedMedia = media.filter((m) => m.status === "approved");

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Media
          </CardTitle>
          <CardDescription>
            Add photos or videos as proof of event participation. No social features - this is
            strictly for documentation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            variant="outline"
            className="w-full h-32 border-dashed"
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Click to upload images or videos (max 10MB)
                </span>
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Pending Approval (Organizers Only) */}
      {isOrganizer && pendingMedia.length > 0 && (
        <Card className="border-amber-500/50">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Pending Approval
              <Badge variant="secondary">{pendingMedia.length}</Badge>
            </CardTitle>
            <CardDescription>Review and approve participant uploads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {pendingMedia.map((item) => (
                <div key={item.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    {item.media_type === "image" ? (
                      <img
                        src={getMediaUrl(item.storage_path)}
                        alt="Pending media"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleApprove(item.id)}
                      disabled={processingId === item.id}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(item.id, item.storage_path)}
                      disabled={processingId === item.id}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {item.uploader?.display_name || "Unknown"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approved Media Gallery */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <Image className="w-5 h-5" />
            Event Gallery
            <Badge variant="outline">{approvedMedia.length}</Badge>
          </CardTitle>
          <CardDescription>Approved media documenting this event</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : approvedMedia.length === 0 ? (
            <div className="text-center py-8">
              <Image className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No media yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {approvedMedia.map((item) => (
                <div key={item.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    {item.media_type === "image" ? (
                      <img
                        src={getMediaUrl(item.storage_path)}
                        alt="Event media"
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <video
                        src={getMediaUrl(item.storage_path)}
                        className="w-full h-full object-cover"
                        controls
                      />
                    )}
                  </div>
                  {isOrganizer && (
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6"
                      onClick={() => handleReject(item.id, item.storage_path)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
