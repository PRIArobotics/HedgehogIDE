// @flow

import * as React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import * as hooks from '../../misc/hooks';

import useFileObjectURL, { Project } from '../useFileObjectURL';

type Props = {|
  layoutNode: any,
  project: Project,
  path: string,
|};

/**
 * Shows a project PDF file in an iframe.
 */
function PdfViewer({ layoutNode, project, path }: Props) {
  const url = useFileObjectURL(project, path);

  return url === null ? null : <iframe src={url} style={{ width: '100%', height: '100%' }} />;
}

export default PdfViewer;
