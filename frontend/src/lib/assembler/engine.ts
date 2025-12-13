
/**
 * Spintax Processing Engine
 * Handles nested spintax formats: {option1|option2|{nested1|nested2}}
 */

export function processSpintax(text: string): string {
  if (!text) return '';

  // Regex to find the innermost spintax group { ... }
  const spintaxRegex = /\{([^{}]*)\}/;

  let processedText = text;
  let match = spintaxRegex.exec(processedText);

  // Keep processing until no more spintax groups are found
  while (match) {
    const fullMatch = match[0]; // e.g., "{option1|option2}"
    const content = match[1];   // e.g., "option1|option2"

    const options = content.split('|');
    const randomOption = options[Math.floor(Math.random() * options.length)];

    processedText = processedText.replace(fullMatch, randomOption);

    // Re-check for remaining matches (including newly exposed or remaining groups)
    match = spintaxRegex.exec(processedText);
  }

  return processedText;
}

/**
 * Variable Substitution Engine
 * Replaces {{variable_name}} with provided values.
 * Supports fallback values: {{variable_name|default_value}}
 */
export function processVariables(text: string, variables: Record<string, string>): string {
  if (!text) return '';

  return text.replace(/\{\{([^}]+)\}\}/g, (match, variableKey) => {
    // Check for default value syntax: {{city|New York}}
    const [key, defaultValue] = variableKey.split('|');

    const cleanKey = key.trim();
    const value = variables[cleanKey];

    if (value !== undefined && value !== null && value !== '') {
      return value;
    }

    return defaultValue ? defaultValue.trim() : match; // Return original if no match and no default
  });
}

/**
 * Master Assembly Function
 * Runs spintax first, then variable substitution.
 */
export function assembleContent(template: string, variables: Record<string, string>): string {
  // 1. Process Spintax (Randomize structure)
  const spunContent = processSpintax(template);

  // 2. Substitute Variables (Inject specific data)
  const finalContent = processVariables(spunContent, variables);

  return finalContent;
}
