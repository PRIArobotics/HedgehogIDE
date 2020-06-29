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
- `misc`:
  Reusable helper components and hooks.

The `projects` and `ide` directories contain the two main views of the Hedgehog IDE.
As such they are more complicated and are described in more detail below.

## Project Overview

The home page shows the overview of all existing projects;
this is implemented in the `projects/ProjectList` component.

Much of the code is rather straight-forward: projects can be created, renamed, deleted.
These actions display a dialog each, which is extracted into a hook in one of the
`use{Create,Rename,Delete}Project.js` files.
The handlers for completing these actions reside in the main `ProjectList` component.

Analogous to local project management, there are actions for managing server-side projects as well.
Remote projects act as templates that can be "cloned" to work on the contained exercises.
The relevant dialog hook files are named `use{Create,Rename,Delete,Clone}RemoteProject.js`.
The handlers for these actions are in the main component again, but delegate to separate hooks
that encapsulate the handling of GraphQL queries and mutations.

Managing exercises is currently considered an administration feature:
only logged-in users can create or delete exercises, and all users have access to all exercises for this purpose.

In addition to those two lists, the Hedgehog IDE associates each local project with at most one exercise.
The `useProjectIndex.js` hook manages those associations.

## IDE main view

The bulk of the code is concerned with the functionality of this view.
The IDE view works on a single opened project and displays its files in a tree,
and provides a [FlexLayout](https://github.com/caplin/FlexLayout/) for file tabs and other components,
such as the robot simulator.

While the simulator runs in the browser as regular JavaScript code,
any user-written code is executed in a sandboxed iframe, managed by the components in `Executor`.
This includes plugins, which can influence program and simulator behavior via defined APIs.
As code within a project may come from a different user
(e.g. a plugin may be part of an exercise, not written by the user who is trying to solve the exercise),
all plugins and programs are also separated from each other.

Similar to the project list, there is a lot of mundane code concerned with implementing the different
file actions,
including creation, deletion, renaming, up- and downloading (to the browser, not to a server), moving files, etc.
The relevant components live in the `FileTree` directory,
and the handlers for executing those actions live in `Ide.js`.

The next chunk of code is concerned with managing the open project,
in particular the `useProject{Info,Cache}.js` hooks within the `Ide` directory.
Projects are stored in an in-browser file system named [filer](https://github.com/filerjs/filer).
Filer is asynchronous, so accessing a project and its files needs a bit of orchestration.
The project info contains only the information that is basically immutable
over the lifetime of the Ide component; that is the project's name and its filer-internal ID.
The project cache contains the file tree, which must be refreshed any time a file is created, moved etc.

Apart from a project's files, there is also IDE state associated with a project.
That state is stored outside the project's file system, and is associated with the project
via its filer-internal ID.
That way, the assiciation is robust regarding project renaming.
IDE state covers the open editors, the current IDE layout, and editor state for each file.
For example, the visual editor stores whether the text representation of the program is currently shown.

The final responsibility of the `Ide` component is tab management.
In particular, there are two special components that can be opened in a tab:
`Console` and `Simulator`.
Only (at most) one instance of each can be open,
and the `Ide` component makes these instances accessible to the other parts of the IDE.
For example, a user program will routinely want to access simulated robots,
which happens through the `Simulator` component.
