import { PublicLayout } from "@/components/layout/public-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowRight, BookOpen, Briefcase, Building2, CheckCircle2, ChevronRight, GraduationCap, LayoutGrid, Terminal } from "lucide-react"
import Link from "next/link"

export default async function LandingPage() {
  let featuredCourses = [];
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    const res = await fetch(`${apiUrl}/courses?isFeatured=true&limit=6`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const json = await res.json();
      featuredCourses = json.data || [];
      console.log("Fetched featured courses:", featuredCourses.length);
    } else {
      console.error("Fetch failed with status:", res.status);
    }
  } catch (error) {
    console.error("Failed to fetch featured courses:", error);
  }

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-24 pb-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium mb-8 bg-surface">
            <span className="flex h-2 w-2 rounded-full bg-success mr-2"></span>
            Admissions open for Batch 2026
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 max-w-4xl mx-auto leading-tight">
            The ultimate ecosystem to <br className="hidden md:block" />
            <span className="text-muted-foreground">launch your engineering career.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Structured learning roadmaps, premium resources, and direct placement guidance designed exclusively to make you job-ready.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8" asChild>
              <Link href="/register">Start Learning for Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 px-8" asChild>
              <Link href="/courses">Explore Roadmaps</Link>
            </Button>
          </div>
          
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t pt-10">
            <div className="flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">10k+</span>
              <span className="text-sm text-muted-foreground mt-1">Active Students</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">500+</span>
              <span className="text-sm text-muted-foreground mt-1">Hiring Partners</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">50+</span>
              <span className="text-sm text-muted-foreground mt-1">Structured Paths</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">92%</span>
              <span className="text-sm text-muted-foreground mt-1">Placement Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="border-y bg-surface py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-muted-foreground mb-8">
            STUDENTS PLACED AT TOP TECH COMPANIES
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
            {/* Placeholders for logos */}
            <div className="text-2xl font-bold">Amazon</div>
            <div className="text-2xl font-bold">Google</div>
            <div className="text-2xl font-bold">Microsoft</div>
            <div className="text-2xl font-bold">Atlassian</div>
            <div className="text-2xl font-bold">Stripe</div>
          </div>
        </div>
      </section>

      {/* Why Kredl Section */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Everything you need to succeed.
            </h2>
            <p className="text-lg text-muted-foreground">
              We replace fragmented YouTube tutorials and outdated college curriculums with a unified, professional training platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-surface border-border/50">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <LayoutGrid className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Structured Learning</CardTitle>
                <CardDescription>Zero guesswork. Follow exact roadmaps detailing what to learn, when to learn it, and how to practice.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-surface border-border/50">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Curated Free Resources</CardTitle>
                <CardDescription>We've indexed the best free YouTube playlists, documentation, and articles into one cohesive timeline.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-surface border-border/50">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Terminal className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Real-world Projects</CardTitle>
                <CardDescription>Build portfolio-grade applications that actually impress recruiters, not just generic calculator apps.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-surface border-border/50">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Company Preparation</CardTitle>
                <CardDescription>Specific interview patterns, past questions, and evaluation criteria for major tech companies.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-surface border-border/50">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Placement Guidance</CardTitle>
                <CardDescription>Resume reviews, mock interviews, and aptitude test preparation to clear the initial screening rounds.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-surface border-border/50">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Weekly Job Updates</CardTitle>
                <CardDescription>Curated entry-level roles and internships sent directly to you, bypassing the noise of massive job boards.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Learning Journey */}
      <section className="py-24 bg-surface border-y">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                A proven framework to get hired.
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our methodology has helped thousands of students transition from beginners to employed software engineers. We focus on outcome-based learning.
              </p>
              
              <div className="space-y-8">
                {[
                  { title: "Choose Career", desc: "Select a specialized track based on market demand and your interests." },
                  { title: "Learn & Practice", desc: "Consume curated content and solve targeted coding problems." },
                  { title: "Build Projects", desc: "Develop complex applications to prove your technical competence." },
                  { title: "Prepare for Interviews", desc: "Master CS fundamentals, system design, and behavioral rounds." },
                  { title: "Apply for Jobs", desc: "Leverage our tailored job board to secure your first role." },
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                        {i + 1}
                      </div>
                      {i !== 4 && <div className="h-full w-px bg-border my-2"></div>}
                    </div>
                    <div className="pb-8">
                      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="rounded-2xl border bg-background p-8 shadow-sm">
                {/* Mini Dashboard Representation */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Target Role</p>
                      <p className="text-xl font-bold text-primary">Software Engineer</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center border border-success/20">
                      <span className="text-success font-bold">68%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Backend Architecture</span>
                        <span className="text-muted-foreground">In Progress</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-2/3 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-4 border rounded-xl bg-surface/50">
                      <Terminal className="h-5 w-5 text-primary mb-2" />
                      <p className="font-bold text-xl">12</p>
                      <p className="text-xs text-muted-foreground">Projects Built</p>
                    </div>
                    <div className="p-4 border rounded-xl bg-surface/50">
                      <Building2 className="h-5 w-5 text-primary mb-2" />
                      <p className="font-bold text-xl">4</p>
                      <p className="text-xs text-muted-foreground">Target Companies</p>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-2" variant="outline">
                    Resume Learning
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">Featured Roadmaps</h2>
              <p className="text-muted-foreground">Comprehensive paths designed for industry requirements.</p>
            </div>
            <Button variant="ghost" className="hidden sm:flex" asChild>
              <Link href="/courses">View All <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.length > 0 ? (
              featuredCourses.map((course: any, i: number) => (
                <Card key={course.id || i} className="flex flex-col hover:border-primary/50 transition-colors cursor-pointer group">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                        {course.category || "General"}
                      </span>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{course.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {course.durationWeeks ? `${course.durationWeeks} Weeks` : 'Self-paced'}</span>
                      <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" /> {course.difficulty || 'All Levels'}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <div className="w-full h-px bg-border mb-4"></div>
                    <Link href={`/courses/${course.slug}`} className="flex items-center text-sm font-medium text-primary hover:underline">
                      View Syllabus <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground col-span-full text-center py-8">No featured roadmaps found.</p>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-surface border-y">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Everything you need to know about the platform.</p>
          </div>
          
          <Accordion className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left text-lg font-medium">Is Kredl completely free?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                Yes, our core learning roadmaps and curated resources are 100% free. We believe education should be accessible to everyone. We may introduce premium features for mock interviews and resume reviews in the future.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left text-lg font-medium">Do I get a certificate?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                Kredl focuses on skills over certificates. While you can track your progress, we encourage you to build the projects in our roadmaps, which are far more valuable to employers than a completion certificate.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left text-lg font-medium">How often are the job boards updated?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                Our job board is updated weekly with entry-level software engineering roles and internships specifically curated for fresh graduates and students.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left text-lg font-medium">Can I contribute to Kredl?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                Absolutely! Kredl is a community-driven platform. You can suggest new resources, report outdated content, or share interview experiences from your placement drives.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-primary px-6 py-16 sm:px-12 sm:py-20 text-center flex flex-col items-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl mb-6 max-w-2xl">
              Ready to land your dream engineering job?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-10 max-w-xl">
              Join thousands of students who are building their careers with Kredl. Sign up today and get instant access to all roadmaps.
            </p>
            <Button size="lg" variant="secondary" className="h-12 px-8 text-base" asChild>
              <Link href="/register">Create your free account</Link>
            </Button>
            <p className="text-sm text-primary-foreground/60 mt-6 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> No credit card required.
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
