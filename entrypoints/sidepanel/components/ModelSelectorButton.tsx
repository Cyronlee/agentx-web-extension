import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger,
} from '@/components/ai-elements/model-selector'
import { PromptInputButton } from '@/components/ai-elements/prompt-input'
import { CheckIcon } from 'lucide-react'

import { models, type Model } from '../lib/models'

interface ModelSelectorButtonProps {
  selectedModelId: string
  onModelChange: (modelId: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * ModelSelectorButton - Button with dropdown for selecting AI model
 *
 * Single responsibility: Display and select AI model
 * State: Controlled by parent (selectedModelId, open state)
 */
export function ModelSelectorButton({
  selectedModelId,
  onModelChange,
  open,
  onOpenChange,
}: ModelSelectorButtonProps) {
  const selectedModelData = models.find((m) => m.id === selectedModelId)

  return (
    <ModelSelector onOpenChange={onOpenChange} open={open}>
      <ModelSelectorTrigger asChild>
        <PromptInputButton>
          {selectedModelData?.chefSlug && (
            <ModelSelectorLogo provider={selectedModelData.chefSlug} />
          )}
          {selectedModelData?.name && (
            <ModelSelectorName>{selectedModelData.name}</ModelSelectorName>
          )}
        </PromptInputButton>
      </ModelSelectorTrigger>
      <ModelSelectorContent>
        <ModelSelectorInput placeholder="Search models..." />
        <ModelSelectorList>
          <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
          <ModelSelectorGroup heading="Models">
            {models.map((m) => (
              <ModelSelectorItem
                key={m.id}
                onSelect={() => {
                  onModelChange(m.id)
                  onOpenChange(false)
                }}
                value={m.id}
              >
                <ModelSelectorLogo provider={m.chefSlug} />
                <ModelSelectorName>{m.name}</ModelSelectorName>
                <ModelSelectorLogoGroup>
                  {m.providers.map((provider) => (
                    <ModelSelectorLogo key={provider} provider={provider} />
                  ))}
                </ModelSelectorLogoGroup>
                {selectedModelId === m.id ? (
                  <CheckIcon className="ml-auto size-4" />
                ) : (
                  <div className="ml-auto size-4" />
                )}
              </ModelSelectorItem>
            ))}
          </ModelSelectorGroup>
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  )
}

