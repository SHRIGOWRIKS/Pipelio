import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Pipelio",
  description: "How Pipelio handles your data.",
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-sm text-[#6B7280] mb-8">Last updated: January 2025</p>

          <div className="space-y-6 text-sm text-[#6B7280] leading-relaxed">
            <section>
              <h2 className="text-base font-medium text-[#1C1C1E] mb-2">
                What data we collect
              </h2>
              <p>
                Pipelio collects only the information needed to provide the service:
                your name and email address from Google Sign-In, and the job
                application data you enter manually. We do not collect any other
                personal information.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-[#1C1C1E] mb-2">
                Gmail access
              </h2>
              <p>
                If you connect Gmail, Pipelio requests read-only access to scan
                your inbox for job-related emails. We never read, store, or
                transmit the content of your emails beyond what is needed to
                surface relevant job updates. We do not send emails on your behalf.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-[#1C1C1E] mb-2">
                How your data is stored
              </h2>
              <p>
                All data is stored securely in an encrypted database. We use
                industry-standard security practices to protect your information.
                Your data is never sold, rented, or shared with third parties for
                advertising or any other commercial purpose.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-[#1C1C1E] mb-2">
                Deleting your account
              </h2>
              <p>
                You can delete your account at any time from the Settings page.
                Deleting your account permanently removes all your data from our
                systems within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-[#1C1C1E] mb-2">
                Third-party services
              </h2>
              <p>
                Pipelio uses Google OAuth for authentication and optionally Google
                Gemini AI for resume analysis features. These services are governed
                by their own privacy policies. We do not share your personal data
                with any other third parties.
              </p>
            </section>

            <section>
              <h2 className="text-base font-medium text-[#1C1C1E] mb-2">
                Contact
              </h2>
              <p>
                Questions about privacy? Email us at{" "}
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
