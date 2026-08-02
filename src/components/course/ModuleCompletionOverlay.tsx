import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Award, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';

interface ModuleCompletionOverlayProps {
  moduleTitle: string;
  courseSlug: string;
  moduleSlug: string;
  onClose: () => void;
}

export const ModuleCompletionOverlay: React.FC<ModuleCompletionOverlayProps> = ({
  moduleTitle,
  courseSlug,
  moduleSlug,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <Card className="max-w-md w-full p-8 text-center border border-slate-200/80 shadow-2xl rounded-2xl space-y-6 bg-white animate-in scale-in duration-300">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-500 animate-bounce">
          <Award className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
            Module Finished!
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
            🎉 {moduleTitle} Completed
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            You have successfully completed all the lessons in this module. Excellent progress!
          </p>
        </div>

        {/* Quiz trigger */}
        <div className="p-4 bg-slate-50/65 rounded-xl border border-slate-100 text-center space-y-3">
          <p className="text-xs font-bold text-slate-700">Ready for Quiz?</p>
          <Button disabled className="w-full font-bold py-4 rounded-lg text-xs" variant="secondary">
            Take Module Quiz (Coming Soon)
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button onClick={onClose} className="flex-1 font-bold py-5 rounded-lg text-xs bg-slate-900 hover:bg-slate-800 text-white">
            Continue Learning
          </Button>
          <Link href={`/courses/${courseSlug}`} className="flex-1 no-underline">
            <Button variant="outline" className="w-full font-semibold py-5 rounded-lg text-xs flex items-center justify-center gap-1">
              <Home className="w-3.5 h-3.5" />
              Syllabus Grid
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
