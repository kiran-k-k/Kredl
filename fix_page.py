with open('src/app/dashboard/page.tsx', 'r') as f:
    content = f.read()

# I need to add import for EnrolledCourseCard
import_string = """import { EnrolledCourseCard } from "@/components/student/enrolled-course-card"
import { useDashboardProgress } from "@/hooks/useProgress"
"""

content = content.replace('import { useDashboard } from "@/hooks/useDashboard"', 'import { useDashboard } from "@/hooks/useDashboard"\n' + import_string)

# Inside component, call useDashboardProgress
hook_call = """  const { data: dashboardData, isLoading, isError } = useDashboard()
  const { data: enrolledCourses, isLoading: isCoursesLoading } = useDashboardProgress()"""

content = content.replace('  const { data: dashboardData, isLoading, isError } = useDashboard()', hook_call)

# Now, add "Enrolled Courses" section
enrolled_section = """
            {/* Enrolled Courses Section */}
            {enrolledCourses && enrolledCourses.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-bold text-lg tracking-tight">My Enrolled Courses</h2>
                  <Link href="/courses" className="text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm px-1 -mx-1">
                    Browse More
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {enrolledCourses.map((course) => (
                    <EnrolledCourseCard key={course.id} course={course} />
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-4">"""

content = content.replace('            <section className="space-y-4">', enrolled_section)

with open('src/app/dashboard/page.tsx', 'w') as f:
    f.write(content)
