"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getCurrentUser } from "@aws-amplify/auth";
import { FolderPen, Heart, Loader2, NotepadText } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase-client";
import {
  personalSchema,
  type PersonalFormValues,
} from "@/lib/validations/setup";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Link, useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";

export default function PersonalPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PersonalFormValues>({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      linkedin: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.userId)
          .single();

        if (error) throw error;

        if (data) {
          form.reset({
            fullName: data.full_name || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            postalCode: data.postal_code || "",
            linkedin: data.linkedin_url || "",
            hobbies: data.hobbies || "",
            otherNotes: data.other_notes || "",
          });
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };

    fetchProfile();
  }, [form]);

  // Inside your component
  const onInvalid = (errors: any) => {
    console.error("Validation Errors:", errors);
  };

  const onSubmit = async (values: PersonalFormValues) => {
    setIsSubmitting(true);
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error("User not authenticated");

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.userId,
        full_name: values.fullName,
        email: values.email,
        phone: values.phone,
        address: values.address,
        city: values.city,
        state: values.state,
        postal_code: values.postalCode,
        linkedin_url: values.linkedin,
        hobbies: values.hobbies,
        other_notes: values.otherNotes,
      });

      if (profileError) throw profileError;

      toast.success("Profile saved");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to save.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Card className="border-2 border-slate-100 shadow-sm">
        <CardHeader className="bg-slate-50/50">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FolderPen className="w-5 h-5 text-blue-600" />
            <Link to="/app/setup">Setup</Link> -&gt; General Information
            Inventory
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter the information below as you want it to appear on your resume
            and virtual assistant.
          </p>
        </CardHeader>

        <CardContent className="pt-6">
          <form
            id="personal-info-form"
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          >
            <FieldGroup className="space-y-6">
              {/* Row 1: Full Name & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="fullName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                      <Input
                        {...field}
                        id="fullName"
                        placeholder="Mark Tebault"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="email">Email Address</FieldLabel>
                      <Input
                        {...field}
                        id="email"
                        type="email"
                        placeholder="mark@example.com"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              {/* Row 2: Phone & LinkedIn */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="phone"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                      <Input
                        {...field}
                        id="phone"
                        placeholder="404-555-0100"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="linkedin"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="linkedin">LinkedIn URL</FieldLabel>
                      <Input
                        {...field}
                        id="linkedin"
                        placeholder="https://linkedin.com/in/yourprofile"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              {/* Address */}
              <Controller
                name="address"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="address">Street Address</FieldLabel>
                    <Input
                      {...field}
                      id="address"
                      placeholder="123 Technology Way"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Row 3: City, State, Postal Code */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Controller
                  name="city"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="city">City</FieldLabel>
                      <Input
                        {...field}
                        id="city"
                        placeholder="Atlanta"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="state"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="state">State</FieldLabel>
                      <Input
                        {...field}
                        id="state"
                        placeholder="GA"
                        maxLength={2}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="postalCode"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="postalCode">Zip Code</FieldLabel>
                      <Input
                        {...field}
                        id="postalCode"
                        placeholder="30332"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="hobbies"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>
                        <Heart className="w-5 h-5 text-pink-500" /> Hobbies &
                        Interesting Facts
                      </FieldLabel>
                      <FieldGroup>
                        <Textarea
                          className="max-h-40 bg-white"
                          {...field}
                          placeholder="Help the AI humanize your persona. Share your hobbies, interests, fun facts, or anything else that would help your virtual assistant better understand you."
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </FieldGroup>
                    </Field>
                  )}
                />

                <Controller
                  name="otherNotes"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>
                        <NotepadText className="w-5 h-5 text-pink-500" /> Other
                        Notes
                      </FieldLabel>
                      <FieldGroup>
                        <Textarea
                          className="max-h-40 bg-white"
                          {...field}
                          placeholder="Any other information you'd like to share."
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </FieldGroup>
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>
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
            form="personal-info-form"
            disabled={isSubmitting}
            className="w-32"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
              </>
            ) : (
              "Save Profile"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
