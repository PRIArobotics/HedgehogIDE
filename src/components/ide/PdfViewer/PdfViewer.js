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
 * Wraps an `AceEditor` for display in a `FlexLayout` tab,
 * and for editing the contents of a project file.
 *
 * Besides the editor surface, the editor's toolbar allows running and terminating programs,
 * and resetting the simulation.
 */
function PdfViewer({ layoutNode, project, path }: Props) {
  const url = useFileObjectURL(project, path);

  return url === null ? null : <iframe src={url} style={{ width: '100%', height: '100%' }} />;
}

export default PdfViewer;
