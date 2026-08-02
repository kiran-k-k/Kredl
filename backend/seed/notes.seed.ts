import { INestApplicationContext } from '@nestjs/common';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Lesson } from '../src/modules/lessons/schemas/lesson.schema';
import { LessonNote } from '../src/modules/lesson-notes/schemas/lesson-note.schema';
import { runSeeder } from './utils';

const generateNoteContent = (lessonTitle: string) => `
# ${lessonTitle} Notes

## Summary
This lesson covers the foundational concepts necessary to master this topic in Java Full Stack Development. We explore real-world use cases, internal working mechanisms, and practical implementation details.

## Key Concepts
- Understanding the Core Architecture
- Memory Management and Performance
- Handling Edge Cases gracefully
- Best Practices for Enterprise Systems

## Explanation
In modern software engineering, dealing with \`${lessonTitle.split(' - ')[0]}\` requires a solid understanding of how Java interacts with the underlying JVM and operating system. 

When you define a standard configuration, you must always account for scalability.

## Code Examples

\`\`\`java
public class Example {
    public static void main(String[] args) {
        System.out.println("Applying concepts from: ${lessonTitle}");
        // Example implementation
        try {
            processData();
        } catch (Exception e) {
            System.err.println("Error processing data: " + e.getMessage());
        }
    }
    
    private static void processData() {
        // Business logic here
    }
}
\`\`\`

## Best Practices
1. **Always use interface references** instead of concrete classes when dealing with collections.
2. **Handle exceptions at the correct layer**; do not swallow exceptions without logging.
3. **Write Unit Tests** for all critical business logic.

## Common Mistakes
- Not closing resources (always use try-with-resources).
- Hardcoding configuration values instead of using \`application.properties\`.
- Ignoring null checks, leading to \`NullPointerException\`.

## Interview Questions
- **Q**: How does this concept apply in a multithreaded environment?
- **Q**: What are the time complexities of the operations demonstrated?
- **Q**: Explain the difference between this approach and the legacy approach.

## Revision Notes
- Review the code snippet above before your interview.
- Ensure you understand the memory implications.
- Practice writing the core logic on a whiteboard.
`;

export async function seedNotes(app: INestApplicationContext) {
  await runSeeder('Notes', async () => {
    const lessonModel = app.get<Model<any>>(getModelToken(Lesson.name));
    const noteModel = app.get<Model<any>>(getModelToken(LessonNote.name));

    const lessons = await lessonModel.find();
    
    if (lessons.length === 0) {
      throw new Error('Lessons not found. Run lessons seed first.');
    }

    for (const lesson of lessons) {
      const existing = await noteModel.findOne({ lessonId: lesson._id });
      if (!existing) {
        await noteModel.create({
          lessonId: lesson._id,
          title: `${lesson.title} Notes`,
          summary: `Comprehensive summary and revision notes for ${lesson.title}`,
          content: generateNoteContent(lesson.title),
          isPublished: true,
        });
      }
    }
  });
}
