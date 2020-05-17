# Function Components & Hooks

In Hedgehog IDE, function components using [hooks](https://reactjs.org/docs/hooks-intro.html) are the preferred style for React components.
The React Hooks documentation is strongly recommended,
this page collects additional guidelines for using the hook API effectively.

## Code style basics

In general, the following scaffolding is expected in a function component:

```TS
// @flow

import * as React from 'react';

type Props = {|
  // any props
  prop: string
|};

function Component({ prop }: Props) {
  // component logic
  function fn() {}

  // render expression
  return null;
}

export default Component;
```

- Activate Flow typechecking, and import the `React` namespace to get access to the types as well as the JS APIs.
- Declare the props as an exact object type `Props`.
  This type declaration goes next to the component; put any other declarations before it.
- Declare the component as a regular function, not an arrow function.
- Declare functions in the component's logic as regular functions as well.
  Optimizations such as `useCallback` are an exception, only in these cases pass arrow functions into the optimizing hooks:
  ```TS
  const fn = React.useCallback(() => {}, []);
  ```
- `default export` the component after its declaration.

## using a stylesheet

Where possible, extra styles are intrudiced as `.scss` stylesheets.

```TS
// @flow

import * as React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Component.scss';

type Props = {|
  // any props
  prop: string
|};

function Component({ prop }: Props) {
  useStyles(s);
  return <div className={s.root}/>;
}

export default Component;
```

- The `useStyles` import goes right below the React import.
- Import the stylesheet as `s`; put that import after any "UI" imports (components, hooks, etc.)
  but before any "business logic" imports (models, etc.).
- Put the `useStyles` hook right above the render expression,
  as styles are not relevant for the component's logic.

## Providing APIs to a parent component

If a parent component needs access to a child component's "methods",
this is done through refs.
The code to provide an API for a function component looks like this:

```TS
// @flow

import * as React from 'react';

type Props = {|
  // any props
  prop: string
|};
type Instance = {|
  // any API
  fn(): void,
|};

function Component({ prop }: Props, ref: Ref<Instance>) {
  function fn() {}

  React.useImperativeHandle(ref, () => ({
    fn,
  }));

  return null;
}

export default React.forwardRef<Props, Instance>(Component);
```

`React.forwardRef` provides the component with the additinal `ref` argument,
and `React.useImperativeHandle` provides an object whose properties define the component's API.

- Declare `Instance` as an exact object type directly after `Props`, prefer method syntax to declare the API types.
- Put `React.forwardRef` on the export line.
  The exception to this are components that are used within the file itself,
  such as recursive components.
  In those cases, the "intermediate" component should not be given a name as a standalone function, and the following is preferred:
  ```TS
  const Component = React.forwardRef<Props, Instance>((
    { prop }: Props,
    ref: Ref<Instance>,
  ) => {
    // recursive uses of <Component /> ...
    return null;
  });

  export default Component;
  ```
- Put `React.useImperativeHandle` as the last thing in the component logic. These are "exports" from the component, and so may reference anything that has come before.
  - if the exported method is not needed in the component's logic, it may be declared withing the hook call.

## Accessing a child component

To get a ref to a child component, e.g. to call an API, the parent is wired up like this:

```TS
// @flow

import * as React from 'react';

import Child from './Child';

type Props = {|
  // any props
  prop: string
|};

function Component({ prop }: Props) {
  const childRef = React.useRef<React.ComponentRef<typeof Child> | null>(null);

  return <Child ref={childRef} />;
}

export default Component;
```

`childRef.current` will contain the child component between mounting and unmounting.
Be aware that, as `childRef` is a simple mutable object,
a change to `childRef.current` will not trigger a re-render or effect!
[This Hooks FAQ entry](https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node) shows a possible solution.

- Use `xy | null` for the ref type, not `?xy`; the latter accepts `undefined` in addition to `null`.
- Initialize the ref to `null`; this is also the value the ref will have after unmounting.

The `useElementRef` hook in `src/components/misc/hooks.js` makes this more convenient.
The following is equivalent to the hook call above:

```TS
const childRef = hooks.useElementRef<typeof Child>();
```

## Optimization hooks

Several hooks accept a dependency array parameter.
For some of them, that array is required:

- [`useCallback`](https://reactjs.org/docs/hooks-reference.html#usecallback)
- [`useMemo`](https://reactjs.org/docs/hooks-reference.html#usememo)

They are purely for optimization, and should not be used unless there is a performance problem.
For others, it is optional:

- [`useEffect`](https://reactjs.org/docs/hooks-reference.html#useeffect)
- [`useLayoutEffect`](https://reactjs.org/docs/hooks-reference.html#uselayouteffect)
- [`useImperativeHandle`](https://reactjs.org/docs/hooks-reference.html#useimperativehandle)

With `useImperativeHandle`, it is again a question of performance alone.
For the other two, it is not so easy to say:
effects are used to run imperative code, so depending on the effect,
getting rid of additional invocations can have more than just a performance impact.
Likewise, additional effect invocations could be semantically wrong.

Other than effects, dependency arrays and optimization hooks should not be used "by default", only when the need becomes clear.
Look at [When to useMemo and useCallback](https://kentcdodds.com/blog/usememo-and-usecallback) for a few insights.
