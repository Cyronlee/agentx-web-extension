# Task 02: Debug Page

## Overview

Replace ProfileView with a debug page that displays major debug information of the extension.

## Requirements

### 1. UI Information

- Display extension sidepanel dimensions (width x height)
- Current viewport size

### 2. Chrome Extension Permissions Management

Display permission status and provide request buttons for each permission:

- **storage** - with test button (read/write test)
- **indexedDB** - with test button (create/read test)
- **contextMenus** - with test button (create menu item)
- **activeTab** - with request button
- **scripting** - with test button (inject test script)
- **tabs** - with request button
- **host_permissions** - display status
- **clipboard** (read/write) - with test button (copy/paste test)
- **downloads** - with test button (download test file)
- **fetch** - with test button (fetch 'https://httpbin.org/get')
- **microphone** - with request and test button (record audio)
- **camera** - with request and test button (capture video)
- **notifications** - with test button (show notification)

**Implementation Note**: Use `@/components/ui/drawer` for permission details and test controls when content is extensive.

### 3. Browser Information

- Browser name and version
- User agent string
- Platform/OS
- Extension version

### 4. UI Updates

- Rename tab from "Profile" to "Debug" in App.tsx
- Update tab icon accordingly
