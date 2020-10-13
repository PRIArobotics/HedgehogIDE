// @flow

import * as React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import MDEditor from '@uiw/react-md-editor';
import md_s from '@uiw/react-md-editor/dist/markdown-editor.css';

import * as hooks from '../../misc/hooks';

import s from './Markdown.scss';

import useFile, { Project } from '../useFile';

export type ControlledState = {|
  mode: 'edit' | 'preview',
|};

type Props = {|
  layoutNode: any,
  project: Project,
  path: string,
  ...ControlledState,
  onUpdate: (state: ControlledState) => void | Promise<void>,
|};

/**
 * Wraps an `AceEditor` for display in a `FlexLayout` tab,
 * and for editing the contents of a project file.
 *
 * Besides the editor surface, the editor's toolbar allows running and terminating programs,
 * and resetting the simulation.
 */
function Markdown({ layoutNode, project, path, mode, onUpdate }: Props) {
  const [height, setHeight] = React.useState<number>(200);
  const containerRef = hooks.useElementRef<'div'>();

  const [content, setContent] = useFile(project, path);

  // update editor size when the containing tab is resized or made visible
  React.useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        if (containerRef.current === null) return;
        setHeight(containerRef.current.offsetHeight);
      }, 0);
    };

    layoutNode.setEventListener('resize', handleResize);
    layoutNode.setEventListener('visibility', handleResize);
    handleResize();

    return () => {
      layoutNode.setEventListener('resize', null);
      layoutNode.setEventListener('visibility', null);
    };
  }, [layoutNode, containerRef]);

  useStyles(s);
  useStyles(md_s);
  return (
    <div className={s.root}>
      <div key={`md-${height}`} className={s.container} ref={containerRef}>
        {content === null ? null : (
          mode === 'edit' ? (
            <MDEditor
              value={content}
              onChange={setContent}
              visiableDragbar={false}
              height={height}
            />
          ) : (
            <MDEditor.Markdown source={content} />
          )
        )}
      </div>
    </div>
  );
}
Markdown.defaultProps = {
  // eslint-disable-next-line react/default-props-match-prop-types
  mode: 'edit',
};

export default Markdown;