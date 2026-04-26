import { useFieldArray } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, Award, Plus, Trash2, Heart, Info } from "lucide-react";

export function CredentialsStep({ form }: { form: any }) {
  const {
    fields: eduFields,
    append: appendEdu,
    remove: removeEdu,
  } = useFieldArray({
    control: form.control,
    name: "education",
  });

  const {
    fields: certFields,
    append: appendCert,
    remove: removeCert,
  } = useFieldArray({
    control: form.control,
    name: "certifications",
  });

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const years = Array.from({ length: 60 }, (_, i) =>
    (new Date().getFullYear() - i).toString(),
  );

  return (
    <div className="space-y-8">
      {/* SECTION: EDUCATION */}
      <Card className="border-2 border-slate-100 shadow-sm">
        <CardHeader className="bg-slate-50/50 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="w-5 h-5 text-emerald-600" /> Education
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendEdu({ school: "", degree: "", isCurrent: false })
            }
          >
            <Plus className="w-4 h-4 mr-1" /> Add Education
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {eduFields.map((field, index) => (
            <div
              key={field.id}
              className="p-6 border rounded-xl bg-white space-y-6 relative group border-slate-200 shadow-sm"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeEdu(index)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-blue-600 font-semibold">
                    School Name
                  </Label>
                  <Input
                    {...form.register(`education.${index}.school`)}
                    placeholder="Georgia Tech"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-600 font-semibold">
                    Degree / Field of Study
                  </Label>
                  <Input
                    {...form.register(`education.${index}.degree`)}
                    placeholder="B.S. Electrical Engineering"
                  />
                </div>
              </div>

              {/* Education Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-medium">
                    Start Date
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      onValueChange={(val) =>
                        form.setValue(`education.${index}.startMonth`, val)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((m) => (
                          <SelectItem key={m} value={m.toLowerCase()}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      onValueChange={(val) =>
                        form.setValue(`education.${index}.startYear`, val)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((y) => (
                          <SelectItem key={y} value={y}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-medium">
                    Graduation Date
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      onValueChange={(val) =>
                        form.setValue(`education.${index}.endMonth`, val)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((m) => (
                          <SelectItem key={m} value={m.toLowerCase()}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      onValueChange={(val) =>
                        form.setValue(`education.${index}.endYear`, val)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((y) => (
                          <SelectItem key={y} value={y}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* SECTION: CERTIFICATIONS */}
      <Card className="border-2 border-slate-100 shadow-sm">
        <CardHeader className="bg-slate-50/50 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="w-5 h-5 text-amber-500" /> Licenses &
            Certifications
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendCert({ name: "", issuer: "" })}
          >
            <Plus className="w-4 h-4 mr-1" /> Add Certification
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {certFields.map((field, index) => (
            <div
              key={field.id}
              className="p-4 border rounded-lg bg-white space-y-4 relative group hover:border-amber-200 transition-colors"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeCert(index)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  {...form.register(`certifications.${index}.name`)}
                  placeholder="Certification Name (e.g. PMP)"
                />
                <Input
                  {...form.register(`certifications.${index}.issuer`)}
                  placeholder="Issuing Organization"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* SECTION: HOBBIES & INTERESTS */}
      <Card className="border-2 border-slate-100 shadow-sm">
        <CardHeader className="bg-slate-50/50">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="w-5 h-5 text-pink-500" /> Hobbies & Interesting
            Facts
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Help the AI humanize your persona. Share things that wouldn't
            necessarily be on a resume.
          </p>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-blue-600 font-semibold italic">
              What makes you, you?
            </Label>
            <Textarea
              {...form.register("hobbies")}
              placeholder="e.g., I'm a Georgia Tech alum who enjoys restoring vintage electronics and mentoring first-time founders..."
              className="min-h-[120px] bg-white border-slate-200"
            />
          </div>
          <div className="flex items-start gap-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <Info className="w-4 h-4 text-blue-500 mt-0.5" />
            <p className="text-xs text-blue-700">
              Note: This data is used by the Virtual Agent to build rapport
              during practice interviews.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
