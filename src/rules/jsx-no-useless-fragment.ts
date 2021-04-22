// The MIT License (MIT)
//
// Copyright (c) 2014 Yannick Croissant
// Copyright (c) 2021 Steve Dignam
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/experimental-utils"
import {
  RuleContext,
  RuleFixer,
} from "@typescript-eslint/experimental-utils/dist/ts-eslint/Rule"
import * as pragmaUtil from "../pragma"
import { isFragment, isJSXAttributeKey } from "../jsx"
import * as util from "../utils"

function first<T>(array: T[]): T | undefined {
  return array[0]
}

function isJSXText(node: TSESTree.JSXChild): node is TSESTree.JSXText {
  return !!node && node.type === "JSXText"
}

function isOnlyWhitespace(text: string): boolean {
  return text.trim().length === 0
}

function isNonspaceJSXTextOrJSXCurly(node: TSESTree.JSXChild): boolean {
  return (
    (isJSXText(node) && !isOnlyWhitespace(node.raw)) ||
    node.type === "JSXExpressionContainer"
  )
}

/// Support <Foo bar={<>foo bar buzz</>} />
function isFragmentWithOnlyTextAndIsNotChild(
  node: TSESTree.JSXFragment | TSESTree.JSXElement
): boolean {
  return (
    node.children.length === 1 &&
    isJSXText(node.children[0]) &&
    !(node.parent?.type === "JSXElement" || node.parent?.type === "JSXFragment")
  )
}

function trimLikeReact(text: string): string {
  const leadingSpaces = /^\s*/.exec(text)
  if (leadingSpaces == null) {
    return text
  }
  const trailingSpaces = /\s*$/.exec(text)
  if (trailingSpaces == null) {
    return text
  }

  const start = leadingSpaces[0].includes("\n") ? leadingSpaces[0].length : 0
  const end = trailingSpaces[0].includes("\n")
    ? text.length - trailingSpaces[0].length
    : text.length

  return text.slice(start, end)
}

/**
 * Test if node is like `<Fragment key={_}>_</Fragment>`
 */
function isKeyedElement(
  node: TSESTree.JSXFragment | TSESTree.JSXElement
): boolean {
  return (
    node.type === "JSXElement" &&
    node.openingElement.attributes &&
    node.openingElement.attributes.some(isJSXAttributeKey)
  )
}

function containsCallExpression(node: TSESTree.JSXChild | undefined): boolean {
  return (
    node != null &&
    node.type === "JSXExpressionContainer" &&
    node.expression &&
    node.expression.type === "CallExpression"
  )
}

function isJSXFragmentWithEmptyExpr(node: TSESTree.JSXChild): boolean {
  return (
    node.type === "JSXFragment" &&
    node.children.length === 1 &&
    node.children[0].type === "JSXExpressionContainer" &&
    node.children[0].expression.type === AST_NODE_TYPES.JSXEmptyExpression
  )
}

/**
 * Test whether a node is an padding spaces trimmed by react runtime.
 */
function isPaddingSpaces(node: TSESTree.JSXChild): boolean {
  return (
    isJSXText(node) && isOnlyWhitespace(node.raw) && node.raw.includes("\n")
  )
}

/**
 * Test whether a JSXElement has less than two children, excluding paddings spaces.
 */
function hasLessThanTwoChildren(
  node: TSESTree.JSXElement | TSESTree.JSXFragment
): boolean {
  if (!node || !node.children) {
    return true
  }

  const nonPaddingChildren = node.children.filter(
    (child) => !isPaddingSpaces(child)
  )

  if (nonPaddingChildren.length < 2) {
    return !containsCallExpression(first(nonPaddingChildren))
  }
  return false
}

function isChildOfHtmlElement(
  node: TSESTree.JSXElement | TSESTree.JSXFragment
): boolean {
  return (
    node.parent?.type === "JSXElement" &&
    node.parent?.openingElement.name.type === "JSXIdentifier" &&
    /^[a-z]+$/.test(node.parent.openingElement.name.name)
  )
}

type Pragmas = { readonly reactPragma: string; readonly fragmentPragma: string }

function isChildOfComponentElement(
  node: TSESTree.JSXElement | TSESTree.JSXFragment,
  { reactPragma, fragmentPragma }: Pragmas
): boolean {
  return (
    node.parent?.type === "JSXElement" &&
    !isChildOfHtmlElement(node) &&
    !isFragment(node.parent, reactPragma, fragmentPragma)
  )
}

function canFix(
  node: TSESTree.JSXFragment | TSESTree.JSXElement,
  pragmas: Pragmas
): boolean {
  // Not safe to fix fragments without a jsx parent.
  if (isJSXFragmentWithEmptyExpr(node)) {
    return true
  }
  if (
    !(node.parent?.type === "JSXElement" || node.parent?.type === "JSXFragment")
  ) {
    // const a = <></>
    if (node.children.length === 0) {
      return false
    }

    // const a = <>cat {meow}</>
    if (node.children.some(isNonspaceJSXTextOrJSXCurly)) {
      return false
    }
  }

  // Not safe to fix `<Eeee><>foo</></Eeee>` because `Eeee` might require its children be a ReactElement.
  if (isChildOfComponentElement(node, pragmas)) {
    return false
  }

  return true
}

function getFix(
  node: TSESTree.JSXFragment | TSESTree.JSXElement,
  context: Readonly<RuleContext<MessageIds, []>>,
  pragmas: Pragmas
) {
  if (!canFix(node, pragmas)) {
    return undefined
  }

  if (isJSXFragmentWithEmptyExpr(node)) {
    return function fix(fixer: RuleFixer) {
      return fixer.replaceText(node, "<></>")
    }
  }

  return function fix(fixer: RuleFixer) {
    const opener =
      node.type === AST_NODE_TYPES.JSXElement
        ? node.openingElement
        : node.openingFragment
    const closer =
      node.type === AST_NODE_TYPES.JSXElement
        ? node.closingElement
        : node.closingFragment

    const childrenText =
      opener.type === AST_NODE_TYPES.JSXOpeningElement && opener.selfClosing
        ? ""
        : context
            .getSourceCode()
            .getText()
            .slice(opener.range[1], closer?.range[0])

    return fixer.replaceText(node, trimLikeReact(childrenText))
  }
}

function hasSafeInnerExpr(
  node: TSESTree.JSXFragment | TSESTree.JSXElement
): boolean {
  // allow <></>
  if (node.children.length === 0) {
    return false
  }

  const nonPaddingChildren = node.children.filter(
    (child) => !isPaddingSpaces(child)
  )
  // allow <> {foo} </>
  if (
    nonPaddingChildren.length === 1 &&
    nonPaddingChildren[0].type === AST_NODE_TYPES.JSXExpressionContainer &&
    !isChildOfHtmlElement(node)
  ) {
    return false
  }

  return true
}

function checkNode(
  node: TSESTree.JSXFragment | TSESTree.JSXElement,
  context: Readonly<RuleContext<MessageIds, []>>,
  pragmas: Pragmas
): void {
  if (isKeyedElement(node)) {
    return
  }
  if (
    isJSXFragmentWithEmptyExpr(node) ||
    (hasLessThanTwoChildren(node) &&
      !isFragmentWithOnlyTextAndIsNotChild(node) &&
      hasSafeInnerExpr(node))
  ) {
    context.report({
      node,
      messageId: "NeedsMoreChidren",
      fix: getFix(node, context, pragmas),
    })
  }

  if (isChildOfHtmlElement(node)) {
    context.report({
      node,
      messageId: "ChildOfHtmlElement",
      fix: getFix(node, context, pragmas),
    })
  }
}

export type MessageIds = "NeedsMoreChidren" | "ChildOfHtmlElement"

export default util.createRule<[], MessageIds>({
  name: "jsx-no-useless-fragment",
  meta: {
    type: "suggestion",
    fixable: "code",
    docs: {
      description: "Disallow unnecessary fragments",
      category: "Best Practices",
      recommended: "error",
    },
    messages: {
      NeedsMoreChidren:
        "Fragments should contain either an expression or at least two children.",
      ChildOfHtmlElement: "Passing a fragment to an HTML element is useless.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const reactPragma = pragmaUtil.getFromContext(context)
    const fragmentPragma = pragmaUtil.getFragmentFromContext(context)

    return {
      JSXElement(node): void {
        if (isFragment(node, reactPragma, fragmentPragma)) {
          checkNode(node, context, { reactPragma, fragmentPragma })
        }
      },
      JSXFragment(node): void {
        checkNode(node, context, { reactPragma, fragmentPragma })
      },
    }
  },
})
