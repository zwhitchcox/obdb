Note: This is still a work in progress with no guarantee as to when it will be completed

# obdb (0.0.1 (MVP))

Observable Database written in JavaScript, compatible with TypeScript and Flow

## Goals/Benefits

The goal of this database is to create a javascript based database stored completely in memory (but also backed up on the file system). This will make the database easy to alter and modify for the users, without having to get into complicated C++ or C code.

The intention is to make this database easy to alter for the layman, and thus add more features and provide an overall better experience for the user.

Furthermore, the database should be written in JavaScript, but compatible with both TypeScript and Flow. This means type safety safety from the front end all the way to the database. This also means automatic compatibility-checking with the previous data stored in the database. This gives much assurance in eliminating runtime errors. It's still possible to have runtime errors, but it's much less likely.

The database is reactive, meaning, it will emit changes whenever the data changes.

The database will be stored as a javascript object, making it extremely easy to use.

It will be a graph database, meaning, two different paths can hold the same node, meaning, if Sally and Jeremy share the same data, you will only have to update one.

Everything can managed from the client. The goal is for the database to have such a simple set up, just creating a server and attaching the database, that you have to practically write no server code. The only exceptions are where you have to ensure that only the server has privileges for something. Like, if you had a field that no one can edit except the server, the server would need to create that field, and you would have to specify that code on the server.

Security should be able to be managed on the client, where the creator of each field can assign who can edit a field, although, security will be an add-on and not essential to the database to allow extensibility and modification.

It should have its own json query interpreter which pass on the types the user specifies in flow/typescript.

Typescript and Flow specific code will be written in a comment, and will be removed/included depedending on the implementation specified by the user by a webpack loader. The comment will have a prefix, `ts` for typescript and `fl` for flow, indicating whether to delete or include the code depending on the destination. There will be a flow file emitted which will be the default, and a typescript file that can be included by the user like this: `require('obdb/typescript')`. This is to ensure the user can user their preferred platform, although, support for either is not guaranteed in future versions.

There should be a separate library integrating obdb seamlessly into mobx, and it should work out of the box with RxJS. It should also function easily as a standalone store and be simple to integrate with React (and also possibly angular 2 at some point).

Indexes should also be supported from the client side.

With similary databases writes were possible at up to 20K ops/s, so, we should have a similar performance.
