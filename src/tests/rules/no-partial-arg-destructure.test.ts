import rule from "../../rules/no-partial-arg-destructure"
import { RuleTester, getFixturesRootDir } from "../RuleTester"

const rootDir = getFixturesRootDir()
const ruleTester = new RuleTester({
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2018,
    tsconfigRootDir: rootDir,
    project: "./tsconfig.json",
  },
})

ruleTester.run("no-partial-arg-destructure", rule, {
  valid: [
    {
      code: `
type Params = {
  buzz: string
  bar: number
}
function Foo({buzz, bar}: Params) {}`,
    },
    {
      code: `
     type Params = {
       buzz: string
       bar: number
     }
     function Foo({buzz, ...rest}: Params) {}`,
    },
    {
      code: `
     type Params = {
       buzz: string
       bar: number
     }
     const Foo = ({buzz, ...rest}: Params) => {}`,
    },
    {
      code: `
     type Params = {
       buzz: string
       bar: number
     }
     const Foo = ({buzz}: Pick<Params, "buzz">) => {}`,
    },
    {
      code: `
     type Params = {
       buzz: string
       bar: number
     }
     function Foo(props: Params) {}`,
    },

    {
      code: `
     function Foo({}: {}) {}`,
    },
    {
      code: `
     function Foo({}: any) {}`,
    },
    {
      code: `
     type Params = {
       buzz: string
       bar: number
     }
     const Foo = (props: Params) => {}`,
    },
  ],
  invalid: [
    {
      code: `
     type Params = {
       buzz: string
       bar: number
     }
     function Foo({buzz}: Params) {}`,
      errors: [
        {
          messageId: "PartialArgDestructure",
          data: { unusedFields: ["bar"] },
        },
      ],
    },
    {
      // shouldn't matter if we use an interface or type
      code: `
     interface Params {
       buzz: string
       bar: number
     }
     function Foo({buzz}: Params) {}`,
      errors: [
        {
          messageId: "PartialArgDestructure",
          data: { unusedFields: ["bar"] },
        },
      ],
    },
    {
      // should also check arrow functions
      code: `
     type Params = {
       buzz: string
       bar: number
     }
     const Foo = ({buzz}: Params) => {}`,
      errors: [
        {
          messageId: "PartialArgDestructure",
          data: { unusedFields: ["bar"] },
        },
      ],
    },
  ],
})
