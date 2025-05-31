
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>FGAdmin Privacy Policy</CardTitle>
            <p className="text-sm text-muted-foreground">Last Updated: January 2025</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-muted-foreground">
                FGCompany Official ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use FGAdmin ("the Service").
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Personal Information</h3>
                  <div className="space-y-1 text-muted-foreground">
                    <p>• Email address (for account creation and authentication)</p>
                    <p>• Name and profile information (optional)</p>
                    <p>• Authentication data from third-party providers (Google, GitHub)</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Usage Data</h3>
                  <div className="space-y-1 text-muted-foreground">
                    <p>• Projects, clients, and business data you create</p>
                    <p>• Notes, todos, and calendar events</p>
                    <p>• Thesis research data and references</p>
                    <p>• Usage patterns and feature interactions</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Technical Data</h3>
                  <div className="space-y-1 text-muted-foreground">
                    <p>• IP address and browser information</p>
                    <p>• Device type and operating system</p>
                    <p>• Session data and cookies</p>
                    <p>• Error logs and performance metrics</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>We use your information to:</p>
                <p>• Provide, maintain, and improve the FGAdmin service</p>
                <p>• Authenticate your identity and secure your account</p>
                <p>• Store and sync your data across devices</p>
                <p>• Send important service updates and notifications</p>
                <p>• Analyze usage patterns to enhance user experience</p>
                <p>• Prevent fraud and ensure platform security</p>
                <p>• Comply with legal obligations</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Data Storage and Security</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>• All data is encrypted in transit and at rest using AES-256 encryption</p>
                <p>• We use Supabase for secure database management with enterprise-grade security</p>
                <p>• Regular security audits and vulnerability assessments are conducted</p>
                <p>• Access to your data is restricted to authorized personnel only</p>
                <p>• We implement multi-factor authentication and access controls</p>
                <p>• Data backups are performed regularly and stored securely</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Data Sharing and Disclosure</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>We do not sell, trade, or rent your personal information. We may share data only in these circumstances:</p>
                <p>• With your explicit consent</p>
                <p>• To comply with legal requirements or court orders</p>
                <p>• To protect our rights, property, or safety</p>
                <p>• In connection with a business transfer or merger</p>
                <p>• With service providers who assist in platform operations (under strict confidentiality agreements)</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Third-Party Services</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>We integrate with third-party services for enhanced functionality:</p>
                <p>• Google OAuth for authentication (subject to Google's Privacy Policy)</p>
                <p>• GitHub OAuth for authentication (subject to GitHub's Privacy Policy)</p>
                <p>• Supabase for data storage and management</p>
                <p>• These services have their own privacy policies and data handling practices</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Your Rights and Choices</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>You have the right to:</p>
                <p>• Access your personal data and request a copy</p>
                <p>• Correct inaccurate or incomplete information</p>
                <p>• Delete your account and associated data</p>
                <p>• Export your data in a portable format</p>
                <p>• Opt out of non-essential communications</p>
                <p>• Restrict processing of your data in certain circumstances</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Data Retention</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>• We retain your data only as long as necessary for service provision</p>
                <p>• Account data is deleted within 30 days of account termination</p>
                <p>• Some data may be retained longer for legal compliance</p>
                <p>• You can request immediate data deletion by contacting us</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Cookies and Tracking</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>• We use essential cookies for authentication and session management</p>
                <p>• Analytics cookies help us understand user behavior (anonymized)</p>
                <p>• You can disable cookies through your browser settings</p>
                <p>• Some features may not work properly without cookies</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. International Data Transfers</h2>
              <p className="text-muted-foreground">
                Your data may be processed in countries other than your own. We ensure that any international transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Children's Privacy</h2>
              <p className="text-muted-foreground">
                FGAdmin is not intended for use by children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">13. Contact Us</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>If you have questions about this Privacy Policy or our data practices, please contact:</p>
                <p>• Developer: Faiz Nasir</p>
                <p>• Company: FGCompany Official</p>
                <p>• Email: privacy@fgcompany.com</p>
                <p>• Data Protection Officer: dpo@fgcompany.com</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">14. Legal Compliance</h2>
              <p className="text-muted-foreground">
                This privacy policy complies with applicable data protection regulations including GDPR, CCPA, and other relevant privacy laws. We are committed to maintaining the highest standards of data protection and privacy.
              </p>
            </section>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground border-t pt-4">
          <p>Developed by: Faiz Nasir | Owned by: FGCompany Official</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
