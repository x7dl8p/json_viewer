"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { Footer } from "@/components/footer"
import { JsonInput } from "@/components/json-input"
import { JsonViewer } from "@/components/json-viewer"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { useDebounce } from "@/hooks/use-debounce"

export function JsonMain() {
  const [mounted, setMounted] = useState(false)
  const [input, setInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"tree" | "raw">("tree")
  const [error, setError] = useState<string | null>(null)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const outputTreeRef = useRef<HTMLDivElement>(null)
  const outputRawRef = useRef<HTMLPreElement>(null)

  const debouncedInput = useDebounce(input, 300)

  // Process JSON - simple parsing only
  const processJson = useCallback((text: string) => {
    try {
      setError(null)

      if (!text.trim()) {
        return null
      }

      // Try to parse as valid JSON
      return JSON.parse(text)
    } catch (error) {
      setError("Invalid JSON")
      return null
    }
  }, [])

  const parsedJson = useMemo(() => {
    return processJson(debouncedInput)
  }, [debouncedInput, processJson])

  const handleCopyToClipboard = useCallback(() => {
    if (parsedJson) {
      navigator.clipboard.writeText(
        viewMode === "raw" ? JSON.stringify(parsedJson) : JSON.stringify(parsedJson, null, 2),
      )
    }
  }, [parsedJson, viewMode])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex-grow flex-col bg-background rounded-none">
      {/* Main content area with better spacing */}
      <div className="flex-1">
        <PanelGroup direction="horizontal" className="h-full bg-card rounded-lg shadow-sm">
          <Panel defaultSize={50} minSize={20}>
            <div className="h-full">
              <JsonInput
                input={input}
                setInput={setInput}
                error={error}
                inputRef={inputRef}
              />
            </div>
          </Panel>

          <PanelResizeHandle className="w-0.5 bg-border hover:bg-primary transition-colors mx-4" />

          <Panel minSize={30}>
            <div className="h-full">
              <JsonViewer
                parsedJson={parsedJson}
                viewMode={viewMode}
                setViewMode={setViewMode}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleCopyToClipboard={handleCopyToClipboard}
                error={error}
                outputTreeRef={outputTreeRef}
                outputRawRef={outputRawRef}
              />
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {/* Footer at bottom */}
      <div className="mt-4">
          <Footer
            mounted={mounted}
            parsedJson={parsedJson}
            viewMode={viewMode}
            setViewMode={setViewMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleCopyToClipboard={handleCopyToClipboard}
          />
      </div>
    </div>
  )
}
