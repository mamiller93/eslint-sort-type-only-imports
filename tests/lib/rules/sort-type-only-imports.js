"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/sort-type-only-imports"),
  RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: { sourceType: "module" },
});

const expectedError = {
  messageId: "sortImportsAlphabetically",
  type: "TypeOnlyImportSort",
};

ruleTester.run("sort-type-only-imports", rule, {
  valid: [
    input`
      |type Bar = import('bar').default;
      |type Foo = import('foo').default;
    `,

    input`
      |type Foo = import('foo').default;
      |type Bar = string;
      |type baz = import('baz').default;
    `,

    input`
      |type Bar = import('bar').default;
      |
      |type Foo = string;
    `,

    input`
      |import Component from '@glimmer/component';
      |import { tracked } from '@glimmer/tracking';
      |import { action } from '@ember/object';
      |import { inject as service } from '@ember/service';
      |
      |type CheckoutCartService = import('services/checkout-cart').default;
      |type Entity = import('models/entity').default;
      |type StripePaymentMethod = import('models/stripe-payment-method').default;
      |
      |type Foo = string;
      |
      |interface Args {
      |  foooooo: string;
      |}
      |export default class StripeSourceShow extends Component<Args> {
      |  @service declare someService: CheckoutCartService;
      |  bar = false;
      |  @tracked trackedProp = this.args.foooooo;
      |
      |  get card() {
      |    return this.args.paymentMethod?.card || this.args.paymentMethod;
      |  }
      |
      |  @action
      |  someAction() {
      |    return this.foo()
      |  }
      |}
    `,
  ],

  invalid: [
    // Multiple line breaks
    RuleTester.only({
      code: input`
        |type Foo = import('foo').default;
        |type Bar = import('bar').default;
      `,
      output: input`
        |type Bar = import('bar').default;
        |type Foo = import('foo').default;
      `,
      errors: [expectedError],
    }),

    // Incorrect alphabetical order
    {
      code:
        "type Foo = import('foo').default;\n" +
        "type Bar = import('bar').default;",
      output:
        "type Bar = import('bar').default;\n" +
        "type Foo = import('foo').default;",
      errors: [expectedError],
    },

    // Incorrect alphabetical order with lowercase
    {
      code:
        "type Foo = import('foo').default;\n" +
        "type baz = import('baz').default;\n" +
        "type Bar = import('bar').default;",
      output:
        "type Bar = import('bar').default;\n" +
        "type Foo = import('foo').default;\n" +
        "type baz = import('baz').default;",
      errors: [expectedError],
    },

    // Unrelated type declaration
    {
      code: input`
        |type Bar = string;
        |type Foo = import('foo').default;
      `,
      output: input`
        |type Foo = import('foo').default;
        |
        |type Bar = string;
      `,
      errors: [expectedError],
    },

    // Class example
    {
      code: input`
        |import Component from '@glimmer/component';
        |import { tracked } from '@glimmer/tracking';
        |import { action } from '@ember/object';
        |import { inject as service } from '@ember/service';
        |
        |type Entity = import('models/entity').default;
        |type StripePaymentMethod = import('models/stripe-payment-method').default;
        |type CheckoutCartService = import('services/checkout-cart').default;
        |type Foo = string;
        |
        |
        |interface Args {
        |  foooooo: string;
        |}
        |export default class StripeSourceShow extends Component<Args> {
        |  @service declare someService: CheckoutCartService;
        |  bar = false;
        |  @tracked trackedProp = this.args.foooooo;
        |
        |  get card() {
        |    return this.args.paymentMethod?.card || this.args.paymentMethod;
        |  }
        |
        |  @action
        |  someAction() {
        |    return this.foo()
        |  }
        |}
      `,
      output: input`
        |import Component from '@glimmer/component';
        |import { tracked } from '@glimmer/tracking';
        |import { action } from '@ember/object';
        |import { inject as service } from '@ember/service';
        |
        |type CheckoutCartService = import('services/checkout-cart').default;
        |type Entity = import('models/entity').default;
        |type StripePaymentMethod = import('models/stripe-payment-method').default;
        |
        |type Foo = string;
        |
        |interface Args {
        |  foooooo: string;
        |}
        |export default class StripeSourceShow extends Component<Args> {
        |  @service declare someService: CheckoutCartService;
        |  bar = false;
        |  @tracked trackedProp = this.args.foooooo;
        |
        |  get card() {
        |    return this.args.paymentMethod?.card || this.args.paymentMethod;
        |  }
        |
        |  @action
        |  someAction() {
        |    return this.foo()
        |  }
        |}
      `,
      errors: [expectedError],
    },
  ],
});

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

// Copied from eslint-plugin-simple-import-sort
function input(strings) {
  if (strings.length !== 1) {
    const loc = getLoc();
    throw new Error(
      `input: ${loc} Expected no interpolations, but got ${strings.length} separate parts.`
    );
  }

  const string = strings[0];

  if (!/^(?:\n {6,10}\|[^\n]*)+\n[^\S\n]*$/.test(string)) {
    const loc = getLoc();
    throw new Error(
      `input: ${loc} Every line must start with 6-10 spaces and a \`|\`.`
    );
  }

  return strip(string);
}

function getLoc(depth = 1) {
  const line = new Error().stack.split("\n")[depth + 2];
  const match = /\d+:\d+/.exec(line || "");
  return match != null ? match[0] : "?";
}

function strip(string, { keepPipes = false } = {}) {
  return (
    string
      // Remove indentation and pipes. (The pipes need to be kept in the `.toBe`
      // checks.)
      .replace(/\n *\|/g, keepPipes ? "\n|" : "\n")
      // Remove starting and ending newline (and optional spaces).
      .replace(/^\n|\n[^\S\n]*$/g, "")
  );
}
