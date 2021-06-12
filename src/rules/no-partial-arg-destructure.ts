import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/experimental-utils"
import { RuleContext } from "@typescript-eslint/experimental-utils/dist/ts-eslint/Rule"
import * as util from "../utils"

function missingFieldsInType(
  node: TSESTree.ObjectPattern,
  context: Readonly<RuleContext<MessageIds, []>>
): boolean {
  const parserServices = util.getParserServices(context)
  const typeChecker = parserServices.program.getTypeChecker()
  const objectType = typeChecker.getTypeAtLocation(
    parserServices.esTreeNodeToTSNodeMap.get(node)
  )
  return node.properties.length < objectType.getProperties().length
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
    if (missingFieldsInType(node.params[0], context))
      context.report({
        node,
        messageId: "PartialArgDestructure",
      })
  }
}

type MessageIds = "PartialArgDestructure"

export default util.createRule<[], MessageIds>({
  name: "no-partial-arg-destructure",
  meta: {
    type: "suggestion",
    fixable: "code",
    docs: {
      description: "Usused params can hide dead code.",
      category: "Best Practices",
      recommended: "error",
    },
    messages: {
      PartialArgDestructure:
        "All params must be destructured, consider removing the unused fields from the param type.",
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
