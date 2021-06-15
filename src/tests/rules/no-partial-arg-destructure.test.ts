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
    {
      // Basically allow the react-router `withRouter` HOC to work
      // see: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/e8adb15343a83fdd6f117bcd77783233e9210c21/types/react-router/index.d.ts#L180-L182
      code: `
interface RouteComponentProps {
  history: unknown
  location: unknown
  match: unknown
  staticContext?: unknown
}

interface FooProps extends RouteComponentProps {
    title: string
}

function Foo({title}: FooProps) {}
`,
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
