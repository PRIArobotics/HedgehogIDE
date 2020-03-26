// @flow

import * as React from 'react';

type PropTypes = {||};
type StateTypes = {||};

class FileUpload extends React.Component<PropTypes, StateTypes> {
  inputRef: RefObject<'input'> = React.createRef();

  async show(): Promise<File[]> {
    return /* await */ new Promise((resolve, reject) => {
      // eslint-disable-next-line no-throw-literal
      if (this.inputRef.current === null) throw 'ref is null';

      this.inputRef.current.value = '';
      this.inputRef.current.click();

      window.addEventListener(
        'focus',
        () => {
          // wait a few millis, because at least in FF
          // the onFocus happens before the file change...
          setTimeout(() => {
            if (this.inputRef.current === null) {
              // eslint-disable-next-line prefer-promise-reject-errors
              reject('ref is null');
              return;
            }

            resolve(this.inputRef.current.files);
          }, 50);
        },
        { once: true },
      );
    });
  }

  render() {
    return (
      <input
        ref={this.inputRef}
        type="file"
        style={{ display: 'none' }}
        aria-hidden
      />
    );
  }
}

export default FileUpload;
