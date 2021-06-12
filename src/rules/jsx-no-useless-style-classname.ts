import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/experimental-utils"
import { RuleContext } from "@typescript-eslint/experimental-utils/dist/ts-eslint/Rule"
import * as util from "../utils"

function isBuiltinElement(node: TSESTree.JSXOpeningElement): boolean {
  return node.name.type === "JSXIdentifier" && /^[a-z]+$/.test(node.name.name)
}

function hasEmptyStyleProp(node: TSESTree.JSXOpeningElement): boolean {
  return (
    node.attributes.length > 0 &&
    node.attributes.some(
      (x) =>
        x.type === AST_NODE_TYPES.JSXAttribute &&
        typeof x.name.name === "string" &&
        x.name.name === "style" &&
        x.value?.type === AST_NODE_TYPES.JSXExpressionContainer &&
        x.value.expression.type === AST_NODE_TYPES.ObjectExpression &&
        x.value.expression.properties.length === 0
    )
  )
}

function isEmptyStringExpr(
  node: TSESTree.JSXEmptyExpression | TSESTree.Expression
): boolean {
  return (
    (node.type === AST_NODE_TYPES.Literal && node.value === "") ||
    (node.type === AST_NODE_TYPES.TemplateLiteral &&
      node.expressions.length === 0 &&
      node.quasis.length === 1 &&
      node.quasis[0].value.cooked === "")
  )
}

function hasEmptyClassNameProp(node: TSESTree.JSXOpeningElement): boolean {
  return (
    node.attributes.length > 0 &&
    node.attributes.some(
      (x) =>
        x.type === AST_NODE_TYPES.JSXAttribute &&
        typeof x.name.name === "string" &&
        x.name.name === "className" &&
        ((x.value?.type === AST_NODE_TYPES.Literal && x.value.value === "") ||
          (x.value?.type === AST_NODE_TYPES.JSXExpressionContainer &&
            isEmptyStringExpr(x.value.expression)))
    )
  )
}
function checkNode(
  node: TSESTree.JSXOpeningElement,
  context: Readonly<RuleContext<MessageIds, []>>
): void {
  if (hasEmptyStyleProp(node)) {
    context.report({
      node,
      messageId: "EmptyStyleProp",
    })
  }

  if (hasEmptyClassNameProp(node)) {
    context.report({
      node,
      messageId: "EmptyClassNameProp",
    })
  }
}

type MessageIds = "EmptyClassNameProp" | "EmptyStyleProp"

export default util.createRule<[], MessageIds>({
  name: "jsx-no-useless-style-classname",
  meta: {
    type: "suggestion",
    fixable: "code",
    docs: {
      description: "Disallow unnecessary style and className props.",
      category: "Best Practices",
      recommended: "error",
    },
    messages: {
      EmptyStyleProp: "An empty style prop is a no-op.",
      EmptyClassNameProp: "An empty className is a no-op.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      JSXOpeningElement(node): void {
        if (isBuiltinElement(node)) {
          checkNode(node, context)
        }
      },
    }
  },
})
