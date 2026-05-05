import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getCurrentUser } from "@aws-amplify/auth";
import { supabase } from "@/lib/supabase-client";
import { jobSchema, type JobFormValues } from "@/lib/validations/setup";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Loader2,
  Save,
  Briefcase,
  Target,
  Trophy,
  Link,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function JobHistoryPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      jobs: [
        {
          company: "",
          location: "",
          title: "",
          description: "",
          startMonth: "",
          startYear: "",
          isCurrent: false,
          accomplishments: [""],
          awards: [""],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "jobs",
  });

  async function fetchJobs() {
    try {
      const user = await getCurrentUser();
      const { data, error } = await supabase
        .from("job_history")
        .select(
          "company, location, title, description, start_month, start_year, end_month, end_year, is_current, accomplishments, awards",
        )
        .eq("user_id", user.userId);

      if (error) throw error;
      if (data && data.length > 0) {
        const mappedJobs = data.map((job) => ({
          ...job,
          startMonth: job.start_month,
          startYear: job.start_year,
          endMonth: job.end_month,
          endYear: job.end_year,
          isCurrent: job.is_current,
        }));

        form.reset({ jobs: mappedJobs });
      }
    } catch (error) {
      console.error("Load failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, [form]);

  const onSubmit = async (values: JobFormValues) => {
    setIsSubmitting(true);
    try {
      const user = await getCurrentUser();

      // get existing job IDs from DB
      const { data: existingJobs } = await supabase
        .from("job_history")
        .select("id")
        .eq("user_id", user.userId);

      // Find IDs that are in the DB and NOT in the form (deleted entries)
      const existingIds = existingJobs?.map((j) => j.id) || [];
      const formIds = values.jobs.map((j) => j.id).filter(Boolean);

      // Find IDs that are in the DB but NOT in the form
      const idsToDelete = existingIds.filter((id) => !formIds.includes(id));

      // Delete removed entries
      if (idsToDelete.length > 0) {
        await supabase.from("job_history").delete().in("id", idsToDelete);
      }

      // now upsert the form entries (new and existing)
      const jobsToUpsert = values.jobs.map((job) => ({
        ...(job.id ? { id: job.id } : {}),
        user_id: user.userId,
        company: job.company,
        location: job.location,
        title: job.title,
        description: job.description,
        start_month: job.startMonth,
        start_year: job.startYear,
        end_month: job.isCurrent ? null : job.endMonth,
        end_year: job.isCurrent ? null : job.endYear,
        is_current: job.isCurrent,
        accomplishments: job.accomplishments,
        awards: job.awards,
      }));

      const { error: upsertError } = await supabase
        .from("job_history")
        .upsert(jobsToUpsert, {
          onConflict: "id",
          ignoreDuplicates: false,
        });

      if (upsertError) throw upsertError;

      toast.success("Job history synchronized");

      await fetchJobs();
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Save failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ErrorSummary = () => {
    const { errors } = form.formState;
    const errorKeys = Object.keys(errors);

    if (errorKeys.length === 0) return null;

    return (
      <div className="p-4 mb-6 border rounded-lg bg-destructive/10 text-destructive border-destructive/20">
        <p className="font-bold">Please correct the following before saving:</p>
        <ul className="list-disc list-inside text-sm">
          {errorKeys.map((key: string) => (
            <li>
              {errors[key as keyof typeof errors]?.message ||
                `Invalid entry in one of the fields ${key}.`}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin" />
      </div>
    );
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <form
        id="job-history-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <Card className="border-2">
          <CardHeader className="bg-slate-50/50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />{" "}
                <Link to="/app/setup">Setup</Link> -&gt; Job History
              </CardTitle>
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save History
            </Button>
          </CardHeader>

          <CardContent className="p-6">
            <Accordion type="single" collapsible className="space-y-4 mb-6">
              {fields.map((field, index) => (
                <AccordionItem
                  key={field.id}
                  value={field.id}
                  className="border rounded-xl px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-4 text-left">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold">
                          {form.watch(`jobs.${index}.title`) || "Position"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {form.watch(`jobs.${index}.company`) || "Company"}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="space-y-6 pt-4 pb-4">
                    {/* Company & Location Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Controller
                        name={`jobs.${index}.company`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field>
                            <FieldLabel>Company Name</FieldLabel>
                            <FieldGroup>
                              <Input {...field} placeholder="Motorola" />
                            </FieldGroup>
                            {fieldState.error && (
                              <FieldError>
                                {fieldState.error.message}
                              </FieldError>
                            )}
                          </Field>
                        )}
                      />
                      <Controller
                        name={`jobs.${index}.location`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field>
                            <FieldLabel>Location</FieldLabel>
                            <FieldGroup>
                              <Input {...field} placeholder="Atlanta, GA" />
                            </FieldGroup>
                            {fieldState.error && (
                              <FieldError>
                                {fieldState.error.message}
                              </FieldError>
                            )}
                          </Field>
                        )}
                      />
                    </div>

                    <Controller
                      name={`jobs.${index}.title`}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field>
                          <FieldLabel>Job Title</FieldLabel>
                          <FieldGroup>
                            <Input {...field} placeholder="VP of Operations" />
                          </FieldGroup>
                          {fieldState.error && (
                            <FieldError>{fieldState.error.message}</FieldError>
                          )}
                        </Field>
                      )}
                    />

                    {/* Dates Section */}
                    <div className="p-4 bg-slate-50 rounded-lg border space-y-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`curr-${index}`}
                          checked={form.watch(`jobs.${index}.isCurrent`)}
                          onCheckedChange={(val) =>
                            form.setValue(`jobs.${index}.isCurrent`, !!val)
                          }
                        />
                        <Label htmlFor={`curr-${index}`}>
                          I currently work here
                        </Label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field>
                          <FieldLabel>Start Date</FieldLabel>
                          <div className="flex gap-2">
                            <DateSelect
                              form={form}
                              name={`jobs.${index}.startMonth`}
                              items={MONTHS}
                              placeholder="Month"
                            />
                            <DateSelect
                              form={form}
                              name={`jobs.${index}.startYear`}
                              items={YEARS}
                              placeholder="Year"
                            />
                          </div>
                        </Field>

                        {!form.watch(`jobs.${index}.isCurrent`) && (
                          <Field>
                            <FieldLabel>End Date</FieldLabel>
                            <div className="flex gap-2">
                              <DateSelect
                                form={form}
                                name={`jobs.${index}.endMonth`}
                                items={MONTHS}
                                placeholder="Month"
                              />
                              <DateSelect
                                form={form}
                                name={`jobs.${index}.endYear`}
                                items={YEARS}
                                placeholder="Year"
                              />
                            </div>
                          </Field>
                        )}
                      </div>
                    </div>
                    <Controller
                      name={`jobs.${index}.description`}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field>
                          <FieldLabel>Description</FieldLabel>
                          <FieldGroup>
                            <Textarea
                              className="max-h-40 bg-white"
                              {...field}
                              placeholder="Core mission and scope. Keep this short. One or two sentences is sufficient. Focus on high-level overview of role, not day-to-day tasks."
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </FieldGroup>
                        </Field>
                      )}
                    />

                    <div className="space-y-4">
                      <Label className="text-blue-600 font-bold flex items-center gap-2">
                        <Target className="w-4 h-4" /> Accomplishments
                      </Label>
                      <div className="text-sm text-muted-foreground">
                        Focus on high-level Accomplishments and impact rather
                        than day-to-day tasks. What you achieved is more
                        important than what you did. 3-5 bullet points per
                        position is ideal.
                      </div>
                      <DynamicList
                        fieldName={`jobs.${index}.accomplishments`}
                        form={form}
                        placeholder="Scaled revenue..."
                      />
                    </div>

                    <div className="space-y-4">
                      <Label className="text-blue-600 font-bold flex items-center gap-2">
                        <Trophy className="w-4 h-4" /> Awards
                      </Label>
                      <DynamicList
                        fieldName={`jobs.${index}.awards`}
                        form={form}
                        placeholder="Excellence award..."
                      />
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                      <Button
                        variant="ghost"
                        className="text-red-600"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Remove Position
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <Button
              variant="outline"
              className="w-full border-dashed py-8"
              onClick={() =>
                append({
                  company: "",
                  location: "",
                  title: "",
                  description: "",
                  startMonth: "",
                  startYear: "",
                  isCurrent: false,
                  accomplishments: [""],
                  awards: [""],
                })
              }
            >
              <Plus className="mr-2" /> Add Job Position
            </Button>
          </CardContent>
          <CardFooter className="bg-slate-50/50">
            <ErrorSummary />
          </CardFooter>
        </Card>
      </form>
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

function DynamicList({
  fieldName,
  form,
  placeholder,
}: {
  fieldName: string;
  form: any;
  placeholder: string;
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: fieldName,
  });
  return (
    <div className="space-y-2">
      {fields.map((f, k) => (
        <div key={f.id} className="flex gap-2">
          <Input
            {...form.register(`${fieldName}.${k}`)}
            placeholder={placeholder}
            className="bg-white"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => remove(k)}
            disabled={fields.length === 1}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button
        variant="link"
        size="sm"
        onClick={() => append("")}
        className="px-0"
      >
        <Plus className="w-3 h-3 mr-1" /> Add Entry
      </Button>
    </div>
  );
}
