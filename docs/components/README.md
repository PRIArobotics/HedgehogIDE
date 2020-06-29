# React components & hooks of Hedgehog IDE

Most functionality of the Hedgehog IDE runs in the browser,
to minimize the amount of information that users need to send over the internet.
Hedgehog IDE's frontend is based on React, so that code is structured as hooks & components.
React code style advice for Hedgehog IDE is found [here](../function-components.md);
this document explains the responsibilities of the various parts of the frontend.

React code is contained mostly in `src/components`, but there's also some in various other `src` subdirectories:

- `client`: for mounting React on the browser DOM
- `routes`: for mapping URL paths onto components
- `server`: for server-side rendering

these are only infrastructure and not business logic, so those will be skipped here.

## Structural overview

The IDE has an application part and two informational sites:
a user help page, and a contest page.
The contest is for the Robotics Day 2020 online competition;
it is preserved as inspiration for a task students can work on until further materials for students have been created.

The application part consists of two sites: the home page shows a list of projects;
each project can be opened to show the main IDE view.

Within `src/components`, there are several directories and files containing essentially all frontend code.
Lower-case directory names are used when there are multiple components within that directory.
Upper-case names are used when that directory has one main component it exports;
the directory name is the name of that component.

- `App.js`:
  the root React component, instantiating [context providers](https://reactjs.org/docs/context.html#contextprovider) for globally available services such as styling, theming, localization and authentication.
- `theme.js`, `variables.scss`:
  global styling and theming definitions.
- `layout`:
  contains trivial components defining page layout: `Footer`, `Header`, `Layout` and `Sidebar`.
  The Header contains provides login/logout UI,
  and the Layout component applies appropriate styling for full-page or scrolling content. Other than that, the components are simply markup.
- `locale`:
  Context hooks and components for language selection and localization.
- `users`:
  Context hooks and components for authentication.
