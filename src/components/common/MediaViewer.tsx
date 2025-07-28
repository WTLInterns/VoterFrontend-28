import React, { useState } from 'react';
import { Modal, Button } from '../ui';
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface MediaItem {
  id: string;
  fileName?: string;
  filename?: string; // Support both naming conventions
  fileUrl?: string;
  url?: string; // Support both naming conventions
  fileType?: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  type?: 'IMAGE' | 'VIDEO' | 'DOCUMENT'; // Support both naming conventions
  mimeType?: string;
  fileSize?: number;
  uploadedAt?: string;
  uploadedBy?: string;
}

interface MediaViewerProps {
  media: MediaItem[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ 
  media, 
  isOpen, 
  onClose, 
  initialIndex = 0 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [, setIsVideoPlaying] = useState(false);

  const currentMedia = media[currentIndex];

  const nextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
    resetView();
  };

  const prevMedia = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
    resetView();
  };

  const resetView = () => {
    setZoom(100);
    setRotation(0);
    setIsVideoPlaying(false);
  };

  const zoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
  const zoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
  const rotate = () => setRotation(prev => (prev + 90) % 360);

  const downloadMedia = async () => {
    if (!currentMedia) return;

    try {
      const fileUrl = currentMedia.fileUrl || currentMedia.url;
      const fileName = currentMedia.fileName || currentMedia.filename || 'download';

      if (!fileUrl) return;

      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading media:', error);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleString();
  };

  if (!currentMedia) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="xl"
    >
      <div className="relative h-[80vh] bg-black rounded-lg overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex-1">
              <h3 className="text-lg font-semibold truncate">{currentMedia.fileName || currentMedia.filename || 'Media File'}</h3>
              <p className="text-sm text-gray-300">
                {currentIndex + 1} of {media.length} • {formatFileSize(currentMedia.fileSize)} • {formatDate(currentMedia.uploadedAt)}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {/* Navigation */}
              {media.length > 1 && (
                <>
                  <Button variant="outline" size="sm" onClick={prevMedia}>
                    ←
                  </Button>
                  <Button variant="outline" size="sm" onClick={nextMedia}>
                    →
                  </Button>
                </>
              )}
              
              {/* Controls */}
              {(currentMedia.fileType === 'IMAGE' || currentMedia.type === 'IMAGE') && (
                <>
                  <Button variant="outline" size="sm" onClick={zoomOut} title="Zoom Out">
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm">{zoom}%</span>
                  <Button variant="outline" size="sm" onClick={zoomIn} title="Zoom In">
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={rotate} title="Rotate">
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </>
              )}
              
              <Button variant="outline" size="sm" onClick={downloadMedia} title="Download">
                <Download className="w-4 h-4" />
              </Button>
              
              <Button variant="outline" size="sm" onClick={onClose} title="Close">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Media Content */}
        <div className="h-full flex items-center justify-center p-16">
          {(currentMedia.fileType === 'IMAGE' || currentMedia.type === 'IMAGE') ? (
            <img
              src={currentMedia.fileUrl || currentMedia.url}
              alt={currentMedia.fileName || currentMedia.filename || 'Image'}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              }}
            />
          ) : (currentMedia.fileType === 'VIDEO' || currentMedia.type === 'VIDEO') ? (
            <div className="relative">
              <video
                src={currentMedia.fileUrl || currentMedia.url}
                controls
                className="max-w-full max-h-full"
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            <div className="text-center text-white">
              <div className="bg-gray-800 p-8 rounded-lg">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold mb-2">{currentMedia.fileName || currentMedia.filename || 'Document'}</h3>
                <p className="text-gray-300 mb-4">
                  Document files cannot be previewed in the browser
                </p>
                <Button onClick={downloadMedia} className="bg-blue-600 hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download to View
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Keyboard shortcuts info */}
        <div className="absolute bottom-4 left-4 text-white text-xs bg-black bg-opacity-50 p-2 rounded">
          <div>← → Navigate • ESC Close • ↑ ↓ Zoom</div>
        </div>
      </div>
    </Modal>
  );
};

export default MediaViewer;
