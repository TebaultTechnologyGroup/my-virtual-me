import * as React from "react";
import { X, Check, ChevronsUpDown, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Example of the "Top 500" seed data structure
const SKILL_DATABASE = [
  { value: "react", label: "React" },
  { value: "aws", label: "AWS" },
  { value: "rag", label: "RAG (Retrieval-Augmented Generation)" },
  { value: "pmp", label: "PMP" },
  { value: "gtm-strategy", label: "GTM Strategy" },
  { value: "python", label: "Python" },
  { value: "p-l-management", label: "P&L Management" },
  // ... imagine 493 more here
];

export function SkillsStep({ form }: { form: any }) {
  const [open, setOpen] = React.useState(false);
  const selectedSkills = form.watch("skills") || [];

  const handleUnselect = (skillValue: string) => {
    const updated = selectedSkills.filter((s: string) => s !== skillValue);
    form.setValue("skills", updated);
  };

  const handleSelect = (skillValue: string) => {
    if (!selectedSkills.includes(skillValue)) {
      form.setValue("skills", [...selectedSkills, skillValue]);
    }
    setOpen(false);
  };

  return (
    <Card className="border-2 border-slate-100 shadow-sm">
      <CardHeader className="bg-slate-50/50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wrench className="w-5 h-5 text-blue-600" /> Professional Skills
          Inventory
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Select from our database to improve recruiter discoverability.
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {/* The "Pills" Area */}
        <div className="flex flex-wrap gap-2 min-h-10 p-2 rounded-md border border-dashed border-slate-200">
          {selectedSkills.length === 0 && (
            <span className="text-sm text-slate-400 italic">
              No skills selected yet...
            </span>
          )}
          {selectedSkills.map((skillValue: string) => {
            const skill = SKILL_DATABASE.find((s) => s.value === skillValue);
            return (
              <Badge
                key={skillValue}
                variant="secondary"
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
              >
                {skill?.label || skillValue}
                <button
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUnselect(skillValue);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(skillValue)}
                >
                  <X className="h-3 w-3 text-blue-400 hover:text-blue-600" />
                </button>
              </Badge>
            );
          })}
        </div>

        {/* The Search Trigger */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              Search or add a skill...
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-100 p-0">
            <Command>
              <CommandInput placeholder="Type to search (e.g. AI, GTM, React)..." />
              <CommandList>
                <CommandEmpty>
                  No skill found. Press 'Enter' to add as custom.
                </CommandEmpty>
                <CommandGroup className="max-h-64 overflow-auto">
                  {SKILL_DATABASE.map((skill) => (
                    <CommandItem
                      key={skill.value}
                      onSelect={() => handleSelect(skill.value)}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${selectedSkills.includes(skill.value) ? "opacity-100" : "opacity-0"}`}
                      />
                      {skill.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </CardContent>
    </Card>
  );
}
