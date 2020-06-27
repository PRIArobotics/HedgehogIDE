// @flow

import * as React from 'react';

import Peer from 'peerjs';

import * as hooks from '../../components/misc/hooks';
import type { AceConfig, AceMarker, AcePosition } from './aceTypes';

import useRemoteCursors from './useRemoteCursors';
import useContent from './useContent';
import Controller from './conclave/controller';

export type ConnectionConfig = {|
  siteId: string,
  targetPeerId: string | null,
  peerOptions?: any,
  onOpen?: (id: string) => void,
|};

type ControllerAction =
  | {| type: 'REMOVE_CURSOR', siteId: string |}
  | {| type: 'INSERT', siteId: string, value: string, start: AcePosition, end: AcePosition |}
  | {| type: 'DELETE', siteId: string, value: string, start: AcePosition, end: AcePosition |};

type ConclaveHook = {|
  mountAceEditor(
    props: AceConfig | null,
  ): {|
    value: string,
    markers: AceMarker[],
    ...AceConfig,
  |},
|};

export default function useConclave(
  connectionConfig: ConnectionConfig,
  getMarkerClassName: (siteId: string, type: 'selection' | 'cursor') => string,
): ConclaveHook {
  const remoteCursors = useRemoteCursors(getMarkerClassName);

  const controller = hooks.useValue(() => {
    const { peerOptions, onOpen, siteId, targetPeerId } = connectionConfig;

    const controller = new Controller(
      siteId,
      targetPeerId,
      location.origin,
      new Peer({
        ...peerOptions,
        debug: 1,
      }),
    );

    if (onOpen) controller.broadcast.peer.on('open', onOpen);

    setTimeout(() => {
      remoteCursors.dispatch({
        type: 'SET',
        siteId: 'foo',
        remoteCursor: {
          selection: {
            start: { row: 1, column: 1 },
            end: { row: 1, column: 3 },
          },
          cursor: { row: 1, column: 3 },
        },
      });
    }, 5000);

    return controller;
  });

  const content = useContent(remoteCursors.dispatch, controller);

  React.useEffect(() => {
    function dispatch(action: ControllerAction) {
      switch (action.type) {
        case 'REMOVE_CURSOR': {
          const { siteId } = action;

          remoteCursors.dispatch({ type: 'REMOVE', siteId });
          return;
        }
        case 'INSERT': {
          content.refreshValue();
          return;
        }
        case 'DELETE': {
          content.refreshValue();
          return;
        }
      }
    }

    controller.dispatch = dispatch;
  }, [controller, remoteCursors.dispatch]);

  return {
    mountAceEditor(config: AceConfig | void) {
      const { ref, markers, ...props } = config ?? {};

      return {
        ...props,
        markers: [...(markers ?? []), ...remoteCursors.getAceMarkers()],
        onChange: content.onChange,
        value: content.value,
      };
    },
  };
}
