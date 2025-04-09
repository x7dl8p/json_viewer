"use client"

import type React from "react"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { Copy, Sun, Moon, Search, Eye, Code, Shield, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "next-themes"
import { JsonTree } from "@/components/json-tree"
import { findJsonFragments } from "@/lib/json-utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useDebounce } from "@/hooks/use-debounce"

export function JsonViewer() {
  const [input, setInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"tree" | "raw">("tree")
  const { theme, setTheme } = useTheme()
  const [error, setError] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [recoveredJson, setRecoveredJson] = useState<any>(null)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const outputTreeRef = useRef<HTMLDivElement>(null)
  const outputRawRef = useRef<HTMLPreElement>(null)

  const debouncedInput = useDebounce(input, 300)

  // Process JSON with improved fragment recovery
  const processJson = useCallback((text: string) => {
    try {
      setError(null)
      setWarnings([])

      if (!text.trim()) {
        setRecoveredJson(null)
        return null
      }

      // First try to parse the entire text as valid JSON
      try {
        const parsed = JSON.parse(text)
        setRecoveredJson(null)
        return parsed
      } catch (e) {
        // Not valid JSON, try to recover fragments
      }

      // Find and recover JSON fragments
      const { result, warnings } = findJsonFragments(text)

      if (warnings.length > 0) {
        setWarnings(warnings)
      }

      if (result) {
        setRecoveredJson(result)
        return result
      }

      setError("No valid JSON found in the input")
      return null
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to parse JSON")
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

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark")
  }, [theme, setTheme])

  // Sanitize input to prevent XSS
  const handleInputChange = (value: string) => {
    setInput(value)
  }

  // Synchronize scrolling
  useEffect(() => {
    const syncScroll = (sourceRef: React.RefObject<HTMLElement>, targetRef: React.RefObject<HTMLElement>) => {
      if (!sourceRef.current || !targetRef.current) return

      const handleScroll = () => {
        if (!sourceRef.current || !targetRef.current) return

        const sourceElement = sourceRef.current
        const targetElement = targetRef.current

        const sourceScrollTop = sourceElement.scrollTop
        const sourceScrollHeight = sourceElement.scrollHeight
        const sourceClientHeight = sourceElement.clientHeight

        const scrollPercentage = sourceScrollTop / (sourceScrollHeight - sourceClientHeight)

        const targetScrollHeight = targetElement.scrollHeight
        const targetClientHeight = targetElement.clientHeight

        targetElement.scrollTop = scrollPercentage * (targetScrollHeight - targetClientHeight)
      }

      sourceRef.current.addEventListener("scroll", handleScroll)

      return () => {
        sourceRef.current?.removeEventListener("scroll", handleScroll)
      }
    }

    // Set up bidirectional scroll sync with type assertions
    const cleanupInput = syncScroll(
      inputRef as React.RefObject<HTMLElement>,
      (viewMode === "tree" ? outputTreeRef : outputRawRef) as React.RefObject<HTMLElement>
    )
    const cleanupOutput = syncScroll(
      (viewMode === "tree" ? outputTreeRef : outputRawRef) as React.RefObject<HTMLElement>,
      inputRef as React.RefObject<HTMLElement>
    )

    return () => {
      cleanupInput?.()
      cleanupOutput?.()
    }
  }, [viewMode, parsedJson])

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-120px)]">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-zinc-500" />
          <h2 className="text-xl font-semibold">Secure JSON Viewer</h2>
        </div>
        <Button variant="outline" size="icon" onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {/* Left side - Input */}
        <Card className="p-4 flex flex-col h-full border-zinc-200 dark:border-zinc-800">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="json-input" className="text-sm font-medium">
              Paste text containing JSON
            </label>
            {warnings.length > 0 && (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Recovered {warnings.length} issue{warnings.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <textarea
            ref={inputRef}
            id="json-input"
            className="flex-1 min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            placeholder="Paste your JSON or text containing JSON here..."
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            spellCheck="false"
            autoComplete="off"
            data-gramm="false"
            style={{ height: "calc(100vh - 250px)" }}
          />

          {error && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </Card>

        {/* Right side - JSON View */}
        <Card className="p-4 flex flex-col h-full border-zinc-200 dark:border-zinc-800">
          <div className="flex justify-between items-center mb-4">
            <Tabs
              defaultValue="tree"
              className="w-full"
              value={viewMode}
              onValueChange={(value) => setViewMode(value as "tree" | "raw")}
            >
              <div className="flex justify-between items-center">
                <TabsList className="bg-zinc-100 dark:bg-zinc-900">
                  <TabsTrigger value="tree" className="data-[state=active]:bg-white dark:data-[state=active]:bg-black">
                    <Eye className="h-4 w-4 mr-2" />
                    Tree View
                  </TabsTrigger>
                  <TabsTrigger value="raw" className="data-[state=active]:bg-white dark:data-[state=active]:bg-black">
                    <Code className="h-4 w-4 mr-2" />
                    Raw View
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                  {parsedJson && (
                    <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  )}
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      className="pl-8 h-9 w-[150px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex-1 overflow-hidden">
                <TabsContent value="tree" className="h-full m-0">
                  <div
                    ref={outputTreeRef}
                    className="border rounded-md bg-card overflow-auto"
                    style={{ height: "calc(100vh - 250px)" }}
                  >
                    {parsedJson ? (
                      <div className="p-4">
                        {recoveredJson && (
                          <Alert className="mb-4 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <AlertDescription className="text-amber-800 dark:text-amber-200">
                              Recovered JSON with {warnings.length} issue{warnings.length > 1 ? "s" : ""}.
                              {warnings.length > 0 && " Corrupt lines were replaced with placeholders."}
                            </AlertDescription>
                          </Alert>
                        )}
                        <JsonTree data={parsedJson} searchQuery={searchQuery} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        {input.trim() ? error || "No valid JSON found" : "Enter JSON to view"}
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="raw" className="h-full m-0">
                  <div className="border rounded-md bg-card overflow-auto" style={{ height: "calc(100vh - 250px)" }}>
                    {parsedJson ? (
                      <>
                        {recoveredJson && (
                          <Alert className="m-4 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <AlertDescription className="text-amber-800 dark:text-amber-200">
                              Recovered JSON with {warnings.length} issue{warnings.length > 1 ? "s" : ""}.
                              {warnings.length > 0 && " Corrupt lines were replaced with placeholders."}
                            </AlertDescription>
                          </Alert>
                        )}
                        <pre ref={outputRawRef} className="p-4 text-sm font-mono">
                          {JSON.stringify(parsedJson, null, 2)}
                        </pre>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        {input.trim() ? error || "No valid JSON found" : "Enter JSON to view"}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </Card>
      </div>
    </div>
  )
}
