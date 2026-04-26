import { useFieldArray } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Plus,
  Trash2,
  Briefcase,
  MapPin,
  Trophy,
  Target,
  Calendar,
} from "lucide-react";

function JobHistoryStep({ form }: { form: any }) {
  const {
    fields: jobFields,
    append: appendJob,
    remove: removeJob,
  } = useFieldArray({
    control: form.control,
    name: "jobs",
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
    <div className="space-y-6">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">Professional History</CardTitle>
            <p className="text-sm text-muted-foreground">
              Detail your roles and achievements for AI-driven tailoring.
            </p>
          </div>
          <Button
            type="button"
            onClick={() =>
              appendJob({
                company: "",
                title: "",
                accomplishments: [""],
                awards: [""],
                isCurrent: false,
              })
            }
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Job
          </Button>
        </CardHeader>

        <CardContent className="px-0">
          <Accordion type="single" collapsible className="space-y-4">
            {jobFields.map((field, index) => (
              <AccordionItem
                key={field.id}
                value={field.id}
                className="border-2 border-slate-100 rounded-xl bg-white px-4 overflow-hidden"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-4 text-left">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        {form.watch(`jobs.${index}.title`) || "New Position"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {form.watch(`jobs.${index}.company`) ||
                          "Add Company Details"}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pt-4 pb-6 space-y-6">
                  {/* Company & Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-blue-600 font-semibold">
                        Company Name
                      </Label>
                      <Input
                        {...form.register(`jobs.${index}.company`)}
                        placeholder="e.g. Motorola"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-blue-600 font-semibold">
                        Location
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <Input
                          className="pl-10"
                          {...form.register(`jobs.${index}.location`)}
                          placeholder="Atlanta, GA"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-blue-600 font-semibold">
                      Job Title
                    </Label>
                    <Input
                      {...form.register(`jobs.${index}.title`)}
                      placeholder="Sr. Vice President"
                    />
                  </div>

                  {/* Dates Section */}
                  <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        id={`current-${index}`}
                        checked={form.watch(`jobs.${index}.isCurrent`)}
                        onCheckedChange={(checked) =>
                          form.setValue(`jobs.${index}.isCurrent`, checked)
                        }
                      />
                      <label
                        htmlFor={`current-${index}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I currently work here
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Start Date */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" /> Start Date
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            onValueChange={(val) =>
                              form.setValue(`jobs.${index}.startMonth`, val)
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
                              form.setValue(`jobs.${index}.startYear`, val)
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

                      {/* End Date */}
                      {!form.watch(`jobs.${index}.isCurrent`) && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                          <Label className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> End Date
                          </Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Select
                              onValueChange={(val) =>
                                form.setValue(`jobs.${index}.endMonth`, val)
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
                                form.setValue(`jobs.${index}.endYear`, val)
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
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-blue-600 font-semibold">
                      Job Description
                    </Label>
                    <Textarea
                      {...form.register(`jobs.${index}.description`)}
                      placeholder="Describe your core mission and scope..."
                      className="min-h-25"
                    />
                  </div>

                  {/* Accomplishments */}
                  <div className="space-y-3">
                    <Label className="text-blue-600 font-semibold flex items-center gap-2">
                      <Target className="w-4 h-4" /> Key Accomplishments
                    </Label>
                    <DynamicList
                      fieldName={`jobs.${index}.accomplishments`}
                      form={form}
                      placeholder="e.g. Scaled revenue by 26% YoY..."
                    />
                  </div>

                  {/* Awards - Now Unique Entries */}
                  <div className="space-y-3">
                    <Label className="text-blue-600 font-semibold flex items-center gap-2">
                      <Trophy className="w-4 h-4" /> Awards & Recognition
                    </Label>
                    <DynamicList
                      fieldName={`jobs.${index}.awards`}
                      form={form}
                      placeholder="e.g. Employee of the Year 2024"
                    />
                  </div>

                  <div className="pt-4 border-t flex justify-end">
                    <Button
                      variant="ghost"
                      className="text-destructive hover:bg-red-50"
                      onClick={() => removeJob(index)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Remove Position
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

/** * Reusable component for both Accomplishments and Awards
 */
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
      {fields.map((field, k) => (
        <div key={field.id} className="flex gap-2">
          <Input
            {...form.register(`${fieldName}.${k}`)}
            placeholder={placeholder}
            className="flex-1 bg-white"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(k)}
            disabled={fields.length === 1}
          >
            <Trash2 className="w-4 h-4 text-slate-400" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append("")}
        className="text-blue-600 border-blue-200 hover:bg-blue-50"
      >
        <Plus className="w-3 h-3 mr-2" /> Add Entry
      </Button>
    </div>
  );
}

export default JobHistoryStep;
