// @flow

import * as React from 'react';

type PropTypes = {||};
type StateTypes = {||};

class FileUpload extends React.Component<PropTypes, StateTypes> {
  inputRef: RefObject<'input'> = React.createRef();

  async show(): Promise<File[] | null> {
    return /* await */ new Promise((resolve, _reject) => {
      const input = this.inputRef.current;

      // eslint-disable-next-line no-throw-literal
      if (input === null) throw 'ref is null';

      input.value = '';
      input.click();

      // this will be called by exactly one of the listeners,
      // because the other is removed
      function complete() {
        // eslint-disable-next-line no-use-before-define
        window.removeEventListener('focus', onFocus);
        // eslint-disable-next-line no-use-before-define
        window.removeEventListener('change', onChange);
      }

      function onFocus() {
        // this is triggered when the file chooser has been closed,
        // but may be too early for this.inputRef.current.files to have a value
        // in the case when a file was actually selected.
        // therefore, delay this by a comfortable amount of time
        setTimeout(() => {
          complete();
          resolve(null);
        }, 1000);
      }

      function onChange() {
        // this is triggered when a file has been selected,
        // but not if the file chooser has been closed without choosing a file

        complete();
        resolve(input.files);
      }

      window.addEventListener('focus', onFocus, { once: true });
      window.addEventListener('change', onChange, { once: true });
    });
  }

  render() {
    return <input ref={this.inputRef} type="file" style={{ display: 'none' }} aria-hidden />;
  }
}

export default FileUpload;
