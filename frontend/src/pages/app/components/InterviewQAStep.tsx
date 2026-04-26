import { useFieldArray } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Plus,
  Trash2,
  MessageSquare,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";

function InterviewQAStep({ form }: { form: any }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "interviewQA",
  });

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">Interview Preparation</CardTitle>
            <p className="text-sm text-muted-foreground">
              Define your core stories. Use the STAR method to ensure your
              impact is clear.
            </p>
          </div>
          <Button
            type="button"
            onClick={() =>
              append({
                question: "",
                situation: "",
                task: "",
                action: "",
                result: "",
              })
            }
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Question
          </Button>
        </CardHeader>

        <CardContent className="px-0">
          <Accordion type="single" collapsible className="space-y-4">
            {fields.map((field, index) => (
              <AccordionItem
                key={field.id}
                value={field.id}
                className="border-2 border-slate-100 rounded-xl bg-white px-4 overflow-hidden"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-4 text-left">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 pr-4">
                      <p className="font-bold text-slate-900 line-clamp-1">
                        {form.watch(`interviewQA.${index}.question`) ||
                          "New Interview Question"}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                        Status:{" "}
                        {form.watch(`interviewQA.${index}.result`)
                          ? "Drafted"
                          : "Incomplete"}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pt-4 pb-6 space-y-6">
                  {/* The Question */}
                  <div className="space-y-2">
                    <Label className="text-blue-600 font-semibold">
                      The Question
                    </Label>
                    <Textarea
                      {...form.register(`interviewQA.${index}.question`)}
                      placeholder="e.g., Tell me about a time you managed a difficult stakeholder."
                      className="min-h-15 bg-slate-50 border-none italic"
                    />
                  </div>

                  {/* STAR Method Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-slate-700">
                        <div className="w-5 h-5 rounded-full bg-slate-100 text-[10px] flex items-center justify-center font-bold">
                          S
                        </div>
                        Situation
                      </Label>
                      <Textarea
                        {...form.register(`interviewQA.${index}.situation`)}
                        placeholder="What was the context?"
                        className="min-h-25"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-slate-700">
                        <div className="w-5 h-5 rounded-full bg-slate-100 text-[10px] flex items-center justify-center font-bold">
                          T
                        </div>
                        Task
                      </Label>
                      <Textarea
                        {...form.register(`interviewQA.${index}.task`)}
                        placeholder="What was your specific responsibility?"
                        className="min-h-25"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-blue-600">
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-[10px] flex items-center justify-center font-bold">
                          A
                        </div>
                        Action
                      </Label>
                      <Textarea
                        {...form.register(`interviewQA.${index}.action`)}
                        placeholder="What steps did you take?"
                        className="min-h-25 border-blue-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-emerald-600">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-[10px] flex items-center justify-center font-bold">
                          R
                        </div>
                        Result
                      </Label>
                      <Textarea
                        {...form.register(`interviewQA.${index}.result`)}
                        placeholder="What was the outcome? (Use metrics)"
                        className="min-h-25 border-emerald-100"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        <Lightbulb className="w-3 h-3 mr-1" /> View Example
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      className="text-destructive hover:bg-red-50"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Remove Story
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

export default InterviewQAStep;
