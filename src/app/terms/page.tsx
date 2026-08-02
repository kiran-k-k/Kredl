import { PublicLayout } from "@/components/layout/public-layout"
import { Separator } from "@/components/ui/separator"

export default function TermsConditionsPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Terms & Conditions</h1>
          <p className="text-muted-foreground mb-8">Last updated: July 5, 2026</p>
        </div>
        
        <Separator className="mb-12" />

        <div className="flex flex-col md:flex-row gap-12">
          {/* Table of Contents - Sticky Sidebar */}
          <aside className="md:w-64 shrink-0">
            <div className="sticky top-24 space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Contents</h3>
              <nav className="flex flex-col space-y-3 text-sm">
                <a href="#agreement" className="text-foreground hover:text-primary transition-colors font-medium">Agreement to Terms</a>
                <a href="#ip" className="text-muted-foreground hover:text-foreground transition-colors">Intellectual Property</a>
                <a href="#user-rep" className="text-muted-foreground hover:text-foreground transition-colors">User Representations</a>
                <a href="#prohibited" className="text-muted-foreground hover:text-foreground transition-colors">Prohibited Activities</a>
                <a href="#liability" className="text-muted-foreground hover:text-foreground transition-colors">Limitation of Liability</a>
              </nav>
            </div>
          </aside>

          {/* Prose Content */}
          <div className="flex-1 max-w-3xl prose prose-neutral dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary">
            <p className="lead text-lg text-muted-foreground mb-8">
              These Terms and Conditions constitute a legally binding agreement made between you and Kredl concerning your access to and use of the Kredl platform and website.
            </p>

            <h2 id="agreement" className="text-2xl font-bold mt-12 mb-4">1. Agreement to Terms</h2>
            <p className="mb-8 text-muted-foreground">
              By accessing the Site, you agree that you have read, understood, and agree to be bound by all of these Terms and Conditions. If you do not agree with all of these terms, then you are expressly prohibited from using the Site and you must discontinue use immediately.
            </p>

            <h2 id="ip" className="text-2xl font-bold mt-12 mb-4">2. Intellectual Property Rights</h2>
            <p className="mb-8 text-muted-foreground">
              Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein are owned or controlled by us or licensed to us.
            </p>

            <h2 id="user-rep" className="text-2xl font-bold mt-12 mb-4">3. User Representations</h2>
            <p className="mb-4">By using the Site, you represent and warrant that:</p>
            <ul className="list-disc pl-6 space-y-2 mb-8 text-muted-foreground">
              <li>All registration information you submit will be true, accurate, current, and complete.</li>
              <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
              <li>You have the legal capacity and you agree to comply with these Terms and Conditions.</li>
              <li>You will not use the Site for any illegal or unauthorized purpose.</li>
            </ul>

            <h2 id="prohibited" className="text-2xl font-bold mt-12 mb-4">4. Prohibited Activities</h2>
            <p className="mb-8 text-muted-foreground">
              You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us. Prohibited activities include attempting to bypass any measures of the Site designed to prevent or restrict access to the Site, or any portion of the Site.
            </p>

            <h2 id="liability" className="text-2xl font-bold mt-12 mb-4">5. Limitation of Liability</h2>
            <p className="mb-8 text-muted-foreground">
              In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the Site, even if we have been advised of the possibility of such damages.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
