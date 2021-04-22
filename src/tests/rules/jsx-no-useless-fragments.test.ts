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
import rule from "../../rules/jsx-no-useless-fragment"
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

ruleTester.run("jsx-no-useless-fragment", rule, {
  valid: [
    {
      // wrapping text and div children
      code: "<>foo<div /></>",
    },
    {
      // leading whitespace
      code: "<> <div /></>",
    },
    {
      // trailing whitespace
      code: '<>{"moo"} </>',
    },
    // not fragments
    "<NotFragment />",
    "<React.NotFragment />",
    "<NotReact.Fragment />",
    {
      // multiple children in fragment
      code: "<Foo><><div /><div /></></Foo>",
    },
    {
      // component could require a React Node
      code: '<div p={<>{"a"}{"b"}</>} />',
    },
    {
      // value could be undefined
      code: "<Fragment key={item.id}>{item.value}</Fragment>",
    },
    {
      // component could require a React Node
      code: "<Fooo content={<>eeee ee eeeeeee eeeeeeee</>} />",
    },
    {
      // .map could return undefined
      code: "<>{foos.map(foo => foo)}</>",
    },
    {
      // component could require a ReactNode
      code: "<></>",
    },
    {
      // component could require a ReactNode
      code: "<Fragment />",
    },
    {
      // children could be undefined
      code: "<>{children}</>",
    },
    {
      code: `
        <SomeReact.SomeFragment>
          {foo}
        </SomeReact.SomeFragment>
      `,
      settings: {
        react: {
          pragma: "SomeReact",
          fragment: "SomeFragment",
        },
      },
    },
    {
      // props.children could be undefined
      code: "<>{props.children}</>",
    },
    {
      // foo could be undefined
      code: "<>{foo && <Foo/>}</>",
    },
    {
      // foo could be undefined
      code: "<>{foo?.map(x => <Bar id={x.id}/>)}</>",
    },
  ],
  invalid: [
    {
      code: "<>{}</>",
      output: "<></>",
      // TODO(sbdchd): we can probably fix this automatically
      errors: [{ messageId: "NeedsMoreChidren" }],
    },
    {
      code: "<p>moo<>foo</></p>",
      output: "<p>moofoo</p>",
      errors: [
        { messageId: "NeedsMoreChidren" },
        { messageId: "ChildOfHtmlElement" },
      ],
    },
    {
      code: "<p><>{foo}</></p>",
      output: "<p>{foo}</p>",
      errors: [
        { messageId: "NeedsMoreChidren" },
        { messageId: "ChildOfHtmlElement" },
      ],
    },
    {
      code: "<><div/></>",
      output: "<div/>",
      errors: [{ messageId: "NeedsMoreChidren" }],
    },
    {
      code: `
        <>
          <div/>
        </>
      `,
      output: `
        <div/>
      `,
      errors: [{ messageId: "NeedsMoreChidren" }],
    },
    {
      code: `
        <React.Fragment>
          <Foo />
        </React.Fragment>
      `,
      output: `
        <Foo />
      `,
      errors: [{ messageId: "NeedsMoreChidren" }],
    },
    {
      // Not safe to fix this case because `Eeee` might require child be ReactElement
      code: "<Eeee><>foo</></Eeee>",
      //   output: null,
      errors: [{ messageId: "NeedsMoreChidren" }],
    },
    {
      code: "<div><>foo</></div>",
      output: "<div>foo</div>",
      errors: [
        { messageId: "NeedsMoreChidren" },
        { messageId: "ChildOfHtmlElement" },
      ],
    },
    {
      code: '<div><>{"a"}{"b"}</></div>',
      output: '<div>{"a"}{"b"}</div>',
      errors: [{ messageId: "ChildOfHtmlElement" }],
    },
    {
      code: `
        <section>
          <Eeee />
          <Eeee />
          <>{"a"}{"b"}</>
        </section>`,
      output: `
        <section>
          <Eeee />
          <Eeee />
          {"a"}{"b"}
        </section>`,
      errors: [{ messageId: "ChildOfHtmlElement" }],
    },
    {
      code: '<div><Fragment>{"a"}{"b"}</Fragment></div>',
      output: '<div>{"a"}{"b"}</div>',
      errors: [{ messageId: "ChildOfHtmlElement" }],
    },
    {
      // whitepace tricky case
      code: `
        <section>
          git<>
            <b>hub</b>.
          </>
          git<> <b>hub</b></>
        </section>`,
      output: `
        <section>
          git<b>hub</b>.
          git <b>hub</b>
        </section>`,
      errors: [
        { messageId: "ChildOfHtmlElement" },
        { messageId: "ChildOfHtmlElement" },
      ],
    },
    {
      code: '<div>a <>{""}{""}</> a</div>',
      output: '<div>a {""}{""} a</div>',
      errors: [{ messageId: "ChildOfHtmlElement" }],
    },
    {
      code: `
        const Comp = () => (
          <html>
            <React.Fragment />
          </html>
        );
      `,
      output: `
        const Comp = () => (
          <html>
            ${""}
          </html>
        );
      `,
      errors: [{ messageId: "ChildOfHtmlElement" }],
    },
  ],
})
