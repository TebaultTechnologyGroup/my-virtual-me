import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@aws-amplify/auth";
import { supabase } from "@/lib/supabase-client";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  Award,
  Plus,
  Trash2,
  Loader2,
  Save,
} from "lucide-react";
import {
  educationSchema,
  certificationSchema,
  type CertificationFormValues,
  type EducationFormValues,
} from "@/lib/validations/setup";
import { Checkbox } from "@/components/ui/checkbox";

export function CredentialsPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /// Form setup for Education
  const eduform = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      education: [
        {
          school: "",
          degree: "",
          startMonth: "",
          startYear: "",
          endMonth: "",
          endYear: "",
          isCurrent: false,
          gpa: "",
          clubs: "",
        },
      ],
    },
  });

  const {
    fields: eduFields,
    append: appendEdu,
    remove: removeEdu,
  } = useFieldArray({
    control: eduform.control,
    name: "education",
  });

  /// Form setup for Certifications
  const certform = useForm<CertificationFormValues>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      certifications: [{ name: "", issuer: "", issueDate: "", url: "" }],
    },
  });

  const {
    fields: certFields,
    append: appendCert,
    remove: removeCert,
  } = useFieldArray({
    control: certform.control,
    name: "certifications",
  });

  const MONTHS = [
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
  const YEARS = Array.from({ length: 60 }, (_, i) =>
    (new Date().getFullYear() - i).toString(),
  );

  async function fetchEducation() {
    try {
      const user = await getCurrentUser();
      const { data, error } = await supabase
        .from("education")
        .select(
          "school, degree, start_month, start_year, end_month, end_year, is_current, gpa, clubs",
        )
        .eq("user_id", user.userId);

      if (error) throw error;
      if (data && data.length > 0) {
        const mappedEducation = data.map((e) => ({
          ...e,
          startMonth: e.start_month,
          startYear: e.start_year,
          endMonth: e.end_month,
          endYear: e.end_year,
          isCurrent: e.is_current,
        }));

        eduform.reset({ education: mappedEducation });
      }
    } catch (error) {
      console.error("Load Education Failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCertifications() {
    try {
      const user = await getCurrentUser();
      const { data, error } = await supabase
        .from("certifications")
        .select("name, issuer, issue_date, url")
        .eq("user_id", user.userId);

      if (error) throw error;
      if (data && data.length > 0) {
        certform.reset({ certifications: data });
      }
    } catch (error) {
      console.error("Load Certifications Failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchEducation();
    fetchCertifications();
  }, [eduform, certform]);

  const onSubmitEducation = async (values: EducationFormValues) => {
    setIsSubmitting(true);
    try {
      const user = await getCurrentUser();

      // get existing job IDs from DB
      const { data: existingEducation } = await supabase
        .from("education")
        .select("id")
        .eq("user_id", user.userId);

      // Find IDs that are in the DB and NOT in the form (deleted entries)
      const existingIds = existingEducation?.map((e) => e.id) || [];
      const formIds = values.education.map((e) => e.id).filter(Boolean);

      // Find IDs that are in the DB but NOT in the form
      const idsToDelete = existingIds.filter((id) => !formIds.includes(id));

      // Delete removed entries
      if (idsToDelete.length > 0) {
        await supabase.from("education").delete().in("id", idsToDelete);
      }

      // now upsert the form entries (new and existing)
      const eduToUpsert = values.education.map((e) => ({
        ...(e.id ? { id: e.id } : {}),
        user_id: user.userId,
        school: e.school,
        degree: e.degree,
        start_month: e.startMonth,
        start_year: e.startYear,
        end_month: e.isCurrent ? null : e.endMonth,
        end_year: e.isCurrent ? null : e.endYear,
        is_current: e.isCurrent,
        gpa: e.gpa,
        clubs: e.clubs,
      }));

      const { error: upsertError } = await supabase
        .from("education")
        .upsert(eduToUpsert, {
          onConflict: "id",
          ignoreDuplicates: false,
        });

      if (upsertError) throw upsertError;

      toast.success("Education synchronized");

      await fetchEducation();
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Save failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitCertifications = async (values: CertificationFormValues) => {
    setIsSubmitting(true);
    try {
      const user = await getCurrentUser();

      // get existing job IDs from DB
      const { data: existingCertifications } = await supabase
        .from("certifications")
        .select("id")
        .eq("user_id", user.userId);

      // Find IDs that are in the DB and NOT in the form (deleted entries)
      const existingIds = existingCertifications?.map((e) => e.id) || [];
      const formIds = values.certifications.map((e) => e.id).filter(Boolean);

      // Find IDs that are in the DB but NOT in the form
      const idsToDelete = existingIds.filter((id) => !formIds.includes(id));

      // Delete removed entries
      if (idsToDelete.length > 0) {
        await supabase.from("certifications").delete().in("id", idsToDelete);
      }

      // now upsert the form entries (new and existing)
      const certToUpsert = values.certifications.map((e) => ({
        ...(e.id ? { id: e.id } : {}),
        user_id: user.userId,
        name: e.name,
        issuer: e.issuer,
        issue_date: e.issueDate,
        url: e.url,
      }));

      const { error: upsertError } = await supabase
        .from("certifications")
        .upsert(certToUpsert, {
          onConflict: "id",
          ignoreDuplicates: false,
        });

      if (upsertError) throw upsertError;

      toast.success("Certifications synchronized");

      await fetchCertifications();
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Save failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="space-y-8">
      {/* SECTION: EDUCATION */}
      <Card className="border-2 border-slate-100 shadow-sm">
        <CardHeader className="bg-slate-50/50 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="w-5 h-5 text-emerald-600" />{" "}
            <Link to="/app/setup">Setup</Link> -&gt; Education
          </CardTitle>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendEdu({
                school: "",
                degree: "",
                startMonth: "",
                startYear: "",
                endMonth: "",
                endYear: "",
                isCurrent: false,
                gpa: "",
                clubs: "",
              })
            }
          >
            <Plus className="w-4 h-4 mr-1" /> Add Education
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <form
            id="education-form"
            onSubmit={eduform.handleSubmit(onSubmitEducation)}
            className="space-y-6"
          >
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
                  <Controller
                    name={`education.${index}.school`}
                    control={eduform.control}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel>School Name</FieldLabel>
                        <FieldGroup>
                          <Input
                            {...field}
                            placeholder="Georgia Institute of Technology"
                          />
                        </FieldGroup>
                        {fieldState.error && (
                          <FieldError>{fieldState.error.message}</FieldError>
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name={`education.${index}.degree`}
                    control={eduform.control}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel>Degree / Field of Study</FieldLabel>
                        <FieldGroup>
                          <Input
                            {...field}
                            placeholder="B.S. Electrical Engineering"
                          />
                        </FieldGroup>
                        {fieldState.error && (
                          <FieldError>{fieldState.error.message}</FieldError>
                        )}
                      </Field>
                    )}
                  />
                </div>

                {/* Education Dates */}
                <div className="p-4 bg-slate-50 rounded-lg border space-y-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`curr-${index}`}
                      checked={eduform.watch(`education.${index}.isCurrent`)}
                      onCheckedChange={(val) =>
                        eduform.setValue(`education.${index}.isCurrent`, !!val)
                      }
                    />
                    <Label htmlFor={`curr-${index}`}>
                      I'm currently pursuing this degree
                    </Label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Start Date</FieldLabel>
                      <div className="flex gap-2">
                        <DateSelect
                          form={eduform}
                          name={`education.${index}.startMonth`}
                          items={MONTHS}
                          placeholder="Month"
                        />
                        <DateSelect
                          form={eduform}
                          name={`education.${index}.startYear`}
                          items={YEARS}
                          placeholder="Year"
                        />
                      </div>
                    </Field>

                    {!eduform.watch(`education.${index}.isCurrent`) && (
                      <Field>
                        <FieldLabel>End Date</FieldLabel>
                        <div className="flex gap-2">
                          <DateSelect
                            form={eduform}
                            name={`education.${index}.endMonth`}
                            items={MONTHS}
                            placeholder="Month"
                          />
                          <DateSelect
                            form={eduform}
                            name={`education.${index}.endYear`}
                            items={YEARS}
                            placeholder="Year"
                          />
                        </div>
                      </Field>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </form>
        </CardContent>
        <CardFooter className="bg-slate-50/50">
          <Button
            variant="ghost"
            className="w-32"
            onClick={() => navigate("/app/setup")}
          >
            Back to Setup
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            form="education-form"
            className="bg-emerald-600 hover:bg-emerald-700 min-w-37.5"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Education
          </Button>
        </CardFooter>
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
          <form
            id="certifications-form"
            onSubmit={certform.handleSubmit(onSubmitCertifications)}
            className="space-y-6"
          >
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
                  <Controller
                    name={`certifications.${index}.name`}
                    control={certform.control}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel>Certification Name</FieldLabel>
                        <FieldGroup>
                          <Input
                            {...field}
                            placeholder="Certification Name (e.g. PMP)"
                          />
                        </FieldGroup>
                        {fieldState.error && (
                          <FieldError>{fieldState.error.message}</FieldError>
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name={`certifications.${index}.issuer`}
                    control={certform.control}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel>Issuing Organization</FieldLabel>
                        <FieldGroup>
                          <Input
                            {...field}
                            placeholder="Issuing Organization"
                          />
                        </FieldGroup>
                        {fieldState.error && (
                          <FieldError>{fieldState.error.message}</FieldError>
                        )}
                      </Field>
                    )}
                  />
                </div>
              </div>
            ))}
          </form>
        </CardContent>
        <CardFooter className="bg-slate-50/50">
          <Button
            variant="ghost"
            className="w-32"
            onClick={() => navigate("/app/setup")}
          >
            Back to Setup
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            form="certifications-form"
            className="bg-emerald-600 hover:bg-emerald-700 min-w-37.5"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Certifications
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function DateSelect({
  form,
  name,
  items,
  placeholder,
}: {
  form: any;
  name: string;
  items: string[];
  placeholder: string;
}) {
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field }) => (
        <Select onValueChange={field.onChange} value={field.value || ""}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {items.map((i) => (
              <SelectItem key={i} value={i.toLowerCase()}>
                {i}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}
