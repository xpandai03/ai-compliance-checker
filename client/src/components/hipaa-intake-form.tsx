import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { ArrowRight, ShieldCheck, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  HIPAA_ORGANIZATION_TYPE_OPTIONS,
  HIPAA_AI_FUNCTION_OPTIONS,
  HIPAA_ENVIRONMENT_OPTIONS,
  HIPAA_LOGGING_OPTIONS,
  HIPAA_PHI_TYPE_OPTIONS,
  type HIPAAUseCaseProfile,
  type VendorPHIMetadata,
} from "@/lib/types";

const vendorSchema = z.object({
  vendor_name: z.string().min(1, "Vendor name is required"),
  role: z.string().min(1, "Vendor role is required"),
  baa_available: z.enum(["true", "false", "unknown"]),
  data_storage: z.enum(["none", "transient", "stored", "unknown"]),
  logging_enabled: z.enum(["true", "false", "unknown"]),
  access_controls_documented: z.enum(["true", "false", "unknown"]),
});

const formSchema = z.object({
  use_case_name: z.string().min(1, "Use case name is required"),
  organization_type: z.enum(["covered_entity", "business_associate", "neither", "unknown"], {
    required_error: "Please select organization type",
  }),
  ai_function: z.enum(["chat", "summarization", "transcription", "coding", "other"], {
    required_error: "Please select AI function",
  }),
  phi_involved: z.enum(["true", "false", "unknown"], {
    required_error: "Please indicate PHI involvement",
  }),
  phi_types: z.array(z.string()),
  input_source: z.string().min(1, "Input source is required"),
  output_destination: z.string().min(1, "Output destination is required"),
  environment: z.enum(["prod", "staging", "dev"], {
    required_error: "Please select environment",
  }),
  logging_behavior: z.enum(["none", "transient", "retained", "unknown"], {
    required_error: "Please select logging behavior",
  }),
  retention_period_defined: z.enum(["true", "false", "unknown"]),
  access_controls_documented: z.enum(["true", "false", "unknown"]),
});

type FormData = z.infer<typeof formSchema>;

interface VendorFormData {
  vendor_name: string;
  role: string;
  baa_available: "true" | "false" | "unknown";
  data_storage: "none" | "transient" | "stored" | "unknown";
  logging_enabled: "true" | "false" | "unknown";
  access_controls_documented: "true" | "false" | "unknown";
}

interface HIPAAIntakeFormProps {
  onSubmit: (profile: HIPAAUseCaseProfile, vendors: VendorPHIMetadata[]) => void;
}

function parseBooleanField(value: "true" | "false" | "unknown"): boolean | "unknown" {
  if (value === "true") return true;
  if (value === "false") return false;
  return "unknown";
}

export default function HIPAAIntakeForm({ onSubmit }: HIPAAIntakeFormProps) {
  const [vendors, setVendors] = useState<VendorFormData[]>([]);
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [newVendor, setNewVendor] = useState<VendorFormData>({
    vendor_name: "",
    role: "",
    baa_available: "unknown",
    data_storage: "unknown",
    logging_enabled: "unknown",
    access_controls_documented: "unknown",
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      use_case_name: "",
      organization_type: undefined,
      ai_function: undefined,
      phi_involved: undefined,
      phi_types: [],
      input_source: "",
      output_destination: "",
      environment: undefined,
      logging_behavior: undefined,
      retention_period_defined: "unknown",
      access_controls_documented: "unknown",
    },
  });

  const handleSubmit = (data: FormData) => {
    const profile: HIPAAUseCaseProfile = {
      use_case_name: data.use_case_name,
      organization_type: data.organization_type,
      ai_function: data.ai_function,
      phi_involved: parseBooleanField(data.phi_involved),
      phi_types: data.phi_types,
      input_source: data.input_source,
      output_destination: data.output_destination,
      environment: data.environment,
      logging_behavior: data.logging_behavior,
      retention_period_defined: parseBooleanField(data.retention_period_defined),
      access_controls_documented: parseBooleanField(data.access_controls_documented),
      vendors_used: vendors.map(v => ({ vendor_name: v.vendor_name, role: v.role })),
    };

    const vendorMetadata: VendorPHIMetadata[] = vendors.map(v => ({
      vendor_name: v.vendor_name,
      baa_available: parseBooleanField(v.baa_available),
      data_storage: v.data_storage,
      logging_enabled: parseBooleanField(v.logging_enabled),
      access_controls_documented: parseBooleanField(v.access_controls_documented),
      source: "user_input",
      confidence: "high" as const,
    }));

    onSubmit(profile, vendorMetadata);
  };

  const addVendor = () => {
    if (newVendor.vendor_name && newVendor.role) {
      setVendors([...vendors, newVendor]);
      setNewVendor({
        vendor_name: "",
        role: "",
        baa_available: "unknown",
        data_storage: "unknown",
        logging_enabled: "unknown",
        access_controls_documented: "unknown",
      });
      setShowVendorForm(false);
    }
  };

  const removeVendor = (index: number) => {
    setVendors(vendors.filter((_, i) => i !== index));
  };

  return (
    <Card className="border border-border">
      <CardHeader className="space-y-2 pb-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-muted-foreground" />
          <CardTitle className="text-xl font-semibold">HIPAA AI Use Case Intake</CardTitle>
        </div>
        <CardDescription className="text-base text-muted-foreground">
          Enter details about your AI use case to assess HIPAA compliance risk.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="use_case_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Use Case Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Clinical Note Summarization"
                      className="h-11"
                      data-testid="input-hipaa-use-case-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organization_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Organization Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11" data-testid="select-organization-type">
                        <SelectValue placeholder="Select organization type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {HIPAA_ORGANIZATION_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value} data-testid={`option-org-${option.value}`}>
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
              name="ai_function"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">AI Function</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11" data-testid="select-ai-function">
                        <SelectValue placeholder="Select AI function" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {HIPAA_AI_FUNCTION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value} data-testid={`option-func-${option.value}`}>
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
              name="phi_involved"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">PHI Involved?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11" data-testid="select-phi-involved">
                        <SelectValue placeholder="Select PHI involvement" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true" data-testid="option-phi-yes">Yes</SelectItem>
                      <SelectItem value="false" data-testid="option-phi-no">No</SelectItem>
                      <SelectItem value="unknown" data-testid="option-phi-unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phi_types"
              render={() => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">PHI Types (if applicable)</FormLabel>
                  <FormDescription className="text-xs text-muted-foreground">
                    Select all types of PHI that may be processed
                  </FormDescription>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {HIPAA_PHI_TYPE_OPTIONS.map((option) => (
                      <FormField
                        key={option.value}
                        control={form.control}
                        name="phi_types"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.value)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, option.value]);
                                  } else {
                                    field.onChange(current.filter((v) => v !== option.value));
                                  }
                                }}
                                data-testid={`checkbox-phi-${option.value}`}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              {option.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="input_source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Input Source</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., EHR system, patient portal"
                        className="h-11"
                        data-testid="input-source"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="output_destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Output Destination</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., EHR, clinical dashboard"
                        className="h-11"
                        data-testid="input-destination"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="environment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Environment</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11" data-testid="select-environment">
                        <SelectValue placeholder="Select environment" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {HIPAA_ENVIRONMENT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value} data-testid={`option-env-${option.value}`}>
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
              name="logging_behavior"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Logging Behavior</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11" data-testid="select-logging">
                        <SelectValue placeholder="Select logging behavior" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {HIPAA_LOGGING_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value} data-testid={`option-log-${option.value}`}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="retention_period_defined"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Retention Period Defined?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11" data-testid="select-retention">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="access_controls_documented"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Access Controls Documented?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11" data-testid="select-access-controls">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel className="text-sm font-medium">AI Vendors</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVendorForm(true)}
                  data-testid="button-add-vendor"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Vendor
                </Button>
              </div>

              {vendors.length > 0 && (
                <div className="space-y-2">
                  {vendors.map((vendor, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                      data-testid={`vendor-item-${index}`}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{vendor.vendor_name}</span>
                        <Badge variant="secondary" className="text-xs">{vendor.role}</Badge>
                        <Badge
                          variant={vendor.baa_available === "true" ? "default" : vendor.baa_available === "false" ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          BAA: {vendor.baa_available === "true" ? "Yes" : vendor.baa_available === "false" ? "No" : "Unknown"}
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVendor(index)}
                        data-testid={`button-remove-vendor-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {showVendorForm && (
                <Card className="p-4 space-y-4 bg-muted/30">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium">Vendor Name</label>
                      <Input
                        value={newVendor.vendor_name}
                        onChange={(e) => setNewVendor({ ...newVendor, vendor_name: e.target.value })}
                        placeholder="e.g., OpenAI"
                        className="h-9 mt-1"
                        data-testid="input-new-vendor-name"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium">Role</label>
                      <Input
                        value={newVendor.role}
                        onChange={(e) => setNewVendor({ ...newVendor, role: e.target.value })}
                        placeholder="e.g., LLM Provider"
                        className="h-9 mt-1"
                        data-testid="input-new-vendor-role"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium">BAA Available?</label>
                      <Select
                        value={newVendor.baa_available}
                        onValueChange={(v: "true" | "false" | "unknown") => setNewVendor({ ...newVendor, baa_available: v })}
                      >
                        <SelectTrigger className="h-9 mt-1" data-testid="select-new-vendor-baa">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                          <SelectItem value="unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium">Data Storage</label>
                      <Select
                        value={newVendor.data_storage}
                        onValueChange={(v: "none" | "transient" | "stored" | "unknown") => setNewVendor({ ...newVendor, data_storage: v })}
                      >
                        <SelectTrigger className="h-9 mt-1" data-testid="select-new-vendor-storage">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="transient">Transient</SelectItem>
                          <SelectItem value="stored">Stored</SelectItem>
                          <SelectItem value="unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium">Logging Enabled?</label>
                      <Select
                        value={newVendor.logging_enabled}
                        onValueChange={(v: "true" | "false" | "unknown") => setNewVendor({ ...newVendor, logging_enabled: v })}
                      >
                        <SelectTrigger className="h-9 mt-1" data-testid="select-new-vendor-logging">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                          <SelectItem value="unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium">Access Controls Documented?</label>
                      <Select
                        value={newVendor.access_controls_documented}
                        onValueChange={(v: "true" | "false" | "unknown") => setNewVendor({ ...newVendor, access_controls_documented: v })}
                      >
                        <SelectTrigger className="h-9 mt-1" data-testid="select-new-vendor-access">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                          <SelectItem value="unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowVendorForm(false)}>
                      Cancel
                    </Button>
                    <Button type="button" size="sm" onClick={addVendor} data-testid="button-confirm-vendor">
                      Add Vendor
                    </Button>
                  </div>
                </Card>
              )}

              {vendors.length === 0 && !showVendorForm && (
                <p className="text-sm text-muted-foreground">No vendors added yet.</p>
              )}
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                size="lg"
                className="w-full font-semibold"
                data-testid="button-run-hipaa-scan"
              >
                Run HIPAA Risk Assessment
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
