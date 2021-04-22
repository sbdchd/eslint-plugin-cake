# eslint-plugin-cake

misc rules for eslint

## Why?

> **NOTE**: This is forked from
> [`eslint-plugin-react`](https://github.com/yannickcr/eslint-plugin-react) so
> that I have [a safer](https://github.com/yannickcr/eslint-plugin-react/pull/2967) `jsx-no-useless-fragment` rule.

## Installation

You'll first need to install [ESLint](http://eslint.org):

```shell
yarn add --dev eslint
# or
npm install eslint --save-dev
```

Next, install `eslint-plugin-cake`:

```shell
yarn add --dev eslint-plugin-cake
# or
npm install eslint-plugin-cake --save-dev
```

## Usage

Add `cake` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["cake"]
}
```

## Supported Rules

[see docs](./docs/rules)
