# Developer Documentation

This directory contains developer documentation for the Hedgehog IDE.
It covers general information on the architecture, code style recommendations and APIs.

This document gives an overview on the directory structure, used third party tools,
as well as on basic development and deployment.
There are more pages on

- [React code style](./code-style/react.md)
- [Concrete components & hooks of the Hedgehog IDE](./components.md)
- [Customizing a project's behavior](./plugins.md)

## Project structure

Hedgehog IDE is originally based on [React Starter Kit](https://github.com/kriasoft/react-starter-kit/) but has departed from its structure in places.

- `HedgehogIDE`
  - `.vscode`:
    VS Code IDE configuration
  - `build`:
    output of the build process
  - `docs`:
    this directory
  - `favicons`:
    favicon package generated by https://realfavicongenerator.net/
  - `flow-typed`:
    [Flow](https://flow.org/) type definitions of external packages
  - `gsl_blockly`:
    [gsl](https://github.com/SillyFreak/gsl/) code generator for the [Blockly](https://developers.google.com/blockly/) language of the Hedgehog IDE
  - `gsl_sdk`:
    [gsl](https://github.com/SillyFreak/gsl/) code generator for the plugin SDK of the IDE
  - `mongodb`:
    mongodb data directory used when using `yarn mongod`
  - `node_modules`
  - `public`:
    static ressources; mainly favicon variations, but also manifest files
  - `src`
    - `client`:
      browser entry point; setting up React rendering in the browser
    - `components`:
      frontend logic of the Hedgehog IDE; will be expanded upon later
    - `core`:
      shared logic between client and server; mostly data model definitions
    - `executor`:
      an additional browser entry point for the code execution iframes
      - `sdk`: APIs for calling IDE function from an execution iframe
    - `routes`:
      route definitions for [universal-router](https://github.com/kriasoft/universal-router)
    - `sdk`:
      API definitions exposed to the execution iframes
    - `server`:
      backend logic including SSR, GraphQL API and MongoDB persistence
    - `serviceworker`:
      [https://developers.google.com/web/tools/workbox](Workbox)-based service worker for offline functionality
    - `tools`:
      see also the `tools` directory below: extracted tools for use in the production environment
    - `translations`:
      language files for [react-intl](https://www.npmjs.com/package/react-intl)
  - `template`:
    React Starter Kit documentation files
  - `test`:
    Tests
  - `tools`:
    Build scripts


## Tools

The base for developing the Hedgehog IDE is formed by
[Yarn](https://yarnpkg.com/) and [Node](https://nodejs.org/) 12 or later.
To get started, clone the repo and install the dependencies:

```bash
git clone https://github.com/PRIArobotics/HedgehogIDE/
cd HedgehogIDE
yarn install
```

Some code is generated by [gsl](https://github.com/SillyFreak/gsl/);
that code is part of the repository, so gsl is not required for most development,
only when extending generated code;
that is, blocks for visual programming and the plugin SDKs.
gsl requires [Python](https://www.python.org/) 3.6 or later and can be installed via `pip`:

```bash
pip install gsl[yaml]
```

Although most features of Hedgehog IDE are browser only,
some features require a [MongoDB](https://www.mongodb.com/) database; we use MondoDB 4.

All tools used for developing or building are provided as yarn/npm commands.
Here are the most common ones:

```bash
# code style & linting
yarn lint                   # runs eslint to check code for potential problems
yarn fix                    # same as above, but applies automatic fixes including code formatting

# build & start web server
yarn start                  # start the server in development mode with hot reloading
yarn build                  # build the server
yarn build --release        # build the server in release mode
yarn serve                  # serve the built server

# code generation
yarn codegen                # generates type definitions for GraphQL queries
yarn codegen:i18n           # generates internationalization message bundles
yarn codegen:i18n --check   # checks translation status
yarn codegen:gsl-blockly    # generates visual programming block definitions
yarn codegen:gsl-sdk        # generates plugin SDK API definitions

# start auxilliary services
yarn mongod                 # start MongoDB server for server-side storage
yarn start-peer             # start PeerJS server for WebRTC peer-to-peer connectivity

# management
yarn create-user            # create user in MongoDB
```

Most features require neither of the two auxilliary services,
and these features will work when they are not running;
however, Hedgehog IDE does *assume* that both MongoDB and WebRTC are available,
so failing to use either will not be communicated gracefully to the user.

## Development

For development, the `yarn start` command enables hot code reloading,
allowing one to leave the server running in the background and seeing most of the changes.
This feature is limited in a few places, though:

- because of how the web server is set up to enable hot reloading,
  GraphQL subscriptions will not work
- server-side changes may only be applied in a limited capacity,
  because old objects may still be referenced;
  e.g., changing Mongoose models will not work
- generally, client-side code changes will be reflected without issues.

To use subscriptions or work around other limitations of the hot reloading infrastructure,
use `yarn build` and `yarn serve`.

## Deployment

`yarn build --release` will build the relevant files for deployment.
The built artifacts look as follows:

- `build`
  - `public`:
    These files are to be served under the URL where Hedgehog IDE operates
    - `assets`:
      Output of the Webpack compilation process
    - `sw.js`, `sw.js.map`:
      The service worker; outside of `assets` because of security restrictions of service workers

    all other files in `build/public/`, such as favicon variations, are copied from `public/`
  - `server`:
    These files are the server-side Hedgehog IDE application
    and should be deployed anywhere outside the web server document root
    - `chunks`:
      Output of the Webpack compilation process
    - `server.js`, `server.js.map`:
      Server entry point
    - `runTool.js`, `runTool.js.map`:
      Management tool entry point for production
    - `package.json`, `yarn.lock`:
      project metadata for dependency installation

The server will also need all node dependencies installed,
so also run `yarn install --production --frozen-lockfile`
in the server destination directory.

In addition to these artifacts, a MongoDB instance and a PeerJS server must be started.
For MongoDB, refer to their documentation; PeerJS is installed as a dependency so to start it, run the `node_modules/.bin/peerjs` binary.

Have a look at `src/server/config.js` to see how to configure
the interaction between the different systems, as well as external ones.
