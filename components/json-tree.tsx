"use client"

import { useState, memo, useCallback } from "react"
import { ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface JsonTreeProps {
  data: any
  searchQuery?: string
  path?: string
}

export const JsonTree = memo(function JsonTree({ data, searchQuery = "", path = "" }: JsonTreeProps) {
  const [expanded, setExpanded] = useState(true)

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev)
  }, [])

  if (data === null) {
    return <span className="text-gray-500">null</span>
  }

  if (typeof data === "undefined") {
    return <span className="text-gray-500">undefined</span>
  }

  if (typeof data === "string") {
    const highlighted = searchQuery && data.toLowerCase().includes(searchQuery.toLowerCase())
    return (
      <span className={cn("text-green-600 dark:text-green-400", highlighted && "bg-yellow-200 dark:bg-yellow-800")}>
        "{data}"
      </span>
    )
  }

  if (typeof data === "number") {
    return <span className="text-blue-600 dark:text-blue-400">{data}</span>
  }

  if (typeof data === "boolean") {
    return <span className="text-purple-600 dark:text-purple-400">{data.toString()}</span>
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <span className="text-gray-500">[]</span>
    }

    return (
      <div>
        <div
          className="flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 -ml-6 pl-6"
          onClick={toggleExpanded}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4 inline mr-1 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 inline mr-1 text-gray-500" />
          )}
          <span className="text-gray-500">Array({data.length})</span>
          {!expanded && <span className="text-gray-500 ml-2">[...]</span>}
        </div>

        {expanded && (
          <div className="ml-4 border-l border-gray-300 dark:border-gray-700 pl-2">
            {data.map((item, index) => (
              <div key={index} className="my-1">
                <span className="text-gray-500 mr-2">{index}:</span>
                <JsonTree data={item} searchQuery={searchQuery} path={path ? `${path}[${index}]` : `[${index}]`} />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (typeof data === "object") {
    const keys = Object.keys(data)

    if (keys.length === 0) {
      return <span className="text-gray-500">{"{}"}</span>
    }

    return (
      <div>
        <div
          className="flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 -ml-6 pl-6"
          onClick={toggleExpanded}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4 inline mr-1 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 inline mr-1 text-gray-500" />
          )}
          <span className="text-gray-500">Object({keys.length})</span>
          {!expanded && <span className="text-gray-500 ml-2">{"..."}</span>}
        </div>

        {expanded && (
          <div className="ml-4 border-l border-gray-300 dark:border-gray-700 pl-2">
            {keys.map((key) => {
              const highlightedKey = searchQuery && key.toLowerCase().includes(searchQuery.toLowerCase())
              return (
                <div key={key} className="my-1">
                  <span
                    className={cn(
                      "text-red-600 dark:text-red-400 mr-2",
                      highlightedKey && "bg-yellow-200 dark:bg-yellow-800",
                    )}
                  >
                    "{key}":
                  </span>
                  <JsonTree data={data[key]} searchQuery={searchQuery} path={path ? `${path}.${key}` : key} />
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return <span>{String(data)}</span>
})
