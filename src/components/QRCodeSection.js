import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';

const QRCodeSection = ({ feedbackUrl }) => {
  const qrCodeRef = useRef(null);

  const downloadQRCode = () => {
    const qrCodeElement = qrCodeRef.current;
    if (!qrCodeElement) return;

    const canvas = document.createElement('canvas');
    canvas.width = qrCodeElement.clientWidth;
    canvas.height = qrCodeElement.clientHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const svg = qrCodeElement.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;

    img.onload = () => {
      ctx.drawImage(img, 0, 0);

      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'feedback-qr-code.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Feedback QR Code</h2>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* QR Code Container */}
          <div className="flex-shrink-0 p-4 bg-gray-50 rounded-lg" ref={qrCodeRef}>
            <QRCodeSVG value={feedbackUrl} size={200} />
          </div>

          {/* Text and Link Container */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Share Feedback Link</h3>
            <p className="text-gray-600 mb-4">
              Scan this QR code or share the link below to collect customer feedback.
            </p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <a
                href={feedbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 break-all"
              >
                {feedbackUrl}
              </a>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={downloadQRCode}
          className="mt-6 w-full md:w-auto flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          <Download className="w-5 h-5" />
          <span>Download QR Code</span>
        </button>
      </div>
    </div>
  );
};

export default QRCodeSection;