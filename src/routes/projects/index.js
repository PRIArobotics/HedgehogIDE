// @flow

import * as React from 'react';

import Layout from '../../components/layout/Layout';
import NoSSR from '../../components/misc/NoSSR';

async function action() {
  const showProjectList = async () => {
    const {
      default: ProjectList,
    } = await import('../../components/projects/ProjectList');

    return <ProjectList />;
  };
  return {
    title: 'Projects',
    chunks: ['ide'],
    component: (
      <Layout>
        <NoSSR key="projects">{showProjectList}</NoSSR>
      </Layout>
    ),
  };
}

export default action;
