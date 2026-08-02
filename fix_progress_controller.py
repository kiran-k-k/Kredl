with open('backend/src/modules/progress/progress.controller.ts', 'r') as f:
    content = f.read()

if 'CourseIdDto' not in content:
    content = content.replace("import { Types } from 'mongoose';", "import { Types } from 'mongoose';\nimport { CourseIdDto } from './dto/course-id.dto';")

content = content.replace("@Body('courseId') courseId: string,", "@Body() { courseId }: CourseIdDto,")

with open('backend/src/modules/progress/progress.controller.ts', 'w') as f:
    f.write(content)
