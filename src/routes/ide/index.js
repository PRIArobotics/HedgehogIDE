import React from 'react';
import Layout from '../../components/layout/Layout';
import NoSSR from '../../components/misc/NoSSR';

async function action() {
  const showIde = async () => {
    const { default: Ide } = await import('../../components/ide/Ide');

    return <Ide />;
  };
  return {
    title: 'IDE',
    chunks: ['ide'],
    component: (
      <Layout contentFill>
        <NoSSR key="ide">{showIde}</NoSSR>
      </Layout>
    ),
  };
}

export default action;
