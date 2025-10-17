"use client"

import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface JsonInputProps {
  input: string
  setInput: (value: string) => void
  error: string | null
  inputRef: React.RefObject<HTMLTextAreaElement | null>
}

export function JsonInput({ input, setInput, error, inputRef }: JsonInputProps) {
  return (
    <div className="flex flex-col h-full border p-4">
      {/* Input area without extra borders */}
      <div className="flex-1 bg-card rounded-md">
        <textarea
          ref={inputRef}
          id="json-input"
          className="w-full h-full p-4 text-sm font-mono bg-transparent border-none outline-none resize-none"
          placeholder="Paste your JSON or text containing JSON here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck="false"
          autoComplete="off"
          data-gramm="false"
        />
      </div>
    </div>
  )
}