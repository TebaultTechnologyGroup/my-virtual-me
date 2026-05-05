import {
  X,
  Check,
  ChevronsUpDown,
  Wrench,
  Loader2,
  Save,
  Link,
} from "lucide-react";
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
import { useEffect, useState } from "react";
import { getCurrentUser } from "@aws-amplify/auth";
import { supabase } from "@/lib/supabase-client";
import { toast } from "sonner";

export default function SkillsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    async function loadAllData() {
      setIsLoading(true);
      try {
        const user = await getCurrentUser();

        // Run these in parallel for efficiency
        const [masterRes, userRes] = await Promise.all([
          supabase.from("skills").select("*"),
          supabase
            .from("user_skills")
            .select("skill")
            .eq("user_id", user.userId),
        ]);

        if (masterRes.data) {
          setAllSkills(masterRes.data.map((s) => s.skill));
        }

        if (userRes.data) {
          setSelectedSkills(userRes.data.map((s) => s.skill));
        }
      } catch (error) {
        console.error("Data sync failed:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAllData();
  }, []); // Empty dependency array ensures this only runs once on mount

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const user = await getCurrentUser();

      // 1. Identify any "New" skills not in the master list
      const newSkills = selectedSkills.filter((s) => !allSkills.includes(s));

      if (newSkills.length > 0) {
        await supabase
          .from("skills")
          .insert(newSkills.map((s) => ({ skill: s })));

        // Update local master list to avoid re-adding
        setAllSkills((prev) => [...prev, ...newSkills]);
      }

      // 2. Sync User Skills (Nuclear Sync is safer for simple tag lists)
      await supabase.from("user_skills").delete().eq("user_id", user.userId);

      const { error } = await supabase.from("user_skills").insert(
        selectedSkills.map((s) => ({
          user_id: user.userId,
          skill: s,
        })),
      );

      if (error) throw error;
      toast.success("Skills inventory updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save skills");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelect = (skill: string) => {
    const normalized = skill.trim();
    if (normalized && !selectedSkills.includes(normalized)) {
      setSelectedSkills((prev) => [...prev, normalized]);
    }
    setInputValue("");
    setOpen(false);
  };

  const handleUnselect = (skill: string) => {
    setSelectedSkills((prev) => prev.filter((s) => s !== skill));
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <Card className="border-2 shadow-sm">
      <CardHeader className="bg-slate-50/50 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wrench className="w-5 h-5 text-blue-600" />{" "}
            <Link to="/app/setup">Setup</Link> -&gt; Skills Inventory
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Add skills to ground your AI agent in your technical expertise.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Skills
        </Button>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        {/* The Pills Area */}
        <div className="flex flex-wrap gap-2 min-h-12 p-3 rounded-lg border border-dashed bg-slate-50/30">
          {selectedSkills.length === 0 && (
            <span className="text-sm text-slate-400 italic">
              No skills selected...
            </span>
          )}
          {selectedSkills.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="pl-3 pr-1 py-1 bg-white border-slate-200 text-slate-700 gap-1 shadow-sm"
            >
              {skill}
              <button
                onClick={() => handleUnselect(skill)}
                className="hover:bg-slate-100 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3 text-slate-400 hover:text-red-500" />
              </button>
            </Badge>
          ))}
        </div>

        {/* The Search & Add Trigger */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between bg-white text-muted-foreground"
            >
              {inputValue || "Search database or type new skill..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-100 p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Search skills..."
                value={inputValue}
                onValueChange={setInputValue}
              />
              <CommandList>
                <CommandEmpty className="p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-blue-600"
                    onClick={() => handleSelect(inputValue)}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add "{inputValue}" as new
                    skill
                  </Button>
                </CommandEmpty>
                <CommandGroup
                  heading="Available Skills"
                  className="max-h-64 overflow-auto"
                >
                  {allSkills
                    .filter((s) => !selectedSkills.includes(s))
                    .map((skill) => (
                      <CommandItem
                        key={skill}
                        onSelect={() => handleSelect(skill)}
                      >
                        <Check className="mr-2 h-4 w-4 opacity-0" />
                        {skill}
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

function Plus({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
