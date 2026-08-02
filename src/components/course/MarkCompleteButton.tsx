import React from 'react';
import { useMarkLessonComplete } from '@/hooks/useProgress';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, Award } from 'lucide-react';
import { toast } from 'sonner';

interface MarkCompleteButtonProps {
  lessonId: string;
  courseId: string;
  completed: boolean;
  completedAt?: Date | string;
  /** Called after a successful lesson completion server response */
  onComplete?: () => void;
}

export const MarkCompleteButton: React.FC<MarkCompleteButtonProps> = ({
  lessonId,
  courseId,
  completed,
  completedAt,
  onComplete,
}) => {
  const { mutate: complete, isPending } = useMarkLessonComplete();
  
  const handleMarkComplete = () => {
    if (!completed && !isPending) {
      complete({ lessonId, courseId }, {
        onSuccess: () => onComplete?.(),
        onError: (error) => {
          toast.error(error.message || 'Failed to mark lesson complete');
        },
      });
    }
  };

  const formattedDate = completedAt
    ? new Date(completedAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center p-6 border border-emerald-200/80 bg-emerald-50/15 rounded-xl text-center space-y-2 select-none shadow-sm max-w-md mx-auto my-6">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <Award className="w-5 h-5 text-emerald-500" />
        </div>
        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 justify-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Lesson Completed! Great job! 🎉
        </h4>
        {formattedDate && (
          <p className="text-[10px] text-slate-500">
            Completed on: <span className="font-semibold text-slate-600">{formattedDate}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex justify-center my-6">
      <Button
        onClick={handleMarkComplete}
        disabled={isPending}
        className="w-full max-w-xs font-bold py-5 px-6 rounded-xl hover:shadow-md transition-all text-sm flex items-center justify-center gap-2"
        size="lg"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving Progress...
          </>
        ) : (
          'Mark Lesson Complete'
        )}
      </Button>
    </div>
  );
};
