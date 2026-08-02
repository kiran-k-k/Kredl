# Dashboard API Documentation

The Dashboard Aggregation API serves as the primary endpoint for the student homepage. It aggregates data across multiple Kredl modules to deliver a unified response.

## Endpoints

### 1. Get Student Dashboard
Retrieves a consolidated dashboard view including user profile snippet, current learning course, recommended courses, overall progress, recent activity timeline, and active notifications.

- **URL:** `/dashboard`
- **Method:** `GET`
- **Authentication:** Required (JWT Bearer Token)
- **Role:** `STUDENT`

#### Request Headers
| Key           | Value                | Required |
|---------------|----------------------|----------|
| Authorization | Bearer `<jwt_token>` | Yes      |

#### Response (Success - 200 OK)
```json
{
  "success": true,
  "message": "Dashboard fetched successfully",
  "data": {
    "profile": {
      "id": "60d0fe4f5311236168a109ca",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "role": "STUDENT",
      "college": "Example University",
      "department": "Computer Science",
      "joinedAt": "2023-01-01T00:00:00.000Z"
    },
    "continueLearning": {
      "courseId": "60d0fe4f5311236168a109cb",
      "courseTitle": "Data Structures & Algorithms",
      "thumbnailUrl": "https://example.com/dsa.jpg",
      "progressPercentage": 45,
      "lastAccessedAt": "2023-10-01T10:00:00.000Z",
      "nextLessonId": "60d0fe4f5311236168a109cc"
    },
    "recommendedCourses": [
      {
        "courseId": "60d0fe4f5311236168a109cd",
        "title": "Machine Learning Foundations",
        "thumbnailUrl": "https://example.com/ml.jpg",
        "difficulty": "Intermediate",
        "matchScore": 95,
        "tags": ["AI", "Python"]
      }
    ],
    "progress": {
      "coursesEnrolled": 2,
      "coursesCompleted": 0,
      "totalLearningHours": 12.5,
      "averageScore": 88
    },
    "recentActivity": [
      {
        "id": "60d0fe4f5311236168a109ce",
        "type": "LESSON_COMPLETED",
        "title": "Completed Arrays Lesson",
        "description": "You scored 100% on the Arrays quiz.",
        "timestamp": "2023-10-01T09:30:00.000Z",
        "metadata": {
          "courseId": "60d0fe4f5311236168a109cb",
          "lessonId": "60d0fe4f5311236168a109cf"
        }
      }
    ],
    "notifications": [
      {
        "id": "60d0fe4f5311236168a109d0",
        "type": "SYSTEM",
        "title": "Welcome to Kredl!",
        "message": "Complete your profile to get personalized recommendations.",
        "isRead": false,
        "priority": "HIGH",
        "createdAt": "2023-10-01T08:00:00.000Z"
      }
    ],
    "generatedAt": "2023-10-02T12:00:00.000Z"
  },
  "timestamp": "2023-10-02T12:00:00.000Z"
}
```

#### Possible Errors
- **401 Unauthorized:** Missing or invalid JWT token.
- **403 Forbidden:** Authenticated user is not a STUDENT.
- **404 Not Found:** User profile not found (e.g., deleted account).
- **500 Internal Server Error:** Underlying database or service failure.

#### Performance & Security Notes
- **Performance:** This endpoint executes 6 internal queries concurrently via `Promise.all()`. Sub-services use MongoDB `.lean()` and targeted `.select()` projections to guarantee response times under 300ms.
- **Security:** Internal MongoDB `_id` fields are transformed to `id`. Sensitive profile attributes (passwords, tokens, reset links) are strictly excluded from `UserProfileSnippetDto`.
- **Configurability:** Density limits (e.g., max activities, max recommended courses) are controlled via `src/config/dashboard.config.ts`.

### 2. Sub-Endpoints
While the `GET /dashboard` endpoint aggregates everything, individual components can be fetched (e.g., for lazy loading or refresh).

- **`GET /dashboard/continue-learning`**: Returns only the user's active/ongoing course.
- **`GET /dashboard/recommended`**: Returns a list of curated course recommendations based on user role and skills.
- **`GET /dashboard/progress`**: Returns the `ProgressSummaryDto` (enrolled, completed, hours, avg score).
- **`GET /dashboard/activity`**: Returns a timeline of the user's recent actions (bookmarks, completions, enrollments).
- **`GET /dashboard/notifications`**: Returns recent notifications for the student.

*All sub-endpoints require a valid JWT (`@Roles(RoleEnum.STUDENT)`) and scope strictly to the authenticated user's ID.*
