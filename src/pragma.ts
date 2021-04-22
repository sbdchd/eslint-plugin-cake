import { RuleContext } from "@typescript-eslint/experimental-utils/dist/ts-eslint"
import { MessageIds } from "./rules/jsx-no-useless-fragment"
import * as t from "io-ts"
import { isRight } from "fp-ts/lib/Either"

const ReactSettings = t.type({
  react: t.type({
    fragment: t.union([t.string, t.undefined]),
    pragma: t.union([t.string, t.undefined]),
  }),
})

const JSX_ANNOTATION_REGEX = /@jsx\s+([^\s]+)/
// Does not check for reserved keywords or unicode characters
const JS_IDENTIFIER_REGEX = /^[_$a-zA-Z][_$a-zA-Z0-9]*$/

export function getFragmentFromContext(
  context: Readonly<RuleContext<MessageIds, []>>
) {
  let pragma = "Fragment"

  const settings = ReactSettings.decode(context.settings)
  // .eslintrc shared settings (http://eslint.org/docs/user-guide/configuring#adding-shared-settings)
  if (
    isRight(settings) &&
    settings.right.react &&
    settings.right.react.fragment
  ) {
    pragma = settings.right.react.fragment
  }
  if (!JS_IDENTIFIER_REGEX.test(pragma)) {
    throw new Error(`Fragment pragma ${pragma} is not a valid identifier`)
  }
  return pragma
}

export function getFromContext(context: Readonly<RuleContext<MessageIds, []>>) {
  let pragma: string | undefined = "React"

  const sourceCode = context.getSourceCode()
  const pragmaNode = sourceCode
    .getAllComments()
    .find((node) => JSX_ANNOTATION_REGEX.test(node.value))

  if (pragmaNode) {
    const matches = JSX_ANNOTATION_REGEX.exec(pragmaNode.value)
    pragma = matches?.[1].split(".")[0]
    // .eslintrc shared settings (http://eslint.org/docs/user-guide/configuring#adding-shared-settings)
  } else {
    const settings = ReactSettings.decode(context.settings)
    if (isRight(settings) && settings.right.react.pragma) {
      pragma = settings.right.react.pragma
    }
  }

  if (pragma == null || !JS_IDENTIFIER_REGEX.test(pragma)) {
    throw new Error(`React pragma ${pragma} is not a valid identifier`)
  }
  return pragma
}
