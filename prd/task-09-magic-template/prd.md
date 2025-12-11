in `@entrypoints/sidepanel/components/ChatInput.tsx` add a MagicTemplate component in the PromptInputTools area, ui reference AttachmentMenu

## database model

```ts
{
  id: string,
  name: string,
  template: string,
  createdAt: number,
  updatedAt: number,
}
```

## feature

- user could manage magic tempaltes in a single page
- template support dynamic variables
- when user click the magic template button, show a dialog to let user choose the template (list all tempaltes), then system will insert dynamic variables into a preview text area (user can modify the text area content)
- user click confirm button, final content will insert into <PromptInputTextarea>

### dynamic var

{{clipboard}} → user's clipboard content
{{date}} → today's date (2025-12-08)
{{time}} → current time (14:32)
{{selected}} → user's selected text in the web page
{{url}} → current web page URL (only for web)
{{language}} → user's current interface language

## important

- you need to design the communication architecture between web page and extension to get {{selected}} and {{url}}
