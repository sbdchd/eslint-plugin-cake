# Disallow unnecessary style and className props (cake/jsx-no-useless-fragment)

A style and className passed to a builtin JSX element is a no-op that can be removed.

## Rule Details

Examples of **incorrect** code for this rule:

```jsx
<div style={{}} />

<section className="" />
```

Examples of **correct** code for this rule:

```jsx
<Foo className="" />
<Bar style={{}} />
```

## Rule Options

```js
...
"cake/jsx-no-useless-style-classname": [<enabled>]
...
```
