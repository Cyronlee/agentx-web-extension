refine @entrypoints/sidepanel/components/Header.tsx and @entrypoints/sidepanel/components/ConversationSelector.tsx, the dropdown is too compact, we need to replace it with CommandDialog related ui components, and implement search functionality

- reference the following code to implement
- only render the conversation list, and implement search functionality
- the icon in the item is the agent's icon
- when the item is hovered, render a delete button in the end, call @db/operations.ts to delete a single conversation

```
<Command>
  <CommandInput placeholder="Type a command or search..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Suggestions">
      <CommandItem>Calendar</CommandItem>
      <CommandItem>Search Emoji</CommandItem>
      <CommandItem>Calculator</CommandItem>
    </CommandGroup>
    <CommandSeparator />
    <CommandGroup heading="Settings">
      <CommandItem>Profile</CommandItem>
      <CommandItem>Billing</CommandItem>
      <CommandItem>Settings</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```
