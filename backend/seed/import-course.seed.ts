import { INestApplicationContext } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import * as fs from 'fs';
import * as path from 'path';

import { Course } from '../src/modules/courses/schemas/course.schema';
import { CourseModule } from '../src/modules/modules/schemas/module.schema';
import { Lesson } from '../src/modules/lessons/schemas/lesson.schema';
import { LessonNote } from '../src/modules/lesson-notes/schemas/lesson-note.schema';
import { Quiz } from '../src/modules/quiz/schemas/quiz.schema';
import { Project } from '../src/modules/projects/schemas/project.schema';
import { User } from '../src/modules/users/schemas/user.schema';
import { runSeeder } from './utils';

export async function seedImportedCourse(app: INestApplicationContext) {
  await runSeeder('Import Course Data', async () => {
    const courseModel = app.get<Model<any>>(getModelToken(Course.name));
    const moduleModel = app.get<Model<any>>(getModelToken(CourseModule.name));
    const lessonModel = app.get<Model<any>>(getModelToken(Lesson.name));
    const noteModel = app.get<Model<any>>(getModelToken(LessonNote.name));
    const quizModel = app.get<Model<any>>(getModelToken(Quiz.name));
    const projectModel = app.get<Model<any>>(getModelToken(Project.name));
    const userModel = app.get<Model<any>>(getModelToken(User.name));

    const admin = await userModel.findOne({ email: 'admin@kredl.dev' });
    if (!admin) throw new Error('Admin user not found. Run users seed first.');

    const dataDir = path.join(__dirname, 'data', 'java-full-stack');
    
    // 1. Course
    const courseData = JSON.parse(fs.readFileSync(path.join(dataDir, 'course.json'), 'utf8'));
    let course = await courseModel.findOne({ slug: courseData.slug });
    if (!course) {
      course = await courseModel.create({ ...courseData, createdBy: admin._id });
    } else {
      await courseModel.updateOne({ _id: course._id }, { $set: courseData });
    }

    // Wipe old content to ensure clean idempotency without unique key collisions
    await moduleModel.deleteMany({ courseId: course._id });
    await lessonModel.deleteMany({ courseId: course._id });
    await quizModel.deleteMany({ courseId: course._id });
    await projectModel.deleteMany({ courseId: course._id });

    // 2. Modules
    const modulesDir = path.join(dataDir, 'modules');
    console.log('Modules Dir:', modulesDir);
    if (!fs.existsSync(modulesDir)) return;
    
    for (const file of fs.readdirSync(modulesDir)) {
      if (!file.endsWith('.json')) continue;
      const modData = JSON.parse(fs.readFileSync(path.join(modulesDir, file), 'utf8'));
      
      let mod = await moduleModel.findOne({ courseId: course._id, slug: modData.slug });
      if (!mod) {
        mod = await moduleModel.create({ ...modData, courseId: course._id, createdBy: admin._id });
      } else {
        await moduleModel.updateOne({ _id: mod._id }, { $set: modData });
      }

      // 3. Lessons
      const lessonsFile = path.join(dataDir, 'lessons', `${modData.slug.split('-')[0]}-lessons.json`);
      console.log('Lessons File:', lessonsFile, fs.existsSync(lessonsFile));
      let savedLessons = [];
      if (fs.existsSync(lessonsFile)) {
        const lessons = JSON.parse(fs.readFileSync(lessonsFile, 'utf8'));
        console.log('Found', lessons.length, 'lessons in file');
        for (const lessonData of lessons) {
          if (lessonData.moduleSlug !== modData.slug) continue;
          
          let lesson = await lessonModel.findOne({ moduleId: mod._id, slug: lessonData.slug });
          if (!lesson) {
            lesson = await lessonModel.create({ ...lessonData, courseId: course._id, moduleId: mod._id, createdBy: admin._id });
          } else {
            await lessonModel.updateOne({ _id: lesson._id }, { $set: lessonData });
          }
          savedLessons.push(lesson);

          // 4. Notes & Interview Qs mapping
          const notesFile = path.join(dataDir, 'notes', `${modData.slug.split('-')[0]}-notes.json`);
          if (fs.existsSync(notesFile)) {
            const notes = JSON.parse(fs.readFileSync(notesFile, 'utf8'));
            const noteData = notes.find((n: any) => n.lessonSlug === lessonData.slug);
            if (noteData) {
               // Load interview questions if available for this module
               let iqText = "";
               const iqFile = path.join(dataDir, 'interview-questions', `${modData.slug.split('-')[0]}-interview-questions.json`);
               if (fs.existsSync(iqFile)) {
                 const iqs = JSON.parse(fs.readFileSync(iqFile, 'utf8'));
                 // Just append questions randomly for demonstration or link them cleanly
                 const moduleIQs = iqs.filter((q: any) => q.moduleSlug === modData.slug);
                 if (moduleIQs.length > 0) {
                   iqText = "\n\n## Interview Questions\n" + moduleIQs.map((q: any) => `**Q: ${q.question}**\n*A: ${q.answer}*`).join("\n\n");
                 }
               }

               const content = noteData.detailedNotes + "\n\n## Key Points\n" + noteData.keyPoints.map((k: string) => `- ${k}`).join("\n") + iqText;

               let note = await noteModel.findOne({ lessonId: lesson._id });
               if (!note) {
                 await noteModel.create({
                   lessonId: lesson._id,
                   title: `Notes: ${lesson.title}`,
                   summary: noteData.summary,
                   content: content,
                   order: 1,
                   createdBy: admin._id
                 });
               } else {
                 await noteModel.updateOne({ _id: note._id }, { $set: { summary: noteData.summary, content: content } });
               }
            }
          }
        }
      }

      // 5. Quiz
      const quizFile = path.join(dataDir, 'quizzes', `${modData.slug.split('-')[0]}-quiz.json`);
      console.log('Quiz File:', quizFile, fs.existsSync(quizFile));
      if (fs.existsSync(quizFile)) {
        const quizData = JSON.parse(fs.readFileSync(quizFile, 'utf8'));
        if (quizData.moduleSlug === modData.slug) {
          let quiz = await quizModel.findOne({ moduleId: mod._id });
          if (!quiz) {
            await quizModel.create({ ...quizData, courseId: course._id, moduleId: mod._id, createdBy: admin._id, status: 'published' });
          } else {
            await quizModel.updateOne({ _id: quiz._id }, { $set: quizData });
          }
        }
      }

      // 6. Projects
      const projectsFile = path.join(dataDir, 'projects', `${modData.slug.split('-')[0]}-projects.json`);
      if (fs.existsSync(projectsFile)) {
        const projects = JSON.parse(fs.readFileSync(projectsFile, 'utf8'));
        for (const proj of projects) {
          if (proj.moduleSlug !== modData.slug) continue;
          let project = await projectModel.findOne({ moduleId: mod._id, title: proj.title });
          if (!project) {
            await projectModel.create({
              ...proj,
              courseId: course._id,
              moduleId: mod._id,
              status: 'published',
              createdBy: admin._id,
              repositoryUrl: proj.githubUrl
            });
          } else {
            await projectModel.updateOne({ _id: project._id }, { $set: { ...proj, repositoryUrl: proj.githubUrl } });
          }
        }
      }
    }
  });
}
