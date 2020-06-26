// @flow

import * as React from 'react';

import AceEditor from 'react-ace';
import Peer from 'peerjs';

import Controller from './conclave/controller';

type Props = {|
  connectionConfig: {|
    peerOptions: any,
    siteId: string,
    targetPeerId: string | null,
  |},
  ...React.ElementConfig<typeof AceEditor>,
|};
type Instance = React.ElementRef<typeof AceEditor>;

const AcePeerEditor = React.forwardRef<Props, Instance>(
  ({ connectionConfig, ...props }: Props, ref: ?Ref<Instance>) => {
    const [ace, setAce] = React.useState<Instance | null>(null);
    React.useEffect(() => {
      if (typeof ref === 'function') ref(ace);
      else if (ref) ref.current = ace;
    }, [ref, ace]);

    React.useEffect(() => {
      if (ace === null) return;

      const { peerOptions, siteId, targetPeerId } = connectionConfig;

      const controller = new Controller(
        siteId,
        targetPeerId,
        location.origin,
        new Peer({
          ...peerOptions,
          debug: 1,
        }),
        ace,
      );

      return () => {
        // TODO discard controller
      };
    }, [ace]);

    return <AceEditor ref={setAce} {...props} />;
  },
);

export type AcePeerEditorType = React.ElementRef<typeof AcePeerEditor>;
export default AcePeerEditor;
