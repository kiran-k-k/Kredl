# Dashboard API

All endpoints require a valid JWT Access Token.

## Authentication
`Authorization: Bearer <JWT_TOKEN>`

---

## 1. Continue Learning

Retrieves the student's most recently accessed, active course progress. If the user has not started any courses, or if all courses are fully completed, this returns `null`.

**Endpoint**: `GET /dashboard/continue-learning`
**Roles**: `Student`

### Request
```bash
curl -X GET http://localhost:3000/dashboard/continue-learning \
  -H "Authorization: Bearer eyJhbGciOi..."
```

### Response: Success (200 OK)
```json
{
  "success": true,
  "message": "Continue learning fetched successfully",
  "data": {
    "continueLearning": {
      "courseId": "60d5ecb8b392d7001f3e4e56",
      "courseTitle": "Full Stack Web Development",
      "courseSlug": "full-stack-web-dev",
      "courseThumbnail": "https://example.com/thumb.jpg",
      "moduleId": "60d5ecb8b392d7001f3e4e58",
      "moduleTitle": "React Fundamentals",
      "lessonId": "60d5ecb8b392d7001f3e4e5a",
      "lessonTitle": "State and Props",
      "lessonType": "VIDEO",
      "completionPercentage": 45,
      "lastWatchedAt": "2023-10-01T12:00:00Z",
      "lastActivityAt": "2023-10-01T12:05:00Z",
      "nextLesson": {
        "lessonId": "60d5ecb8b392d7001f3e4e5a",
        "title": "State and Props",
        "order": 3
      }
    }
  },
  "timestamp": "2023-10-01T12:05:30Z"
}
```

### Response: No Active Progress (200 OK)
```json
{
  "success": true,
  "message": "Continue learning fetched successfully",
  "data": {
    "continueLearning": null
  },
  "timestamp": "2023-10-01T12:05:30Z"
}
```

### Response: Unauthorized (401 Unauthorized)
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Business Logic
- The API looks for the single most recently accessed `Progress` record where `status === 'in_progress'`.
- It fetches the course and its modules.
- It iterates through the modules in `order` and checks the lessons in `order`.
- It finds the first lesson `_id` that is NOT present in the user's `completedLessons` array.
- This lesson becomes the `nextLesson`. 
- If all lessons across all modules are completed, the endpoint automatically marks the `Progress` status as `COMPLETED` and returns `null`.

### Performance Notes
- **Query Optimization**: Designed to operate completely free of `N+1` query issues. It performs exactly 4 flat database queries (Progress, Course, Modules, Lessons).
- **In-Memory Grouping**: To locate the next lesson across multiple modules, it groups lessons locally via Maps, keeping DB trips flat regardless of module count.
- **Indexes Used**: Queries target optimized MongoDB indexes (`userId` + `status` + `lastAccessedAt` for `Progress`, and `courseId`/`moduleId` for relations).
- **Target Response Time**: Expected to consistently return in < 300ms.

---

## 2. Recommended Courses

Retrieves highly tailored course recommendations segmented into specific categories. Designed using a generic Recommendation Provider pattern to seamlessly swap to an AI-driven engine in the future.

**Endpoint**: `GET /dashboard/recommended`
**Roles**: `Any Authenticated User`

### Request
```bash
curl -X GET http://localhost:3000/dashboard/recommended \
  -H "Authorization: Bearer eyJhbGciOi..."
```

### Response: Success (200 OK)
```json
{
  "success": true,
  "data": {
    "topCourses": [
      {
        "courseId": "60d5ecb8b392d7001f3e4e56",
        "title": "Full Stack Web Development",
        "slug": "full-stack-web-dev",
        "thumbnail": "https://example.com/thumb.jpg",
        "shortDescription": "Learn full stack web dev...",
        "difficulty": "Intermediate",
        "estimatedDuration": 0,
        "category": "Web Dev",
        "instructorName": "John Doe",
        "rating": 4.8,
        "totalStudents": 1500,
        "recommendationReason": "Highly rated course"
      }
    ],
    "newestCourses": [],
    "trendingCourses": [],
    "roleBasedCourses": [],
    "skillBasedCourses": []
  }
}
```

### Business Logic
- **Top Courses**: Fetches courses sorted by `rating` and `enrollmentCount` descending.
- **Newest Courses**: Fetches courses sorted by `createdAt` descending.
- **Trending Courses**: Fetches courses sorted by `enrollmentCount` and `createdAt`.
- **Role Based Courses**: Resolves the user's role and statically maps it to `category` strings for now.
- **Skill Based Courses**: If the user has a `skills` array, this finds courses matching those tags. If skills are empty or unavailable, returns `[]`.

### Future AI Integration
- The Controller merely coordinates `RecommendationService.getRecommendations()`.
- The `RecommendationService` is injected with an abstract `RecommendationProvider`.
- Currently, this provider resolves to `RuleBasedRecommendationProvider`.
- In the future, a new `AiRecommendationProvider` can be written to replace this, and the API contract will remain exactly the same.

