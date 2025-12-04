---
title: Project Overview
tags: [overview, architecture, browser-extension]
date: 2025-12-01
---

# Project Overview

**AgentX Web Extension** is a modern browser extension with sidepanel support.

## Core Purpose

A production-ready template for building browser extensions with a sidepanel interface, providing a complete UI framework with theme management, persistent storage, and runtime configuration.

## Project Type

Browser Extension (Chrome Extension with multi-browser support via WXT)

## Key Features

- Browser sidepanel interface (opens on extension icon click)
- Multi-tab navigation (Home, Profile, Settings)
- Theme system (System/Light/Dark with auto-detection)
- Persistent settings storage using WXT Storage API
- Runtime configuration system with type safety
- Responsive UI built with shadcn/ui components
- Background script for extension lifecycle management
- Optional content script for page injection

## Architecture Pattern

- **Entry Points**: WXT-based with separate background, content, and sidepanel entry points
- **State Management**: React hooks with WXT Storage for persistence
- **Styling**: Tailwind CSS 4.0 with CSS variables for theming
- **Component Library**: shadcn/ui (Radix UI primitives + Tailwind)

## Target Browsers

Chrome (MV3), Firefox (MV2), Edge (MV3), Safari (MV2), and Chromium-based browsers

## Reference

See [[tech-stack]], [[directory-structure]], [[storage-pattern]]
