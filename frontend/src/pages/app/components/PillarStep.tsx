import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useFieldArray } from "react-hook-form";
import { Plus, Trash2, Info } from "lucide-react";

function PillarsStep({ form }: { form: any }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "pillars",
  });

  const MAX_PILLARS = 9;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Professional Narrative Pillars</CardTitle>
              <p className="text-sm text-muted-foreground">
                You may want to apply for many different types of jobs. The
                Professional Narrative Pillars allow you to enter a professional
                profile for each type of job you are appying to. Define the
                high-impact personas the AI uses to tailor your resumes and
                answers. For example, you may have a Pillar for Sales, a Pillar
                for Marketing, a Pillar for Account Management, etc.
              </p>
            </div>
            <div className="text-sm font-medium px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
              {fields.length} / {MAX_PILLARS} Pillars
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="relative p-6 rounded-xl border-2 border-slate-100 bg-slate-50/30 space-y-4 transition-all hover:border-blue-100"
            >
              {/* Header: Title and Delete */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <Label className="text-blue-600 font-bold">
                    Pillar {index + 1}: Title
                  </Label>
                  <Input
                    {...form.register(`pillars.${index}.title`)}
                    placeholder="e.g., AI & Digital Transformation Leader"
                    className="bg-white"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-8 text-slate-400 hover:text-destructive"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>

              {/* High Impact Summary */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-blue-600 font-bold">
                    High-Impact Summary
                  </Label>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Target: ~500 characters
                  </span>
                </div>
                <Textarea
                  {...form.register(`pillars.${index}.content`)}
                  placeholder="Strategic leader with 20+ years of experience bridging the gap between..."
                  className="min-h-37.5 bg-white resize-none leading-relaxed"
                />
              </div>
            </div>
          ))}

          {fields.length < MAX_PILLARS ? (
            <Button
              type="button"
              variant="outline"
              className="w-full py-8 border-dashed border-2 hover:border-blue-500 hover:bg-blue-50 group transition-all"
              onClick={() => append({ title: "", content: "" })}
            >
              <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Add Narrative Pillar
            </Button>
          ) : (
            <div className="flex items-center justify-center p-4 rounded-lg bg-amber-50 text-amber-700 text-sm border border-amber-100">
              <Info className="w-4 h-4 mr-2" />
              You've reached the maximum of {MAX_PILLARS} pillars.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PillarsStep;
