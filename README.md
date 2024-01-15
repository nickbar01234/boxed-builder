# Lazily

## Motivation

Suppose your program needs to fully initialize an object before performing
an action.

```ts
interface GoogleDriveApi {
  nextPageToken: string;
  fileIds: string[];
}

interface DropBoxApi {
  cursor: string;
  fileIds: string[];
}

interface Application {
  version: number;
  gdrive: GoogleDriveApi;
  dropbox: DropBoxApi;
}
```

In this small example, you can make 2 separate API calls before initializing
the object. But it's also possible that

1. `Application` contains many more fields; in which case, the code may look
   cleaner if the object is incrementally initialized.
2. The application is listening to incoming requests, so not all the data is available.

Traditionally, incremental initialization can be done using the keyword `as` or
default values. However, both operations are prone to costly runtime exceptions
if the program later uses a field when it has not been fully initialized.

Instead, you can generate builders with **Lazily** to construct objects
in a typesafe way. **Lazily** will target interfaces that is marked with
`@lazily`.

```ts
// ...

/**
 * @lazily
 */
interface Application {
  version: number;
  gdrive: GoogleDriveApi;
  dropbox: DropBoxApi;
}
```

Running `npx lazily **/*.ts` on the terminal will output `ApplicationBuilder`
class in `node_modules/lazily/index.ts`.

## Command Line

```sh
npx lazily src [--staged] [--output path] [--help]
```

- `src`: Path to the target source folder or file. This argument also accepts
  glob patterns. For example, `**/*.ts` to parse all typescript files; `**/*{.d.ts, .type.ts}` to parse all files that ends with `.d.ts` and `.type.ts`.

- `--staged`: Specifies whether the output should be staged builders. The
  preprocessor defaults to a regular builder pattern and will throw runtime
  error if not all fields are instantiated when the object is built. This option
  can be overriden per interface declaration.

- `--output`: Target destination for generated code. If no path is given, the
  default output is `node_modules/lazily/index.ts`.

- `--help`: Shows help menu.

## Road Map

- [ ] Default builders
- [ ] Staged builders
- [ ] Generics
- [ ] Extend
- [ ] Type
- [ ] Pick / Omit
- [ ] Script to setup custom JSDoc tag
