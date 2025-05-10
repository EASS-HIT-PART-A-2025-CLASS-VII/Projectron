"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { TechStackSelector } from "./tech-stack-selector";
import { TimeScale, PlanGenerationInput } from "../types";

// Define form validation schema
const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Project name must be at least 3 characters" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  experience_level: z.enum(["student", "junior", "mid", "senior"], {
    required_error: "Please select an experience level",
  }),
  team_size: z.coerce.number().int().min(1).max(10),
  time_scale: z.enum(["small", "medium", "large", "custom"], {
    required_error: "Please select a time scale",
  }),
  custom_hours: z.coerce.number().int().min(1).max(1000).optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface PlanGenerationFormProps {
  onSubmit: (data: PlanGenerationInput) => void;
  isLoading: boolean;
}

export function PlanGenerationForm({
  onSubmit,
  isLoading,
}: PlanGenerationFormProps) {
  const [techStack, setTechStack] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      experience_level: "mid",
      team_size: 1,
      time_scale: "medium",
      custom_hours: null,
    },
  });

  const timeScale = watch("time_scale");
  const showCustomHours = timeScale === "custom";

  // Make sure custom_hours is required when time_scale is custom
  useEffect(() => {
    if (timeScale === "custom") {
      setValue("custom_hours", 100); // Set default value
    } else {
      setValue("custom_hours", null);
    }
  }, [timeScale, setValue]);

  const handleFormSubmit = (data: FormValues) => {
    // Convert form time_scale string to TimeScale enum
    const mappedTimeScale: TimeScale = data.time_scale as unknown as TimeScale;

    const formData: PlanGenerationInput = {
      ...data,
      time_scale: mappedTimeScale,
      tech_stack: techStack,
    };

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Project Details</h2>

      <div className="space-y-5">
        <div>
          <Label htmlFor="name">Project Name</Label>
          <Input
            id="name"
            placeholder="e.g. E-commerce Website"
            {...register("name")}
            className="bg-primary-background mt-1.5"
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Project Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your project, its purpose, and key features..."
            className="bg-primary-background mt-1.5 min-h-[100px]"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-red-400 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <Label className="mb-3 block">Technology Stack</Label>
          <TechStackSelector selectedTech={techStack} onChange={setTechStack} />
        </div>

        <div>
          <Label className="mb-3 block">Experience Level</Label>
          <Controller
            name="experience_level"
            control={control}
            defaultValue="mid"
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="student" />
                  <Label
                    htmlFor="student"
                    className="cursor-pointer hover:text-primary-cta"
                  >
                    Student
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="junior" id="junior" />
                  <Label
                    htmlFor="junior"
                    className="cursor-pointer hover:text-primary-cta"
                  >
                    Junior
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mid" id="mid" />
                  <Label
                    htmlFor="mid"
                    className="cursor-pointer hover:text-primary-cta"
                  >
                    Mid-level
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="senior" id="senior" />
                  <Label
                    htmlFor="senior"
                    className="cursor-pointer hover:text-primary-cta"
                  >
                    Senior
                  </Label>
                </div>
              </RadioGroup>
            )}
          />
          {errors.experience_level && (
            <p className="text-red-400 text-sm mt-1">
              {errors.experience_level.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="team_size">Team Size</Label>
          <Input
            id="team_size"
            type="number"
            min="1"
            max="10"
            className="bg-primary-background mt-1.5 w-full sm:w-1/4"
            {...register("team_size")}
          />
          {errors.team_size && (
            <p className="text-red-400 text-sm mt-1">
              {errors.team_size.message}
            </p>
          )}
        </div>

        <div>
          <Label className="mb-3 block">Project Time Scale</Label>
          <Controller
            name="time_scale"
            control={control}
            defaultValue="medium"
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="small" id="small" />
                  <Label
                    htmlFor="small"
                    className="cursor-pointer hover:text-primary-cta"
                  >
                    Small (&lt;40 hours)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label
                    htmlFor="medium"
                    className="cursor-pointer hover:text-primary-cta"
                  >
                    Medium (40-100 hours)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="large" id="large" />
                  <Label
                    htmlFor="large"
                    className="cursor-pointer hover:text-primary-cta"
                  >
                    Large (100-300 hours)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label
                    htmlFor="custom"
                    className="cursor-pointer hover:text-primary-cta"
                  >
                    Custom
                  </Label>
                </div>
              </RadioGroup>
            )}
          />
          {errors.time_scale && (
            <p className="text-red-400 text-sm mt-1">
              {errors.time_scale.message}
            </p>
          )}
        </div>

        {showCustomHours && (
          <div>
            <Label htmlFor="custom_hours">Custom Hours</Label>
            <Input
              id="custom_hours"
              type="number"
              min="1"
              max="1000"
              placeholder="Enter hours (1-1000)"
              className="bg-primary-background mt-1.5 w-full sm:w-1/4"
              {...register("custom_hours", {
                required: timeScale === "custom",
              })}
            />
            {errors.custom_hours && (
              <p className="text-red-400 text-sm mt-1">
                {errors.custom_hours.message}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-primary-cta hover:bg-primary-cta/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Questions...
            </>
          ) : (
            <>Continue</>
          )}
        </Button>
      </div>
    </form>
  );
}
