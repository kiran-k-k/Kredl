import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { CheckCircle2, ChevronRight, Info } from 'lucide-react';

interface LessonTabsProps {
  notes?: string;
  learningObjectives?: string[];
  keyPoints?: string[];
}

export const LessonTabs: React.FC<LessonTabsProps> = ({
  notes,
  learningObjectives = [],
  keyPoints = [],
}) => {
  return (
    <Tabs defaultValue="notes" className="w-full">
      {/* Navigation Tabs List */}
      <TabsList className="grid grid-cols-3 w-full max-w-md bg-slate-100/80 p-1 border border-slate-200/50 rounded-lg">
        <TabsTrigger value="notes" className="text-xs font-semibold py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">
          📘 Notes
        </TabsTrigger>
        <TabsTrigger value="objectives" className="text-xs font-semibold py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">
          🎯 Objectives
        </TabsTrigger>
        <TabsTrigger value="keypoints" className="text-xs font-semibold py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">
          💡 Key Points
        </TabsTrigger>
      </TabsList>

      {/* 📘 Section 4: Notes Content */}
      <TabsContent value="notes" className="mt-6 focus:outline-none">
        <Card className="p-6 border border-slate-200/85 bg-white shadow-sm rounded-xl">
          {notes ? (
            <article 
              className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:text-sm prose-p:leading-relaxed prose-li:text-sm prose-code:bg-slate-100/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-blockquote:border-l-4 prose-blockquote:border-slate-300 prose-blockquote:pl-4 prose-blockquote:text-slate-600 prose-table:text-sm"
              dangerouslySetInnerHTML={{ __html: notes }}
            />
          ) : (
            <div className="flex items-center gap-2.5 text-sm text-slate-500 py-6">
              <Info className="w-4 h-4 text-slate-400 shrink-0" />
              <span>No notes have been added to this lesson yet.</span>
            </div>
          )}
        </Card>
      </TabsContent>

      {/* 🎯 Section 3: Learning Objectives */}
      <TabsContent value="objectives" className="mt-6 focus:outline-none">
        <Card className="p-6 border border-slate-200/85 bg-white shadow-sm rounded-xl space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">Learning Targets</h3>
            <p className="text-xs text-slate-500">After completing this lesson, you should be able to:</p>
          </div>

          {learningObjectives.length > 0 ? (
            <ul className="space-y-2.5">
              {learningObjectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                  <div className="mt-0.5 w-4 h-4 rounded bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-blue-600">{i + 1}</span>
                  </div>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-2.5 text-sm text-slate-500 py-4">
              <Info className="w-4 h-4 text-slate-400 shrink-0" />
              <span>No learning objectives configured for this lesson.</span>
            </div>
          )}
        </Card>
      </TabsContent>

      {/* 💡 Section 5: Key Points */}
      <TabsContent value="keypoints" className="mt-6 focus:outline-none">
        <Card className="p-6 border border-slate-200/85 bg-gradient-to-br from-white to-slate-50/50 shadow-sm rounded-xl space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">Key Takeaways</h3>
            <p className="text-xs text-slate-500">Crucial cheat-sheet points from this session:</p>
          </div>

          {keyPoints.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {keyPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-100 bg-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-xs font-semibold text-slate-700 leading-snug">{point}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2.5 text-sm text-slate-500 py-4">
              <Info className="w-4 h-4 text-slate-400 shrink-0" />
              <span>No key points highlight list for this lesson.</span>
            </div>
          )}
        </Card>
      </TabsContent>
    </Tabs>
  );
};
