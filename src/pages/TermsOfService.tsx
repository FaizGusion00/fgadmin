
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Terms of Service</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>FGAdmin Terms of Service</CardTitle>
            <p className="text-sm text-muted-foreground">Last Updated: January 2025</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using FGAdmin ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
              <p className="text-muted-foreground">
                FGAdmin is a comprehensive IT company management platform that provides tools for project management, client management, sales tracking, note-taking, calendar scheduling, todo management, and thesis research management. The service is designed to help IT professionals and companies organize and manage their business operations efficiently.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. User Accounts and Registration</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>• Users must provide accurate and complete information during registration</p>
                <p>• Users are responsible for maintaining the confidentiality of their account credentials</p>
                <p>• Users must notify us immediately of any unauthorized use of their account</p>
                <p>• We reserve the right to suspend or terminate accounts that violate these terms</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Acceptable Use Policy</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>Users agree not to use the service to:</p>
                <p>• Upload, post, or transmit any content that is illegal, harmful, or violates third-party rights</p>
                <p>• Attempt to gain unauthorized access to other user accounts or our systems</p>
                <p>• Use the service for any commercial purpose without our written consent</p>
                <p>• Interfere with or disrupt the service or servers connected to the service</p>
                <p>• Use automated scripts or bots to access the service</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Data and Privacy</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>• Your data is stored securely using industry-standard encryption</p>
                <p>• We do not sell, trade, or rent your personal information to third parties</p>
                <p>• You retain ownership of all content you create and store in the service</p>
                <p>• We may access your data only as necessary to provide the service or as required by law</p>
                <p>• You can export or delete your data at any time through your account settings</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
              <p className="text-muted-foreground">
                The FGAdmin platform, including all software, design, text, graphics, and other content, is owned by FGCompany Official and is protected by copyright, trademark, and other intellectual property laws. Users are granted a limited, non-exclusive license to use the service for its intended purpose.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Service Availability and Modifications</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>• We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service</p>
                <p>• We may modify or discontinue features with reasonable notice</p>
                <p>• Scheduled maintenance will be announced in advance when possible</p>
                <p>• We are not liable for any downtime or service interruptions</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                FGCompany Official shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Termination</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>• You may terminate your account at any time by contacting us</p>
                <p>• We may terminate or suspend accounts that violate these terms</p>
                <p>• Upon termination, your right to use the service ceases immediately</p>
                <p>• You may request data export before account termination</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the service. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Contact Information</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>For questions about these Terms of Service, please contact:</p>
                <p>• Developer: Faiz Nasir</p>
                <p>• Company: FGCompany Official</p>
                <p>• Email: support@fgcompany.com</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Governing Law</h2>
              <p className="text-muted-foreground">
                These terms shall be governed by and construed in accordance with applicable laws. Any disputes arising from these terms or use of the service shall be resolved through binding arbitration.
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

export default TermsOfService;
