import { AppHeader } from "@/components/shared/header";
import { AppFooter } from "@/components/shared/footer";
import { ClientDate } from "@/components/shared/client-date";

export default function PrivacyPolicy() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-grow container max-w-4xl mx-auto py-12 px-4 md:px-6">
        <div className="space-y-8">
          <h1 className="text-4xl font-bold font-headline">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: <ClientDate /></p>

          <div className="space-y-4 text-muted-foreground">
            <p>Welcome to EXNUS POINTS ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.</p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">1. Information We Collect</h2>
            <p>We may collect information about you in a variety of ways. The information we may collect via the Application includes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Wallet Information:</strong> We collect your public Solana wallet address when you connect your wallet to our application. We do not collect or store your private keys. Your interactions with your wallet are handled by your chosen wallet provider.</li>
              <li><strong>Usage Data:</strong> We may automatically collect information about your interaction with our services, such as your mining activity, points balance, and referral data. This information is tied to your public wallet address.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground pt-4">2. Use of Your Information</h2>
            <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Manage your account and points balance.</li>
              <li>Administer the airdrop and other promotions.</li>
              <li>Monitor and analyze usage and trends to improve your experience with the Application.</li>
              <li>Ensure the security and integrity of our platform.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground pt-4">3. Disclosure of Your Information</h2>
            <p>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. All data related to your activity is public on the Solana blockchain and associated with your public wallet address.</p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">4. Security of Your Information</h2>
            <p>We use administrative, technical, and physical security measures to help protect your information. While we have taken reasonable steps to secure the information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">5. Third-Party Websites</h2>
            <p>The Application may contain links to third-party websites and applications of interest, including advertisements and external services, that are not affiliated with us. Once you have used these links to leave the Application, any information you provide to these third parties is not covered by this Privacy Policy, and we cannot guarantee the safety and privacy of your information.</p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">6. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">7. Contact Us</h2>
            <p>If you have questions or comments about this Privacy Policy, please contact us through our official channels.</p>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
