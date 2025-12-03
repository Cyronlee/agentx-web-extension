export interface Model {
  id: string
  name: string
  chef: string
  chefSlug: string
  providers: string[]
}

export const models: Model[] = [
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    chef: 'OpenAI',
    chefSlug: 'openai',
    providers: ['openai'],
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    chef: 'OpenAI',
    chefSlug: 'openai',
    providers: ['openai'],
  },
  {
    id: 'anthropic/claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    chef: 'Anthropic',
    chefSlug: 'anthropic',
    providers: ['anthropic'],
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.0 Flash',
    chef: 'Google',
    chefSlug: 'google',
    providers: ['google'],
  },
]

export const DEFAULT_MODEL_ID = models[0].id

