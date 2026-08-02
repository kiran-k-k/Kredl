import React from 'react';
import { Card } from '@/components/ui/card';
import { Play, VideoOff } from 'lucide-react';

interface YoutubePlayerProps {
  youtubeUrl?: string;
  githubUrl?: string;
  title: string;
}

export const YoutubePlayer: React.FC<YoutubePlayerProps> = ({
  youtubeUrl,
  githubUrl,
  title,
}) => {
  const getYoutubeVideoId = (url?: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYoutubeVideoId(youtubeUrl);

  if (!videoId) {
    if (githubUrl) {
      return (
        <Card className="flex flex-col items-center justify-center text-center p-12 bg-primary/5 border border-primary/20 rounded-xl aspect-video shadow-sm">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-primary">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
          </div>
          <h4 className="text-xl font-bold text-foreground mb-3">Project Assignment</h4>
          <p className="text-sm text-muted-foreground max-w-md mb-8">
            This lesson is a practical project. Clone the repository and follow the instructions in the README to complete the assignment.
          </p>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 py-2 gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            Open Project Repository
          </a>
        </Card>
      );
    }
    return (
      <Card className="flex flex-col items-center justify-center text-center p-12 bg-slate-50 border border-slate-200 rounded-xl aspect-video">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <VideoOff className="w-6 h-6 text-slate-400" />
        </div>
        <h4 className="text-sm font-bold text-slate-800 mb-1">Video Unavailable</h4>
        <p className="text-xs text-slate-500 max-w-xs">
          No YouTube video embed link has been configured or provided for this lesson yet.
        </p>
      </Card>
    );
  }

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`;

  return (
    <Card className="overflow-hidden border border-slate-200/80 rounded-xl aspect-video bg-black shadow-md relative group">
      <iframe
        src={embedUrl}
        title={title}
        className="w-full h-full border-0 absolute top-0 left-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    </Card>
  );
};
