import React from 'react';
import { BookOpen } from 'lucide-react';

export const ModuleEmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 max-w-lg mx-auto mt-8">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <BookOpen className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="text-base font-bold text-foreground mb-1.5">No modules available</h3>
      <p className="text-sm text-muted-foreground">
        This course doesn't have any learning modules set up yet. Please check back later or contact the administrator.
      </p>
    </div>
  );
};
