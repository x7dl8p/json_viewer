"use client"

import type React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JsonTree } from "@/components/json-tree"

import { Card } from "@/components/ui/card"

interface JsonViewerProps {
  parsedJson: any
  viewMode: "tree" | "raw"
  setViewMode: (mode: "tree" | "raw") => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  handleCopyToClipboard: () => void
  error: string | null
  outputTreeRef: React.RefObject<HTMLDivElement | null>
  outputRawRef: React.RefObject<HTMLPreElement | null>
}

export function JsonViewer({
  parsedJson,
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  handleCopyToClipboard,
  error,
  outputTreeRef,
  outputRawRef,
}: JsonViewerProps) {
  return (
    <div className="flex flex-col h-[90vh] border p-4">

      {/* Content area with proper scrolling */}
      <div className="flex-1 bg-card rounded-md overflow-auto">
        <Tabs
          value={viewMode}
          onValueChange={(value) => setViewMode(value as "tree" | "raw")}
          className="h-full"
        >
          <TabsContent value="tree" className="h-full m-0">
            <div
              ref={outputTreeRef}
              className="h-full p-4"
            >
              {parsedJson ? (
                <div>
                  <JsonTree data={parsedJson} searchQuery={searchQuery} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  {error || "Enter JSON to view"}
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="raw" className="h-full m-0">
            <div className="h-full p-4">
              {parsedJson ? (
                <div>
                  <pre ref={outputRawRef} className="text-sm font-mono">
                    {JSON.stringify(parsedJson, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  {error || "Enter JSON to view"}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}