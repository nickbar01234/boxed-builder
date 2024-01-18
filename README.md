# Boxed-Builder

An opinionated TypeScript POJO builder.

## Motivation

Often times, it's not possible (or ideal) to initialize all the required fields that
describe an interface. For example,

1. Your application listens to incoming requests for data.
2. The code is "cleaner" if initialization is separated into multiple steps.

In TypeScript land, we usually hack around this problem using the keyword `as`
or default values. However, both approaches are prone to costly runtime exceptions;
i.e, the program inadvertently uses a field that has not been initialized.

Instead, you can utilize **Boxed-Builder** to generate a typesafe object builder. With
**Boxed-Builder**, you define a class (instead of an interface) to describe your object.

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

const shop = Builder(shop)
  .name("Foo")
  .open(true)
  .stock(100)
  .revenue(0)
  .build();

console.log(shop); // { name: "Foo", open: true, stock: 100 }
```

To avoid using code generation or [ES6 Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy), the builder is created
by reading the properties from `Shop`. By JavaScript design, class properties do not exist until they are assigned to. Therefore, you will **need to** add `@Property` decorator in order for the builder to work correctly.

## Installation

Install with `npm`, `yarn`, or `pnpm`.

```sh
npm install boxed-builder
yarn install boxed-builder
pnpm install boxed-builder
```

## API

### Setter

#### Updating Value

For each property in your POJO, the builder exposes a setter method that accepts
a new value that matches the described type.

```ts
Builder(Shop).location("Wonderland"); // Type error - Property 'location' does not exist...

Builder(Shop).open("true"); // Type error - "true" cannot be assigned to boolean
Builder(Shop).open(false); // Returns a builder
```

Alternatively, the builder accepts a callback to set the new value. The callback
takes in the object with properties that have been initialized. This is useful
if you want to set value conditionally.

```ts
Builder(Shop)
  .open(false)
  .stock((shape) => {
    return shape.open ? 100 : 0;
  });
```

#### Validating

To validate that the new value is sensible w.r.t properties that have been
set, pass a callback validation as a second parameter to the setter. The callback
takes in the object with properties that have been initialized.

```ts
Builder(Shop)
  .stock(0)
  .open(true, (shape) => {
    if (shape.open && shape.stock <= 0) {
      throw new Error("Can't open shop with no items");
    }
  });
```

### Getter

For each property that **has been set**, the builder exposes a getter method
that returns the value.

```ts
Builder(Shop).open(false).open(); // false
```

**Boxed-Builder** only exposes getters for properties that have been
initialized to prevent accessing `undefined` values inadvertently.

### Merge

After creating a new builder, you can optionally initialize it with another
object, using a shallow merge. Note that the builder only allows you to merge
when no values are initialized; i.e, you can't merge after using a `setter` or
initialization.

```ts
Builder(Shop)
  .merge({ open: true })
  .stock(100, (shape) => {
    if (shape.open && shape.stock <= 0) {
      throw new Error("Can't open shop with no items");
    }
  });
```

### Build

By design, the builder is **strict**. This means that `.build()`
will not be exposed until all the required properties are initialized. A property
is considered optional if its type can be `undefined`.

```ts
Builder(Shop).build(); // Type error - Property 'build' does not exist...

Builder(Shop).name("Foo").open(true).stock(100).build(); // Ok since revenue has type number | undefined
```

### Type Utility

You can convert a class to a type with `Describe`.

```ts
import { Describe } from "./boxed-builder";

type IStudent = Describe<Student>;
```

## Under The Hood

**Boxed-Builder** uses conditional typing to enforce what methods are available to the
client. However, it's possible to gain access to all the available API by
downcasting and inspecting the builder object.

## Road Map

- [x] Strict builder
- [ ] Staged builder
