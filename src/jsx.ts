import { TSESTree } from "@typescript-eslint/experimental-utils"

export function isFragment(
  node: TSESTree.JSXElement,
  reactPragma: string,
  fragmentPragma: string
): boolean {
  const name = node.openingElement.name

  // <Fragment>
  if (name.type === "JSXIdentifier" && name.name === fragmentPragma) {
    return true
  }

  // <React.Fragment>
  if (
    name.type === "JSXMemberExpression" &&
    name.object.type === "JSXIdentifier" &&
    name.object.name === reactPragma &&
    name.property.type === "JSXIdentifier" &&
    name.property.name === fragmentPragma
  ) {
    return true
  }

  return false
}

/**
 * Check if node is like `key={...}` as in `<Foo key={...} />`
 */
export function isJSXAttributeKey(
  node: TSESTree.JSXAttribute | TSESTree.JSXSpreadAttribute
): boolean {
  return (
    node.type === "JSXAttribute" &&
    node.name &&
    node.name.type === "JSXIdentifier" &&
    node.name.name === "key"
  )
}
