import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getCurrentUser } from "@aws-amplify/auth";
import { supabase } from "@/lib/supabase-client";
import { pillarSchema, type PillarFormValues } from "@/lib/validations/setup";
import { toast } from "sonner";
import {
  BriefcaseBusiness,
  Plus,
  Trash2,
  Info,
  Loader2,
  Save,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Link, useNavigate } from "react-router-dom";

const MAX_PILLARS = 9;

export default function SummaryPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<PillarFormValues>({
    resolver: zodResolver(pillarSchema),
    defaultValues: {
      pillars: [{ title: "", content: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "pillars",
  });

  useEffect(() => {
    const fetchPillars = async () => {
      try {
        const user = await getCurrentUser();
        const { data, error } = await supabase
          .from("professional_summaries")
          .select("title, content")
          .eq("user_id", user.userId);

        if (error) throw error;

        if (data && data.length > 0) {
          form.reset({ pillars: data });
        }
      } catch (error) {
        console.error("Load failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPillars();
  }, [form.reset]);

  const onSubmit = async (values: PillarFormValues) => {
    setIsSubmitting(true);
    try {
      const user = await getCurrentUser();

      // Delete existing and re-insert for sync
      const { error: deleteError } = await supabase
        .from("professional_summaries")
        .delete()
        .eq("id", user.userId);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from("professional_summaries")
        .insert(
          values.pillars.map((p) => ({
            user_id: user.userId,
            title: p.title,
            content: p.content,
          })),
        );

      if (insertError) throw insertError;

      toast.success("Professional summaries updated successfully");
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Could not save changes");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <form
      id="summary-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <Card className="border-2 border-slate-100 shadow-sm">
        <CardHeader className="bg-slate-50/50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BriefcaseBusiness className="w-5 h-5 text-blue-600" />{" "}
              <Link to="/app/setup">Setup</Link> -&gt; Professional Summary
              Inventory
            </CardTitle>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 min-w-37.5"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Professional Summaries
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Create specific summaries for each target role. The AI agent will
            select the best match for each application.
          </p>
        </CardHeader>

        <CardContent className="space-y-8 pt-6">
          {fields.map((item, index) => (
            <div
              key={item.id}
              className="relative p-6 rounded-xl border-2 border-slate-100 bg-slate-50/30 space-y-6 transition-all hover:border-blue-100"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Controller
                    name={`pillars.${index}.title`}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel className="text-blue-600 font-bold">
                          Summary {index + 1}: Title
                        </FieldLabel>
                        <FieldGroup>
                          <Input
                            {...field}
                            placeholder="e.g., AI & Digital Transformation Leader"
                            className="bg-white"
                          />
                        </FieldGroup>
                        {fieldState.error && (
                          <FieldError>{fieldState.error.message}</FieldError>
                        )}
                      </Field>
                    )}
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

              <Controller
                name={`pillars.${index}.content`}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <div className="flex justify-between items-center mb-1">
                      <FieldLabel className="text-blue-600 font-bold">
                        Professional Summary
                      </FieldLabel>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Target: ~500 characters
                      </span>
                    </div>
                    <FieldGroup>
                      <Textarea
                        {...field}
                        placeholder="Strategic leader with 20+ years experience..."
                        className="min-h-32 bg-white resize-none leading-relaxed"
                      />
                    </FieldGroup>
                    {fieldState.error && (
                      <FieldError>{fieldState.error.message}</FieldError>
                    )}
                  </Field>
                )}
              />
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
              Add Professional Summary
            </Button>
          ) : (
            <div className="flex items-center justify-center p-4 rounded-lg bg-amber-50 text-amber-700 text-sm border border-amber-100">
              <Info className="w-4 h-4 mr-2" />
              Maximum of {MAX_PILLARS} summaries reached.
            </div>
          )}
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
            form="summary-form"
            className="bg-emerald-600 hover:bg-emerald-700 min-w-37.5"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Professional Summaries
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
