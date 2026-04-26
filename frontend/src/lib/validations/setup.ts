import * as z from "zod";

// Helper for date selection validation
const dateSchema = z.object({
    month: z.string().min(1, "Required"),
    year: z.string().length(4, "Must be 4 digits"),
});

export const setupSchema = z.object({
    // Profile Section
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number is required"),
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().length(2, "Use 2-letter state code"),
    postalCode: z.string().min(5, "Invalid zip code"),
    linkedin: z.string().url("Must be a valid LinkedIn URL").optional().or(z.literal("")),

    // Narrative Pillars
    pillars: z.array(z.object({
        title: z.string().min(3, "Title required"),
        content: z.string().min(50, "Pillar content should be substantial (min 50 chars)"),
    })).max(9),

    // Job History (Relational)
    jobs: z.array(z.object({
        company: z.string().min(1, "Company name required"),
        location: z.string().min(1, "Location required"),
        title: z.string().min(2, "Job title required"),
        description: z.string().min(10, "Description required"),
        startMonth: z.string(),
        startYear: z.string(),
        endMonth: z.string().optional(),
        endYear: z.string().optional(),
        isCurrent: z.boolean().default(false).nonoptional(),
        accomplishments: z.array(z.string().min(1, "Accomplishment cannot be empty")),
        awards: z.array(z.string()),
    })),

    // Skills (Array of values from SKILL_DATABASE)
    skills: z.array(z.string()).min(1, "Select at least one skill"),

    // Education
    education: z.array(z.object({
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

    // Certifications
    certifications: z.array(z.object({
        name: z.string().min(1, "Certification name required"),
        issuer: z.string().min(1, "Issuing organization required"),
        issueDate: z.string().optional(),
        url: z.string().url().optional().or(z.literal("")),
    })),

    // Interview Q&A (STAR Method)
    interviewQA: z.array(z.object({
        question: z.string().min(5, "Question text required"),
        situation: z.string().min(10, "Situation required"),
        task: z.string().min(10, "Task required"),
        action: z.string().min(20, "Action required"),
        result: z.string().min(10, "Result required"),
    })),

    // Final Human Element
    hobbies: z.string().optional(),
});

export type SetupFormValues = z.infer<typeof setupSchema>;