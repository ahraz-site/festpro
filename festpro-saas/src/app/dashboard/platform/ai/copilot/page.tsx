"use client"

import { useState, useRef, useEffect } from "react"
import { copilotChat } from "@/lib/actions/ai"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AI_AGENT_ROLES } from "@/config/ai-platform"
import { Bot, Send, User, Loader2, MessageSquare } from "lucide-react"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  sources?: { title: string; content: string; relevance: number }[]
}

export default function AiCopilotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState("admin_copilot")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  async function handleSend() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMsg }])
    setLoading(true)
    try {
      const result = await copilotChat({ message: userMsg, agent_role: selectedAgent as any })
      if ("error" in result) throw new Error(result.error)
      setMessages((prev) => [...prev, { role: "assistant", content: result.data.message, sources: result.data.sources }])
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${e.message}` }])
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Copilot</h1>
        <p className="text-sm text-gray-500">Chat with AI assistants for festival management</p>
      </div>
      <div className="flex gap-3 mb-2 flex-wrap">
        {AI_AGENT_ROLES.map((a) => (
          <button key={a.value} onClick={() => setSelectedAgent(a.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedAgent === a.value ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >{a.label}</button>
        ))}
      </div>
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bot className="h-4 w-4" />
            {AI_AGENT_ROLES.find((a) => a.value === selectedAgent)?.label ?? "AI Copilot"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4 py-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 py-12">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Ask a question to start chatting with the AI copilot</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "assistant" ? "" : "flex-row-reverse"}`}>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                m.role === "assistant" ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-600"
              }`}>
                {m.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div className={`flex-1 max-w-[80%] ${m.role === "assistant" ? "" : "text-right"}`}>
                <div className={`inline-block rounded-lg px-4 py-2 text-sm ${
                  m.role === "assistant" ? "bg-gray-100 text-gray-900" : "bg-indigo-600 text-white"
                }`}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
                {m.sources && m.sources.length > 0 && (
                  <details className="mt-1 text-xs text-gray-500">
                    <summary className="cursor-pointer hover:text-gray-700">Sources ({m.sources.length})</summary>
                    <div className="mt-1 space-y-1">
                      {m.sources.map((s, si) => (
                        <p key={si} className="truncate text-gray-400"><strong>{s.title}</strong>: {s.content.slice(0, 100)}...</p>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        <div className="border-t p-4">
          <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask the AI copilot..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            <button type="submit" disabled={loading || !input.trim()}
              className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </Card>
    </div>
  )
}
