/**
 * Extracts valid JSON from a string that might contain other text
 * @param text Text that may contain JSON
 * @returns Parsed JSON object or null if no valid JSON found
 */
export function extractJson(text: string): any {
  if (!text.trim()) return null

  // Security: Set a reasonable size limit to prevent DoS attacks
  if (text.length > 10000000) {
    // 10MB limit
    throw new Error("Input exceeds maximum allowed size")
  }

  // Try parsing the entire text as JSON first
  try {
    // Use a safer JSON parsing approach
    return JSON.parse(text)
  } catch (e) {
    // Not valid JSON, try to extract JSON from the text
  }

  // Look for patterns that might indicate JSON objects or arrays
  const jsonPatterns = [
    // Find objects: {...}
    /\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\}/g,
    // Find arrays: [...]
    /\[(?:[^[\]]|(?:\[(?:[^[\]]|(?:\[[^[\]]*\]))*\]))*\]/g,
  ]

  let largestMatch = ""
  let largestParsed = null

  for (const pattern of jsonPatterns) {
    const matches = text.match(pattern)
    if (matches) {
      // Try each match to see if it's valid JSON
      for (const match of matches) {
        try {
          // Skip if we've already found a larger valid JSON
          if (match.length <= largestMatch.length) continue

          // Security: Avoid using eval() or Function constructor
          const parsed = JSON.parse(match)

          // Keep track of the largest valid JSON found
          largestMatch = match
          largestParsed = parsed
        } catch (e) {
          // Not valid JSON, continue to the next match
        }
      }
    }
  }

  return largestParsed
}

/**
 * Finds and recovers JSON fragments from corrupted input
 * @param text Text that may contain corrupted JSON
 * @returns Object containing recovered JSON and warnings
 */
export function findJsonFragments(text: string): { result: any; warnings: string[] } {
  if (!text.trim()) return { result: null, warnings: [] }

  // Security: Set a reasonable size limit to prevent DoS attacks
  if (text.length > 10000000) {
    throw new Error("Input exceeds maximum allowed size")
  }

  const warnings: string[] = []

  // Try parsing the entire text as JSON first
  try {
    const parsed = JSON.parse(text)
    return { result: parsed, warnings: [] }
  } catch (e) {
    // Not valid JSON, try to recover fragments
    const error = e as Error
    warnings.push(`Invalid JSON: ${error.message}`)
  }

  // Attempt to identify and fix common JSON errors
  const fixedText = text

  // Step 1: Try to identify the structure (object or array)
  const trimmed = text.trim()
  const isObject = trimmed.startsWith("{") && trimmed.endsWith("}")
  const isArray = trimmed.startsWith("[") && trimmed.endsWith("]")

  if (!isObject && !isArray) {
    // Try to find the largest valid JSON fragment
    return { result: extractJson(text), warnings: [...warnings, "Could not determine JSON structure"] }
  }

  // Step 2: Split the text into lines for analysis
  const lines = text.split("\n")
  const fixedLines: string[] = []
  let inString = false
  const bracketStack: string[] = []
  let currentLine = ""
  let lineNumber = 0
  const corruptLineNumbers: number[] = []

  // First pass: identify corrupt lines
  for (const line of lines) {
    lineNumber++
    let isCorruptLine = false

    // Process each character to track strings and brackets
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const prevChar = i > 0 ? line[i - 1] : ""

      // Handle string boundaries
      if (char === '"' && prevChar !== "\\") {
        inString = !inString
      }

      // Only process brackets outside of strings
      if (!inString) {
        if ("{[".includes(char)) {
          bracketStack.push(char)
        } else if ("}]".includes(char)) {
          const lastBracket = bracketStack.pop()
          // Check for mismatched brackets
          if ((char === "}" && lastBracket !== "{") || (char === "]" && lastBracket !== "[")) {
            isCorruptLine = true
            warnings.push(`Mismatched brackets at line ${lineNumber}`)
            break
          }
        }
      }

      // Check for invalid control characters in strings
      if (inString && char.charCodeAt(0) < 32 && char !== "\t") {
        isCorruptLine = true
        warnings.push(`Invalid control character at line ${lineNumber}`)
        break
      }
    }

    // Check for unclosed strings
    if (inString) {
      isCorruptLine = true
      inString = false // Reset for next line
      warnings.push(`Unclosed string at line ${lineNumber}`)
    }

    // Check for invalid JSON syntax
    try {
      // Try to parse this line with some context
      const testJson = isObject
        ? `{${currentLine}${currentLine ? "," : ""}${line}}`
        : `[${currentLine}${currentLine ? "," : ""}${line}]`
      JSON.parse(testJson)
      currentLine += (currentLine ? "," : "") + line
    } catch (e) {
      // This might be a corrupt line, but could also be an incomplete fragment
      // We'll mark potentially corrupt lines
      if (
        line.includes(":") &&
        (line.includes("{") || line.includes("}") || line.includes("[") || line.includes("]"))
      ) {
        isCorruptLine = true
        warnings.push(`Potentially corrupt JSON at line ${lineNumber}`)
      }
    }

    if (isCorruptLine) {
      corruptLineNumbers.push(lineNumber)
    }
  }

  // Second pass: reconstruct valid JSON
  let reconstructed = ""
  let isFirstLine = true
  lineNumber = 0

  if (isObject) {
    reconstructed = "{\n"
  } else if (isArray) {
    reconstructed = "[\n"
  }

  for (const line of lines) {
    lineNumber++

    if (corruptLineNumbers.includes(lineNumber)) {
      // Replace corrupt line with a placeholder comment
      reconstructed += `  ${isObject ? '"__corrupt_line_' + lineNumber + '": null' : "null"}${isFirstLine ? "" : ","}\n`
    } else {
      // Keep valid line
      reconstructed += `  ${line.trim()}${isFirstLine || lineNumber === lines.length ? "" : ","}\n`
    }

    isFirstLine = false
  }

  if (isObject) {
    reconstructed += "}"
  } else if (isArray) {
    reconstructed += "]"
  }

  // Try to parse the reconstructed JSON
  try {
    const result = JSON.parse(reconstructed)
    return { result, warnings }
  } catch (e) {
    // If reconstruction failed, fall back to extracting the largest valid fragment
    const extracted = extractJson(text)
    if (extracted) {
      warnings.push("Reconstruction failed, using largest valid fragment")
      return { result: extracted, warnings }
    }

    return { result: null, warnings: [...warnings, "Could not recover any valid JSON"] }
  }
}

/**
 * Virtualized rendering helper - determines if a node should be rendered
 * based on search query and visibility constraints
 */
export function shouldRenderNode(path: string, searchQuery: string, expandedPaths: Set<string>): boolean {
  if (!searchQuery) {
    // If no search query, render based on expanded state
    const pathParts = path.split(".")
    let currentPath = ""

    for (let i = 0; i < pathParts.length - 1; i++) {
      currentPath += (currentPath ? "." : "") + pathParts[i]
      if (!expandedPaths.has(currentPath)) {
        return false
      }
    }
    return true
  }

  // If there's a search query, we might want to show this node
  // even if parent is collapsed, if it matches the search
  return true
}

/**
 * Safely stringify JSON with circular reference handling
 */
export function safeStringify(obj: any, indent = 2): string {
  const seen = new WeakSet()
  return JSON.stringify(
    obj,
    (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular Reference]"
        }
        seen.add(value)
      }
      return value
    },
    indent,
  )
}
