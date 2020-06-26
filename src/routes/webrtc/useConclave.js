// @flow

import * as React from 'react';

import Peer from 'peerjs';

import type { AceRef, AceConfig, AceMarker } from './aceTypes';

import useRemoteCursors from './useRemoteCursors';
import Controller from './conclave/controller';

type ConnectionConfig = {|
  peerOptions: any,
  siteId: string,
  targetPeerId: string | null,
|};

type ConclaveHook = {|
  mountAceEditor(props: AceConfig | null): {|
    ref: (AceRef | null) => void,
    value: string,
    markers: AceMarker[],
    ...AceConfig,
  |},
|};

export default function useConclave(
  connectionConfig: ConnectionConfig,
  getMarkerClassName: (siteId: string, type: 'selection' | 'cursor') => string,
): ConclaveHook {
  const [ace, setAce] = React.useState<AceRef | null>(null);

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

    setTimeout(() => {
      remoteCursors.dispatch({
        type: 'SET',
        siteId: 'foo',
        remoteCursor: {
          selection: {
            start: { row: 0, column: 1 },
            end: { row: 0, column: 3 },
          },
          cursor: { row: 0, column: 3 },
        },
      });
    }, 5000);

    return () => {
      // TODO discard controller
    };
  }, [ace]);

  return {
    mountAceEditor(config: AceConfig | void) {
      const { ref, markers, ...props } = config ?? {};

      return {
        ref: setAce,
        ...props,
        markers: [...(markers ?? []), ...remoteCursors.getAceMarkers(getMarkerClassName)],
        value: '',
      };
    },
  }
}
