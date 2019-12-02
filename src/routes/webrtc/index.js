// @flow

import * as React from 'react';

import Layout from '../../components/layout/Layout';
import NoSSR from '../../components/misc/NoSSR';

async function action() {
  const showWebRTC = async () => {
    const { default: WebRTC } = await import('./WebRTC');

    return <WebRTC />;
  };
  return {
    title: 'WebRTC',
    chunks: ['webrtc'],
    component: (
      <Layout>
        <NoSSR key="webrtc">{showWebRTC}</NoSSR>
      </Layout>
    ),
  };
}

export default action;
