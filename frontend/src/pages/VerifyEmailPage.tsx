import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { confirmSignUp, resendSignUpCode } from "@aws-amplify/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Retrieve email from registration state
  const email = location.state?.email || "";

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      toast.success("Account confirmed! You can now log in."); // Sonner syntax
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Verification failed"); // Sonner syntax
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendSignUpCode({ username: email });
      toast.info("Code resent. Check your inbox.");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-100">
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
          <p className="text-sm text-muted-foreground">Sent to {email}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              placeholder="Verification Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Confirm Account"}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={handleResend}
              type="button"
            >
              Resend Code
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
