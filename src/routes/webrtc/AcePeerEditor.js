// @flow

import * as React from 'react';

import AceEditor from 'react-ace';
import Peer from 'peerjs';

import Controller from './conclave/controller';

import type { AceRef, AceConfig } from './aceTypes';
import useRemoteCursors from './useRemoteCursors';

import s from './WebRTC.scss';

type Props = {|
  connectionConfig: {|
    peerOptions: any,
    siteId: string,
    targetPeerId: string | null,
  |},
  ...AceConfig,
|};
type Instance = AceRef;

const AcePeerEditor = React.forwardRef<Props, Instance>(
  ({ connectionConfig, markers, ...props }: Props, ref: ?Ref<Instance>) => {
    const [ace, setAce] = React.useState<Instance | null>(null);
    React.useEffect(() => {
      if (typeof ref === 'function') ref(ace);
      else if (ref) ref.current = ace;
    }, [ref, ace]);

    const remoteCursors = useRemoteCursors();

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

    function getMarkerClassName(_siteId: string, type: 'selection' | 'cursor') {
      return s[`remote-${type}`];
    }

    return (
      <AceEditor
        ref={setAce}
        markers={[...(markers ?? []), ...remoteCursors.getAceMarkers(getMarkerClassName)]}
        {...props}
      />
    );
  },
);

export type AcePeerEditorType = React.ElementRef<typeof AcePeerEditor>;
export default AcePeerEditor;
