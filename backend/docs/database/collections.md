# Database Collections

The Kredl backend uses MongoDB. The main collections in use are:

- **users**: Stores all user accounts (Student, Admin, TPO), auth logic (local & google), user status, tokens, and lockouts.
- **roles**: Stores RBAC role definitions (e.g., ADMIN, STUDENT, TPO) and permissions matrix.
- **colleges**: Stores data regarding institutions for student affiliation.
- **lessons**: Stores academic/course lesson modules.
- **course_modules**: Logical grouping of lessons.
- **progress**: Tracks overarching student progression metrics across enrolled courses.
- **module_completions**: Granular tracking of individual module milestones.
- **notifications**: Stores in-app alerts and notifications delivered to users.
- **bookmarks**: Records user-saved courses and lessons.
- **quiz_attempts**: Records user interactions, scores, and completion statuses for quizzes.

*Note: As per modular monolithic architecture, modules manage their own schemas which get compiled into collections by Mongoose.*
