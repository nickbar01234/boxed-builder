# Boxed-Builder

A library to provide typesafe and reusuable utilities.

1. [Builder pattern](#builder-pattern)
2. [Pipe pattern](#pipe-pattern)

## Installation

Install with `npm`, `yarn`, or `pnpm`.

```sh
npm install boxed-builder
yarn install boxed-builder
pnpm install boxed-builder
```

## Builder Pattern

A typesafe POJO-like builder, inspired by Vincent Pang's
[builder pattern](https://github.com/Vincent-Pang/builder-pattern).

### Motivation

Often times, it's not possible (or ideal) to initialize all the required fields that
describe an interface. For example,

1. Your application listens to incoming requests for data.
2. The code is "cleaner" if initialization is separated into multiple steps.

In TypeScript land, we usually hack around this problem using the keyword `as`
or default values. However, both approaches are prone to costly runtime exceptions;
i.e, the program inadvertently uses a field that has not been initialized.

Instead, you can utilize **Builder** to generate typesafe builder for your project.

```ts
import { Builder, Property } from "./boxed-builder";

class Shop {
  @Property
  name!: string;

  @Property
  open!: boolean;

  @Property
  stock!: number;

  @Property
  revenue!: number | undefined;
}

const shop = Builder(Shop)
  .Builder()
  .setName("Foo")
  .setOpen(true)
  .setStock(100)
  .setRevenue(0)
  .build();

console.log(shop); // { name: "Foo", open: true, stock: 100, revenue: 0 }
```

To avoid using code generation or [ES6 Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy), the builder is created
by reading the properties from `Shop`. You will **need to** add `@Property` decorator
because class properties do not exist until they are assigned to.

### API

Out of the "box", `Box(clazz)` offers several **strict** builders. This means
that an object can only be built if all the "required fields" are initalized. A
field is non-required if its type can be `undefined`.

The builders differ in initialization pattern, but conform to the same API
specification (described in the next section).

| Builder                                                        | Description                                                                       |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `Builder(clazz).Builder()`                                     | The most flexible builder type that has no constraints on how properties are set. |
| `Builder(clazz).StagedBuilder<K extends Array<keyof clazz>>()` | Requires properties to be set in the order specified by K.                        |
| `Builder(clazz).ForwardBuilder()`                              | Only allows forward initalization                                                 |

### Specification

#### Setter

##### Updating Value

For each property `k` in your POJO, the builder exposes a setter method `set${k}`
to set the value for `k`. Note that the first character in `k` will be capitalized.

```ts
Builder(Shop).Builder().setLocation("Wonderland"); // Type error - Property 'setLocation' does not exist...
Builder(Shop).Builder().setOpen("true"); // Type error - "true" cannot be assigned to boolean
Builder(Shop).Builder().setOpen(false); // Returns a builder
```

Alternatively, you can supply a callback for the setter. The callback accepts
an object with properties that have been initalized. This is useful
if you want to set value conditionally.

```ts
Builder(Shop)
  .Builder()
  .setLocation(false)
  .setStock((shape) => {
    return shape.open ? 100 : 0;
  });
```

##### Validation

The setter also takes an optional callback to validate that the new value is
sensible. The callback accepts an object with properties that have been initialized.

```ts
Builder(Shop)
  .Builder()
  .setStock(0)
  .setOpen(true, (shape) => {
    if (shape.open && shape.stock <= 0) {
      throw new Error("Can't open shop with no items");
    }
  });
```

#### Getter

For each property `k` that **has been set**, the builder exposes a getter method
`get${k}`. Note that the first character in `k` will be capitalized.

```ts
Builder(Shop).Builder().getOpen(); // Type error - Property 'getOpen' does not exist...

Builder(Shop).Builder().setOpen(false).getOpen(); // false
```

#### From

You can partially initialize the values using `from(other)`. Note that the
builder only exposes `from()` on a fresh instance; i.e, you can't call `from()`
on a builder instance that has fields set.

```ts
Builder(Shop)
  .Builder()
  .from({ open: true })
  .setStock(100, (shape) => {
    if (shape.open && shape.stock <= 0) {
      throw new Error("Can't open shop with no items");
    }
  });
```

#### Build

The builder exposes `.build()` method when all the required fields are
set. A field is non-required if its type can be `undefined`.

```ts
Builder(shop).Builder().build(); // Type error - Property 'build' does not exist...

const shop = Builder(shop)
  .Builder()
  .setName("Foo")
  .setOpen(true)
  .setStock(100)
  .build(); // Ok since revenue has type number | undefined

console.log(shop); // { name: "Foo", open: true, stock: 100 }
```

### Type Utility

You can convert a class to a type with `Describe`.

```ts
import { Describe } from "./boxed-builder";

type IShop = Describe<Shop>;
```

### Staged Builder

You can enforce the initialization order using `Builder(clazz).StagedBuilder<K extends Array<keyof clazz>>()`.
When all the properties in `K` have been set, a `StagedBuilder` converts to
a regular builder.

Note that `StagedBuilder` only allows forward initalization on values in `K`.
This means that if you call `from()` with properties in `K`, you can't re-initialize
those values.

```ts
Builder(Shop).StagedBuilder<[]>(); // defaults to a regular builder

Builder(Shop).StagedBuilder<["name"]>().setLocation("MA"); // Type error - Property 'setLocation' does not exist...

Builder(Shop).StagedBuilder<["name"]>().setName("Foo"); // defaults to a regular builder after all stages are set
```

### Forward Builder

You can enforce that properties are only initialized once using
`Builder(clazz).ForwardBuilder()`.

```ts
Builder(Shop).setLocation("Boston").setLocation("Boston"); // Type error - Property 'setLocation' does not exist...
```

### Under The Hood

**Builder** uses conditional typing to enforce what methods are available to the
client. However, it's possible to gain access to all the available API by
downcasting and inspecting the builder object.

## Pipe Pattern

A typesafe utility to compose functions, inspired by functional programming
language.

### Motivation

In-line function calls are very common.

```ts
f(g(h(x)));
```

For longer function names and multiple function calls, tracing parentheses can
be difficult. Using **Pipe** API,

```ts
import { Pipe } from "./boxed-builder";

const pipe = Pipe(h).o(g).o(f);
pipe(x); // f(g(h(x)))
```

The code `Pipe(h).o(g).o(f)` roughly translates to

```ts
(x) => {
  let x1 = h(x);
  let x2 = g(x1);
  let x3 = f(x2);
  return x3;
};
```

### Specification

A `Pipe` is an immutable list of unary functions. When a `Pipe` is called with
a parameter, the functions are executed in the order they are added.

#### Creating Pipe

To create a `Pipe`

```ts
const isPositivePipe = Pipe((x: number) => x > 0);
```

To add more functions to the pipe, use the `.o(unary)` method

```ts
const isNotPositivePipe = isPositivePipe.o((x) => !x);
```

Calling `.o()` method returns a new `Pipe` instance.

To execute the pipe, call it as you would with a function. The output type
is inferred by typechecking the list of unary functions in order.

```ts
isNotPositivePipe(-10); // true
```

#### Type Checking

The first function added to the `Pipe` can take any input. Any subsequent
function takes the type returned by the previous function.

```ts
Pipe((x: number) => x * 10).o((y /* inferred as number */) => 10 + y)(1); // (1 * 10) + 10

Pipe((x: number) => x > 0).o((y: number) => -1 * y); // Type error, number is not assignable to boolean

Pipe((x: number) => x > 0)(true); // Type error
```

#### Asynchronous Function

If a function returns a promise, the `Pipe` waits for the results before calling
the next function. The output of the pipe will be a promise.

```ts
const x = await Pipe(async (x: number) => x + 1)(10); // 1
```

#### Terminating

It may be useful to terminate the chain early; for example, when an error
occurred. The unary functions can optionally take in a `terminate` function,
which has type `(output?: any) => never`.

```ts
const pipe = Pipe((student: { school: string | undefined }, terminate) => {
  if (student.school == undefined) {
    return terminate("STOP");
  }
  // student.school is inferred to be string
  return student.school === "Tufts";
});

pipe({ school: undefined }); // STOP
pipe({ school: "Tufts" }); // true
```

The parameter to `terminate` becomes the output of the pipe. This can be useful
for error recovery.
