import { PublicLayout } from "@/components/layout/public-layout"
import { Separator } from "@/components/ui/separator"

export default function PrivacyPolicyPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: July 5, 2026</p>
        </div>
        
        <Separator className="mb-12" />

        <div className="flex flex-col md:flex-row gap-12">
          {/* Table of Contents - Sticky Sidebar */}
          <aside className="md:w-64 shrink-0">
            <div className="sticky top-24 space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Contents</h3>
              <nav className="flex flex-col space-y-3 text-sm">
                <a href="#information-we-collect" className="text-foreground hover:text-primary transition-colors font-medium">Information We Collect</a>
                <a href="#how-we-use" className="text-muted-foreground hover:text-foreground transition-colors">How We Use Your Information</a>
                <a href="#sharing" className="text-muted-foreground hover:text-foreground transition-colors">Sharing of Information</a>
                <a href="#security" className="text-muted-foreground hover:text-foreground transition-colors">Data Security</a>
                <a href="#changes" className="text-muted-foreground hover:text-foreground transition-colors">Changes to Policy</a>
              </nav>
            </div>
          </aside>

          {/* Prose Content */}
          <div className="flex-1 max-w-3xl prose prose-neutral dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary">
            <p className="lead text-lg text-muted-foreground mb-8">
              At Kredl, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our platform.
            </p>

            <h2 id="information-we-collect" className="text-2xl font-bold mt-12 mb-4">1. Information We Collect</h2>
            <p className="mb-4">We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
            <ul className="list-disc pl-6 space-y-2 mb-8 text-muted-foreground">
              <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number.</li>
              <li><strong>Educational Data:</strong> Information regarding your college, graduation year, degree, and current technical skills.</li>
              <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, browser type, and operating system.</li>
            </ul>

            <h2 id="how-we-use" className="text-2xl font-bold mt-12 mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-8 text-muted-foreground">
              <li>Create and manage your account.</li>
              <li>Deliver targeted job opportunities and internship recommendations.</li>
              <li>Compile anonymous statistical data and analysis for use internally.</li>
              <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
            </ul>

            <h2 id="sharing" className="text-2xl font-bold mt-12 mb-4">3. Sharing of Information</h2>
            <p className="mb-8 text-muted-foreground">
              We may share information we have collected about you in certain situations. Your information may be disclosed to our hiring partners only when you explicitly apply for a job or give us permission to feature your profile in our candidate database. We do not sell your personal data to third-party marketing agencies.
            </p>

            <h2 id="security" className="text-2xl font-bold mt-12 mb-4">4. Data Security</h2>
            <p className="mb-8 text-muted-foreground">
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
            </p>

            <h2 id="changes" className="text-2xl font-bold mt-12 mb-4">5. Changes to This Policy</h2>
            <p className="mb-8 text-muted-foreground">
              We may update this Privacy Policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new Privacy Policy on this page.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
