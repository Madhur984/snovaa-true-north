import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, QrCode } from "lucide-react";

interface ParticipantQRCodeProps {
  eventId: string;
  participantId: string;
  eventTitle: string;
  participantName: string;
}

export const ParticipantQRCode = ({
  eventId,
  participantId,
  eventTitle,
  participantName,
}: ParticipantQRCodeProps) => {
  // Create a unique check-in payload
  const qrPayload = JSON.stringify({
    type: "snovaa-checkin",
    eventId,
    participantId,
    ts: Date.now(),
  });

  const handleDownload = () => {
    const svg = document.getElementById("participant-qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${eventTitle.replace(/\s+/g, "-")}-qr-code.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <QrCode className="w-5 h-5 text-primary" />
        </div>
        <CardTitle className="font-serif text-lg">Your Check-In QR Code</CardTitle>
        <CardDescription>
          Show this QR code to the organizer for instant check-in
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center p-4 bg-white rounded-lg">
          <QRCodeSVG
            id="participant-qr-code"
            value={qrPayload}
            size={180}
            level="M"
            includeMargin
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-display">{participantName}</p>
          <p className="text-xs text-muted-foreground">{eventTitle}</p>
        </div>

        <Button variant="outline" className="w-full" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download QR Code
        </Button>
      </CardContent>
    </Card>
  );
};
