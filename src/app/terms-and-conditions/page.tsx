import { AppHeader } from "@/components/shared/header";
import { AppFooter } from "@/components/shared/footer";
import { ClientDate } from "@/components/shared/client-date";

export default function TermsAndConditions() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-grow container max-w-4xl mx-auto py-12 px-4 md:px-6">
        <div className="space-y-8">
          <h1 className="text-4xl font-bold font-headline">Terms and Conditions</h1>
          <p className="text-muted-foreground">Last updated: <ClientDate /></p>

          <div className="space-y-4 text-muted-foreground">
            <p>Please read these Terms and Conditions ("Terms", "Terms and Conditions") carefully before using the EXNUS POINTS application (the "Service") operated by us.</p>
            <p>Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.</p>
            
            <h2 className="text-2xl font-semibold text-foreground pt-4">1. The Service</h2>
            <p>EXNUS POINTS provides a platform for users to earn points through various activities, which may be eligible for a future airdrop. The accumulation of points does not guarantee any monetary value or airdrop allocation. The specifics of any potential airdrop will be announced at a later date at our sole discretion.</p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">2. User Responsibilities</h2>
            <p>You are responsible for the security of your own Solana wallet. We will never ask for your private keys or seed phrase. You agree not to engage in any activity that could compromise the security or integrity of the Service, including but not limited to using bots, scripts, or other automated means to accumulate points.</p>
            <p>Any attempt to manipulate the system or exploit vulnerabilities will result in the forfeiture of all accumulated points and a permanent ban from the Service.</p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">3. Disclaimers</h2>
            <p>The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties of any kind, express or implied, as to the operation of our Service or the information, content, or materials included therein. You expressly agree that your use of the Service is at your sole risk.</p>
            <p>We do not guarantee that the service will be uninterrupted or error-free. We reserve the right to modify, suspend, or discontinue the Service at any time without prior notice.</p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">4. Limitation of Liability</h2>
            <p>In no event shall EXNUS POINTS, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">5. Governing Law</h2>
            <p>These Terms shall be governed and construed in accordance with the laws of the applicable jurisdiction, without regard to its conflict of law provisions.</p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">6. Changes</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms and Conditions on this page.</p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">7. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us.</p>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
