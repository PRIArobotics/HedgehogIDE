import * as React from 'react';

import Layout from '../../components/layout/Layout';
import NoSSR from '../../components/misc/NoSSR';

async function action(context, params) {
  const projectName = params.id;

  const showIde = async () => {
    const { default: Ide } = await import('../../components/ide/Ide');

    return <Ide projectName={projectName} />;
  };
  return {
    title: projectName,
    chunks: ['ide'],
    component: (
      <Layout contentFill>
        <NoSSR key={`ide-${projectName}`}>{showIde}</NoSSR>
      </Layout>
    ),
  };
}

export default action;
