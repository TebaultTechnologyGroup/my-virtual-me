import * as z from "zod";

export const personalSchema = z.object({
    // Profile Section
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number is required"),
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().length(2, "Use 2-letter state code"),
    postalCode: z.string().min(5, "Invalid zip code"),
    linkedin: z.url("Must be a valid LinkedIn URL").optional().or(z.literal("")),
    hobbies: z.string().optional(),
    otherNotes: z.string().optional(),
});

export const pillarSchema = z.object({
    pillars: z.array(z.object({
        id: z.uuid().optional(),
        title: z.string().min(3, "Title required"),
        content: z.string().min(50, "Pillar content should be substantial (min 50 chars)"),
    })).max(9),
});

export const targetRoleSchema = z.object({
    targetRoles: z.array(z.object({
        id: z.uuid().optional(),
        role_title: z.string().min(3, "Role Title required"),
        prof_summary: z.string().min(50, "Professional summary should be substantial (min 20 chars)"),
    })).max(9),
});


export const jobSchema = z.object({
    // Job History (Relational)
    jobs: z.array(z.object({
        id: z.uuid().optional(),
        company: z.string().min(1, "Company name required"),
        location: z.string().min(1, "Location required"),
        title: z.string().min(1, "Job title required"),
        description: z.string().min(1, "Description required"),
        startMonth: z.string().min(1, "Start month required"),
        startYear: z.string().length(4, "Start year must be 4 digits"),
        endMonth: z.string().optional(),
        endYear: z.string().optional(),
        isCurrent: z.boolean().default(false).nonoptional(),
        accomplishments: z.array(z.string().optional()),
        awards: z.array(z.string().optional()),
    })
        .superRefine((data, ctx) => {
            if (!data.isCurrent) {
                if (!data.endMonth || data.endMonth.trim() === "") {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "End month is required if job is not current",
                        path: ["endMonth"],
                    });
                }
                if (!data.endYear || data.endYear.trim() === "") {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "End year is required if job is not current",
                        path: ["endYear"],
                    });
                }
            }
        }))
});


export const skillsSchema = z.object({
    skills: z.array(z.string()).min(1, "Select at least one skill"),
});

export const educationSchema = z.object({
    // Education
    education: z.array(z.object({
        id: z.uuid().optional(),
        school: z.string().min(1, "School name required"),
        degree: z.string().min(1, "Degree required"),
        startMonth: z.string(),
        startYear: z.string(),
        endMonth: z.string(),
        endYear: z.string(),
        isCurrent: z.boolean().default(false).nonoptional(),
        gpa: z.string().optional(),
        clubs: z.string().optional(),
    })),
});

export const certificationSchema = z.object({

    // Certifications
    certifications: z.array(z.object({
        id: z.uuid().optional(),
        name: z.string().min(1, "Certification name required"),
        issuer: z.string().min(1, "Issuing organization required"),
        issueDate: z.string().optional(),
        url: z.string().url().optional().or(z.literal("")),
    })),
});

// Interview Q&A (STAR Method)
// interviewQA: z.array(z.object({
//     question: z.string().min(5, "Question text required"),
//     situation: z.string().min(10, "Situation required"),
//     task: z.string().min(10, "Task required"),
//     action: z.string().min(20, "Action required"),
//     result: z.string().min(10, "Result required"),
// })),





// // Final Human Element
// hobbies: z.string().optional(),


export type PersonalFormValues = z.infer<typeof personalSchema>;
export type PillarFormValues = z.infer<typeof pillarSchema>;
export type TargetRoleFormValues = z.infer<typeof targetRoleSchema>;
export type JobFormValues = z.infer<typeof jobSchema>;
export type SkillsFormValues = z.infer<typeof skillsSchema>;
export type EducationFormValues = z.infer<typeof educationSchema>;
export type CertificationFormValues = z.infer<typeof certificationSchema>;