import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/experimental-utils"
import { RuleContext } from "@typescript-eslint/experimental-utils/dist/ts-eslint/Rule"
import { difference } from "lodash"
import * as util from "../utils"

const ALLOWED_UNUSED_PROPERTIES = new Set([
  "history",
  "location",
  "match",
  "staticContext",
])

function getUnusedFields(
  node: TSESTree.ObjectPattern,
  context: Readonly<RuleContext<MessageIds, []>>
) {
  const parserServices = util.getParserServices(context)
  const typeChecker = parserServices.program.getTypeChecker()
  const objectType = typeChecker.getTypeAtLocation(
    parserServices.esTreeNodeToTSNodeMap.get(node)
  )

  const typeProperties = objectType
    .getProperties()
    .map((x) => x.name)
    .filter((x) => !ALLOWED_UNUSED_PROPERTIES.has(x))

  const paramProperties: string[] = []
  for (const prop of node.properties) {
    if (
      prop.type === AST_NODE_TYPES.Property &&
      prop.key.type === AST_NODE_TYPES.Identifier
    ) {
      paramProperties.push(prop.key.name)
    }
  }

  return difference(typeProperties, paramProperties)
}

function checkNode(
  node: TSESTree.FunctionDeclaration | TSESTree.ArrowFunctionExpression,
  context: Readonly<RuleContext<MessageIds, []>>
): void {
  if (
    node.params.length === 1 &&
    node.params[0].type === AST_NODE_TYPES.ObjectPattern &&
    node.params[0].properties.every(
      (param) => param.type !== AST_NODE_TYPES.RestElement
    )
  ) {
    const unusedFields = getUnusedFields(node.params[0], context)
    if (unusedFields.length > 0)
      context.report({
        node: node.params[0],
        data: {
          unusedFields,
        },
        messageId: "PartialArgDestructure",
      })
  }
}

type MessageIds = "PartialArgDestructure"

export default util.createRule<[], MessageIds>({
  name: "no-partial-arg-destructure",
  meta: {
    type: "suggestion",
    docs: {
      description: "Usused params can hide dead code.",
      category: "Best Practices",
      recommended: "error",
    },
    messages: {
      PartialArgDestructure:
        "Remove the unused fields in param type: '{{ unusedFields }}'.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      FunctionDeclaration(node): void {
        checkNode(node, context)
      },
      VariableDeclaration(node): void {
        for (const decl of node.declarations) {
          if (decl.init?.type === AST_NODE_TYPES.ArrowFunctionExpression) {
            checkNode(decl.init, context)
          }
        }
      },
    }
  },
})
