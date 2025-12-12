import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROVIDER_OPTIONS, USER_TYPE_OPTIONS, type ModelProfile } from "@/lib/types";

const formSchema = z.object({
  modelName: z.string().min(1, "Model name is required"),
  provider: z.enum(["OpenAI", "Anthropic", "Open Source", "Custom"], {
    required_error: "Please select a provider",
  }),
  useCase: z.string().min(1, "Use case description is required"),
  userType: z.enum(["General Public", "Internal", "Enterprise"], {
    required_error: "Please select a user type",
  }),
});

type FormData = z.infer<typeof formSchema>;

interface IntakeFormProps {
  onSubmit: (profile: ModelProfile) => void;
}

export default function IntakeForm({ onSubmit }: IntakeFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      modelName: "",
      provider: undefined,
      useCase: "",
      userType: undefined,
    },
  });

  const handleSubmit = (data: FormData) => {
    onSubmit(data as ModelProfile);
  };

  return (
    <Card className="border border-border">
      <CardHeader className="space-y-2 pb-6">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-muted-foreground" />
          <CardTitle className="text-xl font-semibold">Model Intake</CardTitle>
        </div>
        <CardDescription className="text-base text-muted-foreground">
          Enter your AI model details to run a compliance assessment against applicable regulations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="modelName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Model Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., GPT-4o, Claude 3, Llama 2"
                      className="h-11"
                      data-testid="input-model-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Model Provider</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11" data-testid="select-provider">
                        <SelectValue placeholder="Select a provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROVIDER_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value} data-testid={`option-provider-${option.value}`}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="useCase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Deployment Use Case</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Customer support chatbot, Content moderation"
                      className="h-11"
                      data-testid="input-use-case"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">User Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11" data-testid="select-user-type">
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {USER_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value} data-testid={`option-user-type-${option.value}`}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4">
              <Button
                type="submit"
                size="lg"
                className="w-full font-semibold"
                data-testid="button-run-scan"
              >
                Run Compliance Scan
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
