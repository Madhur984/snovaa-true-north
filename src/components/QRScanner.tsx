import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Camera, CameraOff, Keyboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRScannerProps {
  eventId: string;
  onScan: (participantId: string) => Promise<void>;
  isProcessing: boolean;
}

interface QRPayload {
  type: string;
  eventId: string;
  participantId: string;
  ts: number;
}

export const QRScanner = ({ eventId, onScan, isProcessing }: QRScannerProps) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [manualMode, setManualMode] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [lastScannedId, setLastScannedId] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const processQRCode = useCallback(
    async (data: string) => {
      try {
        const payload: QRPayload = JSON.parse(data);

        if (payload.type !== "snovaa-checkin") {
          toast({
            title: "Invalid QR Code",
            description: "This is not a valid SNOVAA check-in code.",
            variant: "destructive",
          });
          return;
        }

        if (payload.eventId !== eventId) {
          toast({
            title: "Wrong Event",
            description: "This QR code is for a different event.",
            variant: "destructive",
          });
          return;
        }

        // Prevent duplicate scans of the same person
        if (payload.participantId === lastScannedId) {
          return;
        }

        setLastScannedId(payload.participantId);
        await onScan(payload.participantId);

        // Reset after 3 seconds to allow re-scanning
        setTimeout(() => setLastScannedId(null), 3000);
      } catch {
        toast({
          title: "Invalid QR Code",
          description: "Could not read the QR code data.",
          variant: "destructive",
        });
      }
    },
    [eventId, lastScannedId, onScan, toast]
  );

  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Use BarcodeDetector if available (modern browsers)
    if ("BarcodeDetector" in window) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
      detector
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .detect(imageData)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((barcodes: any[]) => {
          if (barcodes.length > 0 && !isProcessing) {
            processQRCode(barcodes[0].rawValue);
          }
        })
        .catch(() => { });
    }

    animationRef.current = requestAnimationFrame(scanFrame);
  }, [cameraActive, isProcessing, processQRCode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraActive(true);
    } catch (error) {
      console.error("Camera access denied:", error);
      setHasCamera(false);
      toast({
        title: "Camera access denied",
        description: "Please enable camera access or use manual entry.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (cameraActive) {
      animationRef.current = requestAnimationFrame(scanFrame);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [cameraActive, scanFrame]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;

    // Try parsing as JSON payload or use as raw participant ID
    try {
      const payload = JSON.parse(manualInput);
      if (payload.participantId) {
        await onScan(payload.participantId);
      }
    } catch {
      // Assume it's a raw participant ID
      await onScan(manualInput.trim());
    }
    setManualInput("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          QR Check-In
        </CardTitle>
        <CardDescription>
          Scan participant QR codes for instant check-in
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!manualMode ? (
          <>
            <div className="relative aspect-square max-w-sm mx-auto rounded-lg overflow-hidden bg-muted">
              {cameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-8 border-2 border-primary rounded-lg" />
                    <div className="absolute inset-8 flex items-center justify-center">
                      <div className="w-4 h-4 border-t-2 border-l-2 border-primary absolute top-0 left-0" />
                      <div className="w-4 h-4 border-t-2 border-r-2 border-primary absolute top-0 right-0" />
                      <div className="w-4 h-4 border-b-2 border-l-2 border-primary absolute bottom-0 left-0" />
                      <div className="w-4 h-4 border-b-2 border-r-2 border-primary absolute bottom-0 right-0" />
                    </div>
                  </div>
                  {isProcessing && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                        <p className="text-sm font-medium">Processing...</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                  {hasCamera ? (
                    <>
                      <Camera className="w-12 h-12 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground text-center px-4">
                        Click below to start the camera and scan QR codes
                      </p>
                    </>
                  ) : (
                    <>
                      <CameraOff className="w-12 h-12 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground text-center px-4">
                        Camera not available. Use manual entry instead.
                      </p>
                    </>
                  )}
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="flex gap-2">
              {cameraActive ? (
                <Button variant="outline" className="flex-1" onClick={stopCamera}>
                  <CameraOff className="w-4 h-4 mr-2" />
                  Stop Camera
                </Button>
              ) : (
                hasCamera && (
                  <Button className="flex-1" onClick={startCamera}>
                    <Camera className="w-4 h-4 mr-2" />
                    Start Camera
                  </Button>
                )
              )}
              <Button
                variant="outline"
                onClick={() => {
                  stopCamera();
                  setManualMode(true);
                }}
              >
                <Keyboard className="w-4 h-4 mr-2" />
                Manual
              </Button>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Enter the participant ID or paste the QR code data
                </p>
                <Input
                  placeholder="Participant ID or QR data..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={isProcessing || !manualInput.trim()}>
                  {isProcessing ? "Processing..." : "Check In"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setManualMode(false)}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Scan
                </Button>
              </div>
            </form>
          </>
        )}

        {!("BarcodeDetector" in window) && cameraActive && (
          <p className="text-xs text-muted-foreground text-center">
            Note: Your browser doesn't support automatic QR scanning. Please use manual entry.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
