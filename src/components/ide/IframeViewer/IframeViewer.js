// @flow

import * as React from 'react';

import useFileObjectURL, { Project } from '../useFileObjectURL';

type Props = {|
  layoutNode: any,
  project: Project,
  path: string,
|};

/**
 * Shows a project file in an iframe. This is effective for file types such as PDF documents or images.
 */
// eslint-disable-next-line no-unused-vars
function IframeViewer({ layoutNode, project, path }: Props) {
  const url = useFileObjectURL(project, path);

  return url === null ? null : (
    <iframe title={path} src={url} style={{ width: '100%', height: '100%' }} />
  );
}

export default IframeViewer;
