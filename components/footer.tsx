"use client"

import { Sun, Moon, File, User, Copy, Search, Eye, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"

interface FooterProps {
  mounted: boolean
  parsedJson: any
  viewMode: "tree" | "raw"
  setViewMode: (mode: "tree" | "raw") => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  handleCopyToClipboard: () => void
}

export function Footer({
  mounted,
  parsedJson,
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  handleCopyToClipboard
}: FooterProps) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="flex justify-between items-center bg-card">
      <div className="flex items-center gap-2">
        <File className="h-5 w-5 text-zinc-500" />
        <h2 className="text-xl font-semibold">AWSM JSON</h2>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <Tabs
          value={viewMode}
          onValueChange={(value) => setViewMode(value as "tree" | "raw")}
        >
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
        </Tabs>

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
        <Button variant="outline" size="icon" onClick={toggleTheme}>
          {mounted && (theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => window.open("https://mohammad.is-a.dev", "_blank", "noopener,noreferrer")}
        >
          <User className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}