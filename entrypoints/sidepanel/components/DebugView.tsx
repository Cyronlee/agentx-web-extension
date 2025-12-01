import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Monitor, Shield, Info, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface PermissionStatus {
  name: string;
  granted: boolean;
  canTest: boolean;
}

export function DebugView() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [permissions, setPermissions] = useState<PermissionStatus[]>([]);
  const [browserInfo, setBrowserInfo] = useState({
    name: "",
    version: "",
    userAgent: "",
    platform: "",
    extensionVersion: "",
  });

  useEffect(() => {
    // Get dimensions
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    // Get browser info
    const ua = navigator.userAgent;
    let browserName = "Unknown";
    let browserVersion = "Unknown";

    if (ua.includes("Chrome")) {
      browserName = "Chrome";
      const match = ua.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
      browserVersion = match ? match[1] : "Unknown";
    } else if (ua.includes("Firefox")) {
      browserName = "Firefox";
      const match = ua.match(/Firefox\/(\d+\.\d+)/);
      browserVersion = match ? match[1] : "Unknown";
    } else if (ua.includes("Safari")) {
      browserName = "Safari";
      const match = ua.match(/Version\/(\d+\.\d+)/);
      browserVersion = match ? match[1] : "Unknown";
    }

    setBrowserInfo({
      name: browserName,
      version: browserVersion,
      userAgent: ua,
      platform: navigator.platform,
      extensionVersion: browser.runtime.getManifest().version,
    });

    // Check permissions
    checkAllPermissions();

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const checkAllPermissions = async () => {
    const permissionList: PermissionStatus[] = [
      { name: "storage", granted: true, canTest: true }, // Always granted for extensions
      { name: "indexedDB", granted: true, canTest: true },
      { name: "contextMenus", granted: await checkPermission("contextMenus"), canTest: true },
      { name: "activeTab", granted: await checkPermission("activeTab"), canTest: false },
      { name: "scripting", granted: await checkPermission("scripting"), canTest: true },
      { name: "tabs", granted: await checkPermission("tabs"), canTest: false },
      { name: "clipboardRead", granted: await checkClipboardPermission("read"), canTest: true },
      { name: "clipboardWrite", granted: await checkClipboardPermission("write"), canTest: true },
      { name: "downloads", granted: await checkPermission("downloads"), canTest: true },
      { name: "notifications", granted: await checkPermission("notifications"), canTest: true },
    ];
    setPermissions(permissionList);
  };

  const checkPermission = async (permission: string): Promise<boolean> => {
    try {
      const result = await browser.permissions.contains({ permissions: [permission] });
      return result;
    } catch (error) {
      return false;
    }
  };

  const checkClipboardPermission = async (type: "read" | "write"): Promise<boolean> => {
    try {
      const result = await navigator.permissions.query({ name: `clipboard-${type}` as PermissionName });
      return result.state === "granted";
    } catch (error) {
      return false;
    }
  };

  const requestPermission = async (permission: string) => {
    try {
      const granted = await browser.permissions.request({ permissions: [permission] });
      if (granted) {
        toast.success(`Permission "${permission}" granted`);
        checkAllPermissions();
      } else {
        toast.error(`Permission "${permission}" denied`);
      }
    } catch (error) {
      toast.error(`Failed to request permission: ${error}`);
    }
  };

  const testStorage = async () => {
    try {
      const testKey = "debug_test";
      const testValue = { timestamp: Date.now(), message: "Test data" };
      await browser.storage.local.set({ [testKey]: testValue });
      const result = await browser.storage.local.get(testKey);
      if (result[testKey]?.message === testValue.message) {
        toast.success("Storage test: Read/Write successful");
        await browser.storage.local.remove(testKey);
      } else {
        toast.error("Storage test: Read failed");
      }
    } catch (error) {
      toast.error(`Storage test failed: ${error}`);
    }
  };

  const testIndexedDB = async () => {
    try {
      const request = indexedDB.open("DebugTestDB", 1);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("test")) {
          db.createObjectStore("test", { keyPath: "id" });
        }
      };
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(["test"], "readwrite");
        const store = transaction.objectStore("test");
        store.add({ id: 1, data: "test" });
        transaction.oncomplete = () => {
          toast.success("IndexedDB test: Create/Write successful");
          indexedDB.deleteDatabase("DebugTestDB");
        };
      };
      request.onerror = () => {
        toast.error("IndexedDB test failed");
      };
    } catch (error) {
      toast.error(`IndexedDB test failed: ${error}`);
    }
  };

  const testContextMenu = async () => {
    try {
      await browser.contextMenus.create({
        id: "debug-test-menu",
        title: "Debug Test Menu",
        contexts: ["page"],
      });
      toast.success("Context menu created successfully");
      setTimeout(() => {
        browser.contextMenus.remove("debug-test-menu");
      }, 3000);
    } catch (error) {
      toast.error(`Context menu test failed: ${error}`);
    }
  };

  const testScripting = async () => {
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        await browser.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            console.log("Debug test script executed");
          },
        });
        toast.success("Script injection successful");
      }
    } catch (error) {
      toast.error(`Scripting test failed: ${error}`);
    }
  };

  const testClipboard = async (type: "read" | "write") => {
    try {
      if (type === "write") {
        await navigator.clipboard.writeText("Debug test clipboard content");
        toast.success("Clipboard write successful");
      } else {
        const text = await navigator.clipboard.readText();
        toast.success(`Clipboard read successful: ${text.substring(0, 50)}${text.length > 50 ? "..." : ""}`);
      }
    } catch (error) {
      toast.error(`Clipboard ${type} failed: ${error}`);
    }
  };

  const testDownload = async () => {
    try {
      const blob = new Blob(["Debug test file content"], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      await browser.downloads.download({
        url: url,
        filename: "debug-test.txt",
        saveAs: false,
      });
      toast.success("Download test initiated");
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(`Download test failed: ${error}`);
    }
  };

  const testFetch = async () => {
    try {
      const response = await fetch("https://httpbin.org/get");
      if (response.ok) {
        const data = await response.json();
        toast.success("Fetch test successful");
        console.log("Fetch test result:", data);
      } else {
        toast.error(`Fetch test failed: ${response.status}`);
      }
    } catch (error) {
      toast.error(`Fetch test failed: ${error}`);
    }
  };

  const testNotification = async () => {
    try {
      await browser.notifications.create({
        type: "basic",
        iconUrl: browser.runtime.getURL("icon/48.png"),
        title: "Debug Test",
        message: "This is a test notification from AgentX",
      });
      toast.success("Notification sent");
    } catch (error) {
      toast.error(`Notification test failed: ${error}`);
    }
  };

  const testMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      toast.success("Microphone access granted");
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      toast.error(`Microphone test failed: ${error}`);
    }
  };

  const testCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      toast.success("Camera access granted");
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      toast.error(`Camera test failed: ${error}`);
    }
  };

  const getPermissionIcon = (granted: boolean) => {
    if (granted) {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    }
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getTestButton = (permName: string) => {
    const testActions: Record<string, () => void> = {
      storage: testStorage,
      indexedDB: testIndexedDB,
      contextMenus: testContextMenu,
      scripting: testScripting,
      clipboardRead: () => testClipboard("read"),
      clipboardWrite: () => testClipboard("write"),
      downloads: testDownload,
      notifications: testNotification,
    };

    if (testActions[permName]) {
      return (
        <Button size="sm" variant="outline" onClick={testActions[permName]}>
          Test
        </Button>
      );
    }
    return null;
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-4">
        {/* UI Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Monitor className="h-4 w-4" />
              UI Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sidepanel Size</span>
              <Badge variant="secondary">{dimensions.width} × {dimensions.height}px</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4" />
              Extension Permissions
            </CardTitle>
            <CardDescription>Manage and test extension permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" className="w-full">
                  View All Permissions ({permissions.length})
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Extension Permissions</DrawerTitle>
                  <DrawerDescription>
                    Check status and test permissions
                  </DrawerDescription>
                </DrawerHeader>
                <div className="px-4 pb-4 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-3">
                    {permissions.map((perm) => (
                      <div
                        key={perm.name}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {getPermissionIcon(perm.granted)}
                          <div>
                            <div className="font-medium text-sm">{perm.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {perm.granted ? "Granted" : "Not granted"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!perm.granted && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => requestPermission(perm.name)}
                            >
                              Request
                            </Button>
                          )}
                          {perm.canTest && perm.granted && getTestButton(perm.name)}
                        </div>
                      </div>
                    ))}

                    {/* Additional permissions that need manual testing */}
                    <Separator className="my-4" />
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Manual Test Permissions
                      </h4>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Info className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="font-medium text-sm">Fetch API</div>
                            <div className="text-xs text-muted-foreground">
                              Test https://httpbin.org/get
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={testFetch}>
                          Test
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Info className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="font-medium text-sm">Microphone</div>
                            <div className="text-xs text-muted-foreground">
                              Request audio access
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={testMicrophone}>
                          Test
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Info className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="font-medium text-sm">Camera</div>
                            <div className="text-xs text-muted-foreground">
                              Request video access
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={testCamera}>
                          Test
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button variant="outline">Close</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </CardContent>
        </Card>

        {/* Browser Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="h-4 w-4" />
              Browser Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">Browser</span>
                <span className="text-sm font-medium">{browserInfo.name}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">Version</span>
                <span className="text-sm font-medium">{browserInfo.version}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">Platform</span>
                <span className="text-sm font-medium">{browserInfo.platform}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">Extension Version</span>
                <Badge variant="secondary">{browserInfo.extensionVersion}</Badge>
              </div>
              <Separator className="my-2" />
              <div className="py-1">
                <span className="text-sm text-muted-foreground">User Agent</span>
                <p className="text-xs font-mono mt-1 p-2 bg-muted rounded break-all">
                  {browserInfo.userAgent}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}

