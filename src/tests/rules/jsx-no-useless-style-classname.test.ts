import rule from "../../rules/jsx-no-useless-style-classname"
import { RuleTester, getFixturesRootDir } from "../RuleTester"

const rootDir = getFixturesRootDir()
const ruleTester = new RuleTester({
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2018,
    tsconfigRootDir: rootDir,
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
})

ruleTester.run("jsx-no-useless-style-classname", rule, {
  valid: [
    {
      code: "<Section style={{}} />",
    },
    {
      code: "<Section className={''} />",
    },
    {
      code: `<Section className="" />`,
    },
    {
      code: "<Section className={``} />",
    },
    {
      code: "<div className={`foo`} />",
    },
    {
      code: "<div className={'bar'} />",
    },
    {
      code: `<div className="buzz" />`,
    },
    {
      code: `<div style={{height: 100}} />`,
    },
  ],
  invalid: [
    {
      code: "<section style={{}} />",
      errors: [{ messageId: "EmptyStyleProp" }],
    },
    {
      code: "<section className={''} />",
      errors: [{ messageId: "EmptyClassNameProp" }],
    },
    {
      code: `<section className="" />`,
      errors: [{ messageId: "EmptyClassNameProp" }],
    },
    {
      code: "<section className={``} />",
      errors: [{ messageId: "EmptyClassNameProp" }],
    },
    {
      code: `<section style={{}} className="" />`,
      errors: [
        { messageId: "EmptyStyleProp" },
        { messageId: "EmptyClassNameProp" },
      ],
    },
  ],
})
