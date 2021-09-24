/**
 * @fileoverview Sorts TypeScript type only imports
 * @author Matthew Miller
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/sort-type-only-imports"),
  RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();
ruleTester.run("sort-type-only-imports", rule, {
  valid: [
    // give me some code that won't trigger a warning
  ],

  invalid: [
    {
      code: "|type Foo = import('foo').default",
      errors: [{ message: "Fill me in.", type: "Me too" }],
    },
  ],
});
