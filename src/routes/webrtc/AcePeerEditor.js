// @flow

import * as React from 'react';

import AceEditor from 'react-ace';
import Peer from 'peerjs';

import Controller from './conclave/controller';

import type { AceRef, AceConfig } from './aceTypes';
import useConclave, { type ConnectionConfig } from './useConclave';

import s from './WebRTC.scss';

export type { ConnectionConfig };

type Props = {|
  connectionConfig: ConnectionConfig,
  ...AceConfig,
|};
type Instance = AceRef;

const AcePeerEditor = React.forwardRef<Props, Instance>(
  ({ connectionConfig, ...props }: Props, ref: ?Ref<Instance>) => {
    function getMarkerClassName(_siteId: string, type: 'selection' | 'cursor') {
      return s[`remote-${type}`];
    }

    const conclave = useConclave(connectionConfig, getMarkerClassName);

    return <AceEditor {...conclave.mountAceEditor(props)} />;
  },
);

export type AcePeerEditorType = React.ElementRef<typeof AcePeerEditor>;
export default AcePeerEditor;
