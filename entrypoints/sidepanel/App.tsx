import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/hooks/use-settings";
import { Heart, MessageSquare, Settings, User } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { ChatView } from "./components/ChatView";
import { ProfileView } from "./components/ProfileView";
import { SettingsView } from "./components/SettingsView";

function App() {
  const { ui, loading, updateUI } = useSettings();

  const handleTabChange = (value: string) => {
    updateUI({ activeTab: value });
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Toaster position="top-center" expand={true} richColors />

      {/* Header */}
      {/* <div className="border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">AgentX</h1>
            <p className="text-sm text-muted-foreground">
              AI Assistant Extension
            </p>
          </div>
        </div>
      </div> */}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs
          value={ui.activeTab}
          onValueChange={handleTabChange}
          className="h-full flex flex-col gap-0"
        >
          <TabsList className="h-auto rounded-none border-b bg-transparent p-0 w-full">
            <TabsTrigger
              value="home"
              className="data-[state=active]:after:bg-primary relative rounded-none py-2 px-4 flex items-center gap-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none flex-1"
            >
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="data-[state=active]:after:bg-primary relative rounded-none py-2 px-4 flex items-center gap-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none flex-1"
            >
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:after:bg-primary relative rounded-none py-2 px-4 flex items-center gap-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none flex-1"
            >
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="flex-1 overflow-hidden">
            <ChatView />
          </TabsContent>

          <TabsContent value="profile" className="flex-1 overflow-hidden">
            <ProfileView />
          </TabsContent>

          <TabsContent value="settings" className="flex-1 overflow-hidden">
            <SettingsView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
