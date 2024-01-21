# Boxed-Builder

Opionated TypeScript POJO builders, inspired by Vincent Pang's
[builder pattern](https://github.com/Vincent-Pang/builder-pattern).

## Motivation

Often times, it's not possible (or ideal) to initialize all the required fields that
describe an interface. For example,

1. Your application listens to incoming requests for data.
2. The code is "cleaner" if initialization is separated into multiple steps.

In TypeScript land, we usually hack around this problem using the keyword `as`
or default values. However, both approaches are prone to costly runtime exceptions;
i.e, the program inadvertently uses a field that has not been initialized.

Instead, you can utilize **Boxed-Builder** to generate typesafe builder for your project.

```ts
import Boxed, { Property } from "./boxed-builder";

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

const shop = Boxed(Shop)
  .Builder()
  .name("Foo")
  .open(true)
  .stock(100)
  .revenue(0)
  .build();

console.log(shop); // { name: "Foo", open: true, stock: 100, revenue: 0 }
```

To avoid using code generation or [ES6 Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy), the builder is created
by reading the properties from `Shop`. You will **need to** add `@Property` decorator
because class properties do not exist until they are assigned to.

## Installation

Install with `npm`, `yarn`, or `pnpm`.

```sh
npm install boxed-builder
yarn install boxed-builder
pnpm install boxed-builder
```

## API

Out of the "box", `Box(clazz)` offers several **strict** builders. This means
that an object can only be built if all the "required fields" are initalized. A
field is non-required if its type can be `undefined`.

The builders differ in initialization pattern, but conform to the same API
specification (described in the next section).

| Builder                                                    | Description                                                                       |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `Box(clazz).Builder()`                                     | The most flexible builder type that has no constraints on how properties are set. |
| `Box(clazz).StagedBuilder<K extends Array<keyof clazz>>()` | Requires properties to be set in the order specified by K.                        |
| `Box(clazz).ForwardBuilder()`                              | Only allows forward initalization                                                 |

### Specification

#### Setter

##### Updating Value

For each property `k` in your POJO, the builder exposes a setter method `set${k}`
to set the value for `k`. Note that the first character in `k` will be capitalized.

```ts
Boxed(Shop).Builder().setLocation("Wonderland"); // Type error - Property 'setLocation' does not exist...
Boxed(Shop).Builder().setOpen("true"); // Type error - "true" cannot be assigned to boolean
Boxed(Shop).Builder().setOpen(false); // Returns a builder
```

Alternatively, you can supply a callback for the setter. The callback accepts
an object with properties that have been initalized. This is useful
if you want to set value conditionally.

```ts
Boxed(Shop)
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
Boxed(Shop)
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
Boxed(Shop).Builder().getOpen(); // Type error - Property 'getOpen' does not exist...

Boxed(Shop).Builder().setOpen(false).getOpen(); // false
```

#### From

You can partially initialize the values using `from(other)`. Note that the
builder only exposes `from()` on a fresh instance; i.e, you can't call `from()`
on a builder instance that has fields set.

```ts
Boxed(Shop)
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
Builder(Shop).build(); // Type error - Property 'build' does not exist...

const shop = Builder(Shop).setName("Foo").setOpen(true).setStock(100).build(); // Ok since revenue has type number | undefined

console.log(shop); // { name: "Foo", open: true, stock: 100 }
```

### Type Utility

You can convert a class to a type with `Describe`.

```ts
import { Describe } from "./boxed-builder";

type IShop = Describe<Shop>;
```

### Staged Builder

You can enforce the initialization order using `Boxed(clazz).StagedBuilder<K extends Array<keyof clazz>>()`.
When all the properties in `K` have been set, a `StagedBuilder` converts to
a regular builder.

Note that `StagedBuilder` only allows forward initalization on values in `K`.
This means that if you call `from()` with properties in `K`, you can't re-initialize
those values.

```ts
Boxed(Shop).StagedBuilder<[]>(); // defaults to a regular builder

Boxed(Shop).StagedBuilder<["name"]>().setLocation("MA"); // Type error - Property 'setLocation' does not exist...

Boxed(Shop).StagedBuilder<["name"]>().setName("Foo"); // defaults to a regular builder after all stages are set
```

### Forward Builder

You can enforce that properties are only initialized once using
`Boxed(clazz).ForwardBuilder()`.

```ts
Boxed(Shop).setLocation("Boston").setLocation("Boston"); // Type error - Property 'setLocation' does not exist...
```

## Under The Hood

**Boxed-Builder** uses conditional typing to enforce what methods are available to the
client. However, it's possible to gain access to all the available API by
downcasting and inspecting the builder object.

## Road Map

- [x] Strict builder
- [x] Staged builder
- [x] Forward builder
