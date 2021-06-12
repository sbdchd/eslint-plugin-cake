# Disallow missing destructure params (cake/jsx-no-useless-fragment)

When a component's props type has more fields than are used in the component,
the users of the component end up needing to pass in the unused params, which is non-ideal. Also this can hide dead code.

## Rule Details

Examples of **incorrect** code for this rule:

```ts
type Params = {
  buzz: string
  bar: number
}
function Foo({ buzz }: Params) {}
```

Examples of **correct** code for this rule:

```ts
type Params = {
  buzz: string
  bar: number
}
function Foo({ buzz, bar }: Params) {}
function Foo({ buzz, ...rest }: Params) {}
function Foo(props: Params) {}
```

## Rule Options

```js
...
"cake/jsx-no-useless-style-classname": [<enabled>]
...
```
