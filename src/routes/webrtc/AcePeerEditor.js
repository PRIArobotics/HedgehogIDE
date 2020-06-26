// @flow

import * as React from 'react';

import AceEditor from 'react-ace';

type Props = {|
  ...React.ElementConfig<typeof AceEditor>,
|};
type Instance = React.ElementRef<typeof AceEditor>;

const AcePeerEditor = React.forwardRef<Props, Instance>((props: Props, ref: Ref<Instance>) => {
  return (
    <AceEditor ref={ref} {...props} />
  );
});

export type AcePeerEditorType = React.ElementRef<typeof AcePeerEditor>;
export default AcePeerEditor;
