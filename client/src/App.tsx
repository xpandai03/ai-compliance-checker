import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ModelIntake from "@/pages/model-intake";
import FindingsPage from "@/pages/findings";
import NotFound from "@/pages/not-found";
import type { ModelProfile } from "@/lib/types";

function App() {
  const [modelProfile, setModelProfile] = useState<ModelProfile | null>(null);

  const handleModelSubmit = (profile: ModelProfile) => {
    setModelProfile(profile);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Switch>
          <Route path="/">
            <ModelIntake onSubmit={handleModelSubmit} />
          </Route>
          <Route path="/findings">
            <FindingsPage modelProfile={modelProfile} />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
