export interface AiChatCompletionMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface AiChatCompletionOptions {
  model: string
  messages: AiChatCompletionMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

export interface AiChatCompletionResult {
  content: string
  model: string
  provider: string
  tokensInput: number
  tokensOutput: number
  latencyMs: number
  cost: number
}

export interface AiEmbeddingOptions {
  model: string
  input: string | string[]
}

export interface AiEmbeddingResult {
  embeddings: number[][]
  model: string
  provider: string
  tokensInput: number
  latencyMs: number
  cost: number
}

export interface AiProviderAdapter {
  name: string
  chatCompletion(opts: AiChatCompletionOptions): Promise<AiChatCompletionResult>
  generateEmbedding(opts: AiEmbeddingOptions): Promise<AiEmbeddingResult>
}

const COST_PER_1K_INPUT: Record<string, number> = {
  "gpt-4o": 0.005, "gpt-4o-mini": 0.0015, "gpt-4-turbo": 0.01,
  "claude-3-opus": 0.015, "claude-3-sonnet": 0.003, "claude-3-haiku": 0.00025,
  "gemini-1.5-pro": 0.0035, "gemini-1.5-flash": 0.0005,
  "text-embedding-3-small": 0.00002, "text-embedding-3-large": 0.00013,
}

const COST_PER_1K_OUTPUT: Record<string, number> = {
  "gpt-4o": 0.015, "gpt-4o-mini": 0.0045, "gpt-4-turbo": 0.03,
  "claude-3-opus": 0.075, "claude-3-sonnet": 0.015, "claude-3-haiku": 0.00125,
  "gemini-1.5-pro": 0.0105, "gemini-1.5-flash": 0.0015,
}

function calculateCost(model: string, tokensInput: number, tokensOutput: number): number {
  const inRate = COST_PER_1K_INPUT[model] ?? 0
  const outRate = COST_PER_1K_OUTPUT[model] ?? 0
  return (tokensInput / 1000) * inRate + (tokensOutput / 1000) * outRate
}

class OpenAIProvider implements AiProviderAdapter {
  name = "openai"
  private apiKey: string
  private baseUrl: string
  constructor(apiKey: string, baseUrl = "https://api.openai.com/v1") { this.apiKey = apiKey; this.baseUrl = baseUrl }
  async chatCompletion(opts: AiChatCompletionOptions): Promise<AiChatCompletionResult> {
    const start = Date.now()
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({ model: opts.model, messages: opts.messages, temperature: opts.temperature, max_tokens: opts.max_tokens }),
    })
    const json = await res.json()
    const latencyMs = Date.now() - start
    if (!res.ok) throw new Error(json.error?.message ?? "OpenAI API error")
    const c = json.choices[0]
    return {
      content: c.message.content, model: json.model, provider: "openai",
      tokensInput: json.usage?.prompt_tokens ?? 0, tokensOutput: json.usage?.completion_tokens ?? 0,
      latencyMs, cost: calculateCost(opts.model, json.usage?.prompt_tokens ?? 0, json.usage?.completion_tokens ?? 0),
    }
  }
  async generateEmbedding(opts: AiEmbeddingOptions): Promise<AiEmbeddingResult> {
    const start = Date.now()
    const res = await fetch(`${this.baseUrl}/embeddings`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({ model: opts.model, input: opts.input }),
    })
    const json = await res.json()
    const latencyMs = Date.now() - start
    if (!res.ok) throw new Error(json.error?.message ?? "OpenAI embedding error")
    return {
      embeddings: json.data.map((d: any) => d.embedding), model: json.model, provider: "openai",
      tokensInput: json.usage?.prompt_tokens ?? 0, latencyMs,
      cost: calculateCost(opts.model, json.usage?.prompt_tokens ?? 0, 0),
    }
  }
}

class AnthropicProvider implements AiProviderAdapter {
  name = "anthropic"
  private apiKey: string
  private baseUrl: string
  constructor(apiKey: string, baseUrl = "https://api.anthropic.com/v1") { this.apiKey = apiKey; this.baseUrl = baseUrl }
  async chatCompletion(opts: AiChatCompletionOptions): Promise<AiChatCompletionResult> {
    const start = Date.now()
    const systemMsg = opts.messages.find((m) => m.role === "system")
    const msgs = opts.messages.filter((m) => m.role !== "system").map((m) => ({ role: m.role, content: m.content }))
    const body: any = { model: opts.model, messages: msgs, max_tokens: opts.max_tokens ?? 1024 }
    if (opts.temperature !== undefined) body.temperature = opts.temperature
    if (systemMsg) body.system = systemMsg.content
    const res = await fetch(`${this.baseUrl}/messages`, {
      method: "POST", headers: { "Content-Type": "application/json", "x-api-key": this.apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    const latencyMs = Date.now() - start
    if (!res.ok) throw new Error(json.error?.message ?? "Anthropic API error")
    return {
      content: json.content[0]?.text ?? "", model: json.model, provider: "anthropic",
      tokensInput: json.usage?.input_tokens ?? 0, tokensOutput: json.usage?.output_tokens ?? 0,
      latencyMs, cost: calculateCost(opts.model, json.usage?.input_tokens ?? 0, json.usage?.output_tokens ?? 0),
    }
  }
  async generateEmbedding(_opts: AiEmbeddingOptions): Promise<AiEmbeddingResult> {
    throw new Error("Anthropic does not support embeddings")
  }
}

class GeminiProvider implements AiProviderAdapter {
  name = "google_gemini"
  private apiKey: string
  private baseUrl: string
  constructor(apiKey: string, baseUrl = "https://generativelanguage.googleapis.com/v1beta") { this.apiKey = apiKey; this.baseUrl = baseUrl }
  async chatCompletion(opts: AiChatCompletionOptions): Promise<AiChatCompletionResult> {
    const start = Date.now()
    const contents = opts.messages.filter((m) => m.role !== "system").map((m) => ({
      role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }],
    }))
    const body: any = { contents }
    if (opts.temperature !== undefined) body.generationConfig = { temperature: opts.temperature, maxOutputTokens: opts.max_tokens }
    const res = await fetch(`${this.baseUrl}/models/${opts.model}:generateContent?key=${this.apiKey}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    })
    const json = await res.json()
    const latencyMs = Date.now() - start
    if (!res.ok) throw new Error(json.error?.message ?? "Gemini API error")
    return {
      content: json.candidates?.[0]?.content?.parts?.[0]?.text ?? "", model: opts.model, provider: "google_gemini",
      tokensInput: json.usageMetadata?.promptTokenCount ?? 0, tokensOutput: json.usageMetadata?.candidatesTokenCount ?? 0,
      latencyMs, cost: calculateCost(opts.model, json.usageMetadata?.promptTokenCount ?? 0, json.usageMetadata?.candidatesTokenCount ?? 0),
    }
  }
  async generateEmbedding(opts: AiEmbeddingOptions): Promise<AiEmbeddingResult> {
    const start = Date.now()
    const res = await fetch(`${this.baseUrl}/models/${opts.model}:embedContent?key=${this.apiKey}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: { parts: [{ text: typeof opts.input === "string" ? opts.input : opts.input.join("\n") }] } }),
    })
    const json = await res.json()
    const latencyMs = Date.now() - start
    if (!res.ok) throw new Error(json.error?.message ?? "Gemini embedding error")
    return {
      embeddings: [json.embedding?.values ?? []], model: opts.model, provider: "google_gemini",
      tokensInput: 0, latencyMs, cost: 0,
    }
  }
}

class LocalProvider implements AiProviderAdapter {
  name = "local"
  private baseUrl: string
  constructor(baseUrl = "http://localhost:11434") { this.baseUrl = baseUrl }
  async chatCompletion(opts: AiChatCompletionOptions): Promise<AiChatCompletionResult> {
    const start = Date.now()
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: opts.model, messages: opts.messages, options: { temperature: opts.temperature } }),
    })
    const json = await res.json()
    const latencyMs = Date.now() - start
    if (!res.ok) throw new Error(json.error ?? "Local model error")
    return {
      content: json.message?.content ?? "", model: opts.model, provider: "local",
      tokensInput: 0, tokensOutput: 0, latencyMs, cost: 0,
    }
  }
  async generateEmbedding(opts: AiEmbeddingOptions): Promise<AiEmbeddingResult> {
    const start = Date.now()
    const res = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: opts.model, prompt: typeof opts.input === "string" ? opts.input : opts.input.join("\n") }),
    })
    const json = await res.json()
    const latencyMs = Date.now() - start
    if (!res.ok) throw new Error(json.error ?? "Local embedding error")
    return { embeddings: [json.embedding ?? []], model: opts.model, provider: "local", tokensInput: 0, latencyMs, cost: 0 }
  }
}

export function createProvider(providerType: string, apiKey: string, baseUrl?: string): AiProviderAdapter {
  switch (providerType) {
    case "openai": return new OpenAIProvider(apiKey, baseUrl)
    case "anthropic": return new AnthropicProvider(apiKey, baseUrl)
    case "google_gemini": return new GeminiProvider(apiKey, baseUrl)
    case "local": return new LocalProvider(baseUrl)
    default: throw new Error(`Unsupported provider: ${providerType}`)
  }
}
