// @flow

import * as React from 'react';

import { fs } from 'filer';

import { Project } from '../../../core/store/projects';

type Content = string;
type MaybeContent = Content | null;
type ContentSetter = (content: Content) => void | Promise<void>;

function useFile(
  project: Project,
  path: string,
): [MaybeContent, ContentSetter] {
  const [content, setContentImpl] = React.useState<MaybeContent>(null);

  // reload file contents when the project or file changes
  React.useEffect(() => {
    // load the file's contents
    (async () => {
      const absolutePath = project.resolve(path);

      const newContent = await fs.promises.readFile(absolutePath, 'utf8');
      setContentImpl(newContent);
    })();

    // after changing the file, set the content to null to prevent further use
    // of the old content
    return () => {
      setContentImpl(null);
    };
  }, [project, path]);

  // save the file when content changed
  // TODO test that the setContentImpl(null) when changing file is dispatched
  // before this effect, so that content can not be erroneously written to the
  // wrong file
  React.useEffect(() => {
    (async () => {
      // if the content was not loaded yet for whatever reason, don't delete
      // existing file contents.
      if (content === null) return;

      const absolutePath = project.resolve(path);
      await fs.promises.writeFile(absolutePath, content, 'utf8');
    })();
  }, [project, path, content]);

  function setContent(newContent: Content) {
    // only set content if the current content is not null,
    // i.e. the original file contents were loaded successfully
    if (content !== null) setContentImpl(newContent);
  }

  return [content, setContent];
}

type Props = {|
  project: Project,
  path: string,
  children: (
    content: MaybeContent,
    onContentChange: ContentSetter,
  ) => React.Node,
|};

function FileTab({ project, path, children }: Props) {
  const [content, setContent] = useFile(project, path);

  return children(content, setContent);
}

export default FileTab;
