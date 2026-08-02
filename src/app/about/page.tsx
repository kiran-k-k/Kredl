import { PublicLayout } from "@/components/layout/public-layout"
import { Target, Compass, Users, Sparkles, Mail } from "lucide-react"
import Image from "next/image"

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="py-24 md:py-32 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Bridging the gap between <br className="hidden md:block" />
            <span className="text-muted-foreground">education and employment.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Kredl was founded with a single mission: to provide every engineering student with a clear, structured path to a successful career, regardless of their college tier.
          </p>
        </div>
      </section>

      {/* Meet the Creator */}
      <section className="py-24 bg-surface border-y">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Meet the Creator</h2>
            <p className="text-lg text-muted-foreground">
              The person behind Kredl and the story of why it was built.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center md:items-start max-w-5xl mx-auto bg-background border rounded-2xl p-8 md:p-12 shadow-sm">
            {/* Profile Picture */}
            <div className="shrink-0 flex flex-col items-center gap-4">
              <div className="relative h-44 w-44 md:h-52 md:w-52 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg ring-2 ring-primary/10">
                <Image
                  src="/kiran-kendre.jpeg"
                  alt="Kiran Kishanrao Kendre — Founder of Kredl"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>

              {/* Contact Icons */}
              <div className="flex items-center gap-4 mt-2">
                <a
                  href="https://www.linkedin.com/in/kiran-kendre"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Kiran Kendre on LinkedIn"
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a
                  href="mailto:kendrek57@gmail.com"
                  aria-label="Email Kiran Kendre"
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Mail className="h-5 w-5" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">Kiran Kishanrao Kendre</h3>
              <p className="text-primary font-medium mb-6">
                Computer Science Engineering Student &middot; Aspiring Full Stack Java Developer &middot; Founder of Kredl
              </p>

              <blockquote className="border-l-4 border-primary/30 pl-5 text-lg text-muted-foreground italic leading-relaxed mb-8">
                &ldquo;I am passionate about helping students prepare for their dream careers in technology. I created Kredl to provide a structured learning platform that combines curated free resources, practical projects, company-specific preparation, interview guidance, and placement support so students can learn efficiently without feeling overwhelmed.&rdquo;
              </blockquote>

              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <a
                  href="https://www.linkedin.com/in/kiran-kendre"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Connect with Kiran on LinkedIn"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border bg-background text-sm font-medium hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <svg className="h-4 w-4" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  linkedin.com/in/kiran-kendre
                </a>
                <a
                  href="mailto:kendrek57@gmail.com"
                  aria-label="Email Kiran at kendrek57@gmail.com"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border bg-background text-sm font-medium hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
                  kendrek57@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story / Split Section */}
      <section className="py-24 bg-surface border-y">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-6">The Problem We're Solving</h2>
              <div className="space-y-4 text-lg text-muted-foreground">
                <p>
                  Every year, millions of engineering students graduate, yet only a fraction possess the skills required by modern tech companies.
                </p>
                <p>
                  The internet is flooded with excellent free tutorials, but this fragmentation creates chaos. Students don't know <em>what</em> to learn, in what <em>order</em>, or <em>how</em> to prove their skills to employers.
                </p>
                <p>
                  Traditional college curriculums struggle to keep pace with the rapidly evolving tech landscape, leaving a massive skill gap.
                </p>
              </div>
            </div>
            <div className="bg-background border rounded-2xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold tracking-tight mb-6">Our Solution</h2>
              <div className="space-y-4 text-lg text-muted-foreground">
                <p>
                  Kredl brings order to the chaos. We act as your digital career mentor.
                </p>
                <p>
                  We provide meticulously structured roadmaps that sequence the best free resources available online. But learning is only half the battle.
                </p>
                <p>
                  We pair this curriculum with company-specific interview preparation, resume building guidance, and direct access to entry-level job opportunities. We are an end-to-end career ecosystem.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Philosophy */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Our Core Philosophy</h2>
            <p className="text-lg text-muted-foreground">
              The principles that guide everything we build at Kredl.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Outcome Oriented</h3>
                <p className="text-muted-foreground text-lg">
                  We don't care about vanity metrics or meaningless certificates. We optimize strictly for one outcome: getting you hired as a software engineer.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Compass className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Structured Guidance</h3>
                <p className="text-muted-foreground text-lg">
                  Information is abundant; structure is scarce. We do the heavy lifting of curation so you can spend 100% of your time actually learning.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Users className="flex-shrink-0 h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Accessible to All</h3>
                <p className="text-muted-foreground text-lg">
                  Your college tier should not dictate your career trajectory. High-quality education and career preparation must be accessible to everyone.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Continuous Evolution</h3>
                <p className="text-muted-foreground text-lg">
                  The tech industry changes daily. Our roadmaps and interview preparation guides are constantly updated to reflect current market demands.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
