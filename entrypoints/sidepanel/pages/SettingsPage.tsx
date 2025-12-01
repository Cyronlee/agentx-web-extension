import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SettingsView } from "../components/SettingsView";

interface SettingsPageProps {
  onBack: () => void;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Back button header */}
      <div className="border-b px-4 py-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Chat
        </Button>
      </div>

      {/* Settings content */}
      <div className="flex-1 overflow-hidden">
        <SettingsView />
      </div>
    </div>
  );
}

