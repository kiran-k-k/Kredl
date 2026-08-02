import { INestApplicationContext } from '@nestjs/common';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { CourseModule, CourseModuleDocument } from '../src/modules/modules/schemas/module.schema';
import { Quiz } from '../src/modules/quiz/schemas/quiz.schema';
import { runSeeder } from './utils';

const generateQuestions = (moduleTitle: string) => {
  const questions = [];
  for (let i = 1; i <= 10; i++) {
    questions.push({
      questionText: `Which of the following statements is true regarding ${moduleTitle} (Concept ${i})?`,
      options: [
        `A generic incorrect statement about ${moduleTitle}.`,
        `The precise, technically correct definition of the concept.`,
        `A common misconception that beginners have.`,
        `An outdated approach that is no longer recommended.`
      ],
      correctAnswerIndex: 1,
      explanation: `Option 2 is correct because the technical specification of ${moduleTitle} defines it exactly this way. Option 1 is a generalization, 3 is a common pitfall, and 4 refers to legacy code.`,
      order: i
    });
  }
  return questions;
};

export async function seedQuizzes(app: INestApplicationContext) {
  await runSeeder('Quizzes', async () => {
    const moduleModel = app.get<Model<any>>(getModelToken(CourseModule.name));
    const quizModel = app.get<Model<any>>(getModelToken(Quiz.name));

    const modules = await moduleModel.find();
    
    if (modules.length === 0) {
      throw new Error('Modules not found. Run modules seed first.');
    }

    for (const mod of modules) {
      const existing = await quizModel.findOne({ moduleId: mod._id });
      if (!existing) {
        await quizModel.create({
          moduleId: mod._id,
          title: `${mod.title} Assessment Quiz`,
          description: `Test your knowledge on ${mod.title}. You must score at least 70% to pass.`,
          questions: generateQuestions(mod.title),
          timeLimitMinutes: 15,
          passingScorePercentage: 70,
          totalMarks: 10,
          isPublished: true,
        });
      }
    }
  });
}
