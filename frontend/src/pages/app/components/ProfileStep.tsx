import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ProfileStep({ form }: { form: any }) {
  // Destructure register for cleaner code
  const { register } = form;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
        <p className="text-sm text-muted-foreground">
          This information is used for resume generation and application
          communications.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Row 1: Full Name */}
        <div className="space-y-2">
          <Label className="text-blue-600">Full Name</Label>
          <Input
            {...register("fullName")}
            placeholder="Full Name as it appears on your resume"
          />
        </div>

        {/* Row 2: Email & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-blue-600">Email</Label>
            <Input
              type="email"
              {...register("email")}
              placeholder="Email address"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-blue-600">Phone</Label>
            <Input
              type="tel"
              {...register("phone")}
              placeholder="Phone number"
            />
          </div>
        </div>

        {/* Row 3: Street Address */}
        <div className="space-y-2">
          <Label className="text-blue-600">Street Address</Label>
          <Input {...register("address")} placeholder="123 Career Way" />
        </div>

        {/* Row 4: City, State, Zip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2 md:col-span-1">
            <Label className="text-blue-600">City</Label>
            <Input {...register("city")} placeholder="City" />
          </div>
          <div className="space-y-2">
            <Label className="text-blue-600">State</Label>
            <Input {...register("state")} placeholder="GA" />
          </div>
          <div className="space-y-2">
            <Label className="text-blue-600">Zip Code</Label>
            <Input {...register("postalCode")} placeholder="30101" />
          </div>
        </div>

        {/* Row 5: LinkedIn */}
        <div className="space-y-2">
          <Label className="text-blue-600">LinkedIn URL</Label>
          <Input
            {...register("linkedin")}
            placeholder="https://linkedin.com/in/username"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default ProfileStep;
