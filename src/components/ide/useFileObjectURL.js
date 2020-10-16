// @flow

import * as React from 'react';

import { fs } from 'filer';

import useFile, { Project } from './useFile';

export { Project };

type Encoding = 'utf8';

/**
 * Provides access to a file in a local project.
 * The file's content are loaded once, and saved on any modification.
 *
 * This function optionally accepts an encoding of `utf8`, in which case the file will be read and
 * written as utf8 text instead of binary.
 */
export default function useFileObjectURL(
  project: Project,
  path: string,
  encoding?: Encoding,
): string | null {
  const [content, _setContent] = useFile(project, path, encoding);

  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (content === null) return;

    const blob = new Blob([content]);
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);

    return () => {
      setUrl(null);
      URL.revokeObjectURL(objectUrl);
    };
  }, [content]);

  return url;
}
