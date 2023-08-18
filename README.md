<div align="center">
 <img src="./assets/logo.svg" width="150px" align="center" alt="Mongrove logo" />
 <h1 align="center">Mongrove</h1>
 <p align="center">MongoDB toolkit for typesafe schema creation and runtime validation</p>
</div>
<div align="center">
	<a href="https://github.com/ArttX/mongrove#readme">Documentation</a>
	<span>&nbsp;•&nbsp;</span>
	<a href="https://www.npmjs.com/package/mongrove">npm</a>
	<span>&nbsp;•&nbsp;</span>
	<a href="https://discord.gg/aWTRFdv3c9">Discord</a>
	<span>&nbsp;•&nbsp;</span>
	<a href="https://github.com/ArttX/mongrove/issues">Issues</a>
</div>
<br/>

Mongrove is an NPM library that combines the power of MongoDB with Zod, a powerful TypeScript-first schema validation library, to provide a comprehensive toolkit for creating typesafe schemas and performing runtime validation in your Node.js applications.

## Table of contents

-   [Features](#features)
-   [Installation](#installation)
-   [Usage](#usage)
-   [Documentation](#documentation)
-   [Additional Tips](#additional-tips)
-   [Contributing](#contributing)
-   [Changelog](#changelog)

## Features

-   ⚔️ **Typesafe Schema Creation:** Leverage the expressive schema definition capabilities of Zod to create MongoDB schemas with TypeScript types. This ensures that your data remains consistent and adheres to your defined structure.
-   ✅ **Runtime Validation:** With Mongrove, you can easily validate data against your defined schemas at runtime, catching potential issues early in your application's workflow.
-   ♻️ **Inheritance Support:** Benefit from schema inheritance feature to create reusable schema definitions, enabling you to build complex data structures effortlessly with query field completion.
-   🚫 **Validation Error Handling:** When data fails validation, Mongrove provides detailed error information, making it easier to identify and fix the root cause of the validation failure.
-   💤 **Easy Integration:** Mongrove seamlessly integrates with your existing MongoDB setup, allowing you to incorporate advanced schema definition and validation into your projects without any hassle.

## Installation

**Requirements**

-   Typescript 4.7+
-   Enabled `strict` mode in your `tsconfig.json`
-   Set `moduleResolution` to `"node16"` or `"nodenext"` or `"bundler"` in your `tsconfig.json`

**To install Mongrove, use PNPM:**

```bash
pnpm add mongrove
```

<small>P.S. If still using Javascript, then set <code>moduleResolution</code> options also to one of provided above into `jsconfig.json` file.</small>

Example for `tsconfig/jsconfig.json`:

```json
{
    "compilerOptions": {
        "moduleResolution": "node16"
    }
}
```

## Usage

### Step 1: Define Your Schema

First, create a schema that matches the structure of your MongoDB collection. You can define this schema in a separate file, making it easy to import into your code.

```ts
// src/client/index.ts
import { Schema, Collection, string, email, date, objectId } from "mongrove/schema";

const schema = new Schema({
    users: Collection({
        username: string(),
        displayName: string({ optional: true, min: 3, max: 32 }),
        email: email(),
        createdAt: date({ default: () => new Date() })
    }),
    posts: Collection({
        title: string(),
        content: string({ max: 2000 }),
        userId: objectId()
    })
});
```

### Step 2: Create client

Afterward, create a client and provide the connection string along with the previously defined schema.

```ts
// src/client/index.ts
import { MongroveClient } from "mongrove";
// ...
export const mongrove = new MongroveClient(process.env.MONGO_URI!, schema);
```

### Step 3: Export schema type _(optional)_

Extract and export schema type, so you can use schema collection types outside query statements.

```ts
// src/client/index.ts
import { ExtractSchemaType } from "mongrove/utils";

const schema = new Schema({...});

export type SchemaType = ExtractSchemaType<typeof schema>;
```

### Final code

Now, the client is ready for use. It will integrate the schema and offer typesafe field autocomplete and runtime validation for queries.

```ts
// src/client/index.ts
import { MongroveClient } from "mongrove";
import { Schema, Collection, string, email, date, objectId } from "mongrove/schema";
import { ExtractSchemaType } from "mongrove/utils";

// Defining schema
const schema = new Schema({
    users: Collection({
        username: string(),
        displayName: string({ optional: true, min: 3, max: 32 }),
        email: email(),
        createdAt: date({ default: () => new Date() })
    }),
    posts: Collection({
        title: string(),
        content: string({ max: 2000 }),
        userId: objectId()
    })
});

// Exporting schema type
export type SchemaType = ExtractSchemaType<typeof schema>;

// Creating client and exporting
export const mongrove = new MongroveClient(process.env.MONGO_URI!, schema);
```

### Use in your code

Finally, it's ready to be used in your code. Just import it and start utilizing its features.

```ts
// src/index.ts
import { mongrove, type SchemaType } from "./client";
import { SchemaOf } from "mongrove/utils";

type UserType = SchemaOf<SchemaType, "users", "input">;

async function main() {
    // Can select database,
    // if not provided, using connection string defined
    const db = mongrove.db("main");

    // Collection names provided by intellisence
    const Users = db.collection("users");
    const Posts = db.collection("posts");

    /* { acknowledged: boolean; insertedId: ObjectId; } */
    const userInsert = await Users.insertOne({
        username: "jeff",
        email: "jeff@mail.com"
    });

    // Use type for annotation
    const newUser: UserType = {
        username: "ben",
        displayName: "Ben",
        email: "ben@mail.com"
    };
    await Users.insertOne(newUser);

    await Posts.insertOne({
        title: "Mongrove",
        content: "Toolkit for MongoDb database",
        userId: userInsert.insertedId
    });

    /* {  
		_id: ObjectId
		username: string;  
		email: string;  
		created_at: Date;  
		displayName?: string | undefined;  
	} */
    const user = await Users.findOne();
    console.log(user);
}
```

### Index creation

Mongrove provides way to create indexes automatically from your defined schema.
To make schema field indexable, put `index` property in field's options.

**Example:**

```ts
user: Collection({
    username: string({ index: { unique: true } }),
    email: string({ index: {} })
});
```

You can leave index options empty for default options or provide them.
**NOTICE:** For now it is possible to index only 1st level fields.

**To start creating indexes simply execute `createIndexes` method from client:**

```ts
import { mongrove } from "./client";
// Creates only indexes that are missing in database
// Do not recreate existing ones and not updating options
await mongrove.createIndexes();
// Drops all indexes and creates them again with new options
await mongrove.createIndexes({ recreate: true });
```

## Documentation

### Structure objects

Objects that shape your schema

-   Collection
-   Object _(NObject)_

#### Types:

```ts
Collection(fields: Fields, options?: ValidatorCollectionOptions);

NObject(fields: Fields, options?: ValidatorObjectOptions);
```

### Schema options

-   filterDatabases
    -   Used for filtering databases, that are used with this schema.

```ts
{
	filterDatabases?: ((dbName: string) => boolean)
}
```

### Fields

Fields are way to define field type, validation and options. These are used only in schema to define fields.

-   [string](#string)
    -   cuid
    -   cuid2
    -   email
    -   emoji
    -   ip
    -   url
    -   uuid
-   [number](#number)
-   [boolean](#boolean)
-   [date](#date)
-   [objectId](#objectId)
-   [enum](#enum)
-   [array](#array)

#### Types:

```ts
string(options?: ValidatorStringOptions);

number(options?: ValidatorNumberOptions);

boolean(options?: ValidatorBooleanOptions);

date(options?: ValidatorDateOptions);

objectId(options?: ValidatorObjectIdOptions);

enumField(enumVal: [string, ...string[]], options?: ValidatorEnumOptions);

array(field: Field, options?: ValidatorArrayOptions);
```

### Field options

#### Default

> Accessible in all fields

```ts
type ValidatorDefaultOptions<T> = {
    index?: { unique?: boolean };
    default?: T;
    optional?: boolean;
    nullable?: boolean;
};
```

-   **index:**
    -   Set options for indexing field, where this option is used.
    -   **Example:** `string({ index: { unique: true } })`
-   **default:**
    -   Set default value, that will be used when inserting data, if this field is not provided in query.
    -   **Example 1:** `number({ default: 0 })`
    -   **Example 2:** `date({ default: () => new Date() })`
-   **optional:**
    -   Set field as optional field. In queries this field can be not provided with value and can be later updated with value.
    -   **Example:** `string({ optional: true })`
-   **nullable:**
    -   Set field as nullable field, so it can accept also `null` value for field, that should be defined, but value can not be provided in beginning.
    -   **Example:** `number({ nullable: true })`

<small><b>Notice.</b> You can use only one of options: {default or optional or nullable}</small>

#### String

> Provided also in: `uuid, url, ip, emoji, email, cuid, cuid2`

```ts
type ValidatorStringOptions = {
    min?: number;
    max?: number;
    regex?: RegExp;
    includes?: string;
    startsWith?: string;
    endsWith?: string;
};
```

-   **min:**
    -   Sets minimal length of string
-   **max:**
    -   Sets maximal length of string
-   **regex:**
    -   Sets regex for validating provided string
-   **includes:**
    -   Sets check if input string includes provided string
-   **startsWith:**
    -   Sets check if input string starts with provided string
-   **endsWith:**
    -   Sets check if input string ends with provided string

#### Number

```ts
type ValidatorNumberOptions = {
    int?: boolean;
    type?: "positive" | "nonnegative" | "negative" | "nonpositive";
};
```

-   **int:**
    -   If `true`, accepts only integers _(whole numbers)_
-   **type:**
    -   Sets type of number

#### Boolean

> No additional options

```ts
type ValidatorBooleanOptions = {};
```

#### Date

```ts
type ValidatorDateOptions{
	min?: Date;
	max?: Date;
}
```

-   **min:**
    -   Sets minimal date allowed
-   **max:**
    -   Sets maximal date allowed

#### ObjectId

> No additional options

```ts
type ValidatorObjectIdOptions = {};
```

#### Enum

> No additional options

```ts
type ValidatorEnumOptions = {};
```

#### Array

```ts
type ValidatorArrayOptions = {
    nonempty?: boolean;
    min?: number;
    max?: number;
    length?: number;
};
```

-   **nonempty:**
    -   Sets if should there be at least one item
-   **min:**
    -   Sets minimal count of items
-   **max:**
    -   Sets maximal count of items
-   **length:**
    -   Sets exact count of items

### Events

There are some events you can listen to. They are provided on `MongroveClient.events`:

-   **databaseConnected**
    -   Fires when database is connected
-   **databaseDisconneced**
    -   Fires when database is disconnected

### Errors

-   **MongroveCommonError**
    -   For simple error
-   **MongroveValidationError**
    -   When data validation fails on queries
-   **MongroveServerError**
    -   When data saving fails on database
-   **MongroveApiError**
    -   When some properties are not valid in client
-   **MongroveSchemaError**
    -   When there is issue with schema options

#### Error codes

You can access errors by using enum `MongroveErrorCodes` from `mongrove/errors`.

-   Common:
    -   **M1001** _(Con_FailedConnect)_ - Failed to connect to database
    -   **M1002** _(Con_FailedDisconnect)_ - Failed to disconnect from database
    -   **M2003** _(Idx_FailedCreateIndexes)_ - Failed to create indexes
-   Action:
    -   **M4001** _(Act_InsertFailed)_ - Insert failed
    -   **M4002** _(Act_ReadFailed)_ - Read failed
    -   **M4003** _(Act_UpdateFailed)_ - Update failed
    -   **M4004** _(Act_ReplaceFailed)_ - Replace failed
    -   **M4005** _(Act_DeleteFailed)_ - Delete failed
-   Other:
    -   **M6001** _(MissingFunction)_ - Missing function

#### Error handling

Errors can be caught using `try/catch` blocks.

```ts
import { MongroveValidationError } from "mongrove/errors";

try {
    await Users.insertOne({
        username: "Jeff",
        displayName: "Jo",
        email: "jeff@mail.com"
    });
} catch (err) {
    if (MongroveValidationError.isInstanceOf(err)) {
        console.log("There was validation error:", err);
        // or
        console.log(err.toString()); // for formatted error
        // [<code>] <name>: <message> {<meta>}
    }
}
```

#### Schema Types

You can use utilities to get collection field types from main schema.

There is 2 utility types for extracting type from ready structures:

First, assign collection into variable and then use `SchemaFromCollection` to get collection field types. Additionally provide schema type.

```ts
import type { SchemaFromCollection } from "mongrove/utils";

const Users = client.db().collection("users");
type UserType = SchemaFromCollection<typeof Users, "input">;
```

Second, use `SchemaType`, that is exported from schema and use `SchemaOf` to get collection field types. Provide collection name and schema type.

```ts
import type { SchemaOf } from "mongrove/utils";
import { type SchemaType } from "./client/index.ts";

const UserType = SchemaOf<SchemaType, "users", "input">;
```

## Additional Tips

-   **Use Typescript:** For better code intellisence recommended to use Typescript, so collection names, field names, options, etc. will be automatically hinted.
-   **Schema Evolution:** As your application evolves, you might need to update your schemas. It is simple. Add new fields to schema and it will update in real time without using console commands after each update.
-   **Partial and Nullable Fields:** Depending on your use case, you may have certain fields that are optional or nullable during data manipulation. Utilize `optional` and `nullable` options to express these distinctions in your schema.
-   **Handling Default Values:** Fields options supports setting default values for schema fields using the `default` option. This can be helpful when inserting documents without providing values for all fields.
-   **Advanced Validation Rules:** Mongrove provides various built-in validation methods, such as `min`, `max`, `regex`, etc., which allow you to impose stricter rules on your data. Utilize these features to enforce specific constraints on your schema fields.
-   **Preventing Duplicate Data:** Leverage fields unique index option to prevent duplicate data in your collections. This helps maintain data integrity and consistency.

## Contributing

I welcome contributions from the community! If you have any ideas, bug fixes, or feature requests, please feel free to open an issue or submit a pull request on GitHub repository, or share your idea [Discord server][discord_server]

## Changelog

View the changelog at [CHANGELOG.md](CHANGELOG.md)

## License

This library is released under the [MIT License](LICENSE).

[discord_server]: https://discord.gg/aWTRFdv3c9
