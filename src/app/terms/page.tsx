import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Pipelio",
  description: "Terms of service for using Pipelio.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1C1C1E] transition-colors mb-8"
        >
          ← Back to home
        </Link>

        <div className="bg-white rounded-xl border border-[#E8E8E4] p-8">
          <h1 className="text-2xl font-semibold text-[#1C1C1E] mb-2">
            Terms of Service
          </h1>
          <p className="text-sm text-[#6B7280] mb-8">Last updated: January 2025</p>

          <div className="space-y-6 text-sm text-[#6B7280] leading-relaxed">
            <section>
              <h2 className="text-base font-medium text-[#1C1C1E] mb-2">
                Free service
              </h2>
              <p>
                Pipelio is provided free of charge. We reserve the right to
                introduce paid features in the future, but any free features
                available today will remain free. We will give reasonable notice
                before making any changes to the pricing model.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-[#1C1C1E] mb-2">
                No warranty
              </h2>
              <p>
                Pipelio is provided &ldquo;as is&rdquo; without warranty of any kind.
                We do our best to keep the service running reliably, but we cannot
                guarantee uninterrupted availability. Use of the service is at your
                own risk.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-[#1C1C1E] mb-2">
                Your data
              </h2>
              <p>
                You own your data. The job applications, notes, and other content
                you add to Pipelio belong to you. We do not claim any ownership
                over your data. You can export or delete your data at any time.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-[#1C1C1E] mb-2">
                Acceptable use
              </h2>
              <p>
                You agree to use Pipelio only for lawful purposes. We reserve the
                right to suspend or terminate accounts that are used for abuse,
                spam, automated scraping, or any activity that harms the service
                or other users.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-[#1C1C1E] mb-2">
                Account termination
              </h2>
              <p>
                You may delete your account at any time from the Settings page.
                We may terminate accounts that violate these terms. Upon
                termination, your data will be permanently deleted from our
                systems within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-[#1C1C1E] mb-2">
                Changes to these terms
              </h2>
              <p>
                We may update these terms from time to time. Continued use of
                Pipelio after changes are posted constitutes acceptance of the
                updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-[#1C1C1E] mb-2">
                Contact
              </h2>
              <p>
                Questions about these terms? Email us at{" "}
                <a
                  href="mailto:hello@pipelio.app"
                  className="text-[#6B9E78] hover:underline"
                >
                  hello@pipelio.app
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
