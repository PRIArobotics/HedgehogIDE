// @flow

import * as React from 'react';

import Button from '@material-ui/core/Button';

import * as StateDB from '../../core/store/state';

import SimpleDialog from '../../components/misc/SimpleDialog';

type SimpleDialogProps = React.ElementProps<typeof SimpleDialog>;

// these properties have to be passed in addition to those
// generated by mountSimpleDialog()
type AdditionalSimpleDialogProps = {|
  id: $PropertyType<SimpleDialogProps, 'id'>,
|};

type MyDialogHook = {
  show(): Promise<boolean>,
  mountSimpleDialog(): $Diff<SimpleDialogProps, AdditionalSimpleDialogProps>,
};

function useMyDialog(): MyDialogHook {
  // this is a little strange - pack the resolve function into an array,
  // so that React won't try to do a functional setter call.
  const [resolve, setResolve] = React.useState<[(boolean) => void] | null>(
    null,
  );

  function hide(result: boolean) {
    if (resolve === null) throw 'hide called while dialog is not visible';

    const [realResolve] = resolve;

    realResolve(result);
    setResolve(null);
  }

  return {
    show() {
      if (resolve !== null) throw 'show called while dialog is visible';

      // eslint-disable-next-line no-shadow
      return new Promise<boolean>(resolve => {
        // this is where we want to avoid the functional state setter
        setResolve([resolve]);
      });
    },
    mountSimpleDialog() {
      return {
        open: resolve !== null,
        valid: true,
        title: 'Title',
        description: 'Description',
        actions: 'OK_autofocus_CANCEL',
        onCancel: () => hide(false),
        onConfirm: () => hide(true),
        children: 'Content',
      };
    },
  };
}

type PropTypes = {||};
type StateTypes = {||};

function Test() {
  const myDialog = useMyDialog();

  return (
    <div>
      <Button
        variant="contained"
        onClick={async () => {
          const result = await myDialog.show();
          // TODO any state used here was captured when the button was clicked,
          // not when the dialog was closed.
          // For example, even if we didn't await the show call, a subsequent
          // show call wouldn't throw, as its version of resolve would be null.
          console.log('result', result);
        }}
      >
        Show Dialog
      </Button>
      <SimpleDialog id="dialog" {...myDialog.mountSimpleDialog()} />
    </div>
  );
}

export default class IndexedDB extends React.Component<PropTypes, StateTypes> {
  inputRef: RefObject<'input'> = React.createRef();

  componentDidMount() {
    (async () => {
      await StateDB.init();

      const value = await StateDB.getState('Input');
      if (this.inputRef.current !== null) this.inputRef.current.value = value;
    })();
  }

  handleInput = () => {
    if (this.inputRef.current === null) return;

    StateDB.setState('Input', this.inputRef.current.value);
  };

  render() {
    return (
      <div>
        <h1>IndexedDB with JsStore</h1>
        <input type="text" ref={this.inputRef} onInput={this.handleInput} />
        <Test />
      </div>
    );
  }
}
