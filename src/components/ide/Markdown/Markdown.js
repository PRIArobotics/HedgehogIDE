// @flow

import * as React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import MDEditor, { commands } from '@uiw/react-md-editor';
// $FlowExpectError
import md_s from '@uiw/react-md-editor/dist/markdown-editor.css';

import { MarkdownFileIcon } from '../../misc/palette';
import * as hooks from '../../misc/hooks';

import s from './Markdown.scss';

import useFile, { Project } from '../useFile';

export type ControlledState = {|
  mode: 'edit' | 'preview' | 'default',
|};

type Props = {|
  layoutNode: any,
  project: Project,
  path: string,
  assets: Map<string, [string, Uint8Array]>,
  ...ControlledState,
  onUpdate: (state: ControlledState) => void | Promise<void>,
|};

/**
 * Wraps an `MDEditor` for display in a `FlexLayout` tab,
 * and for editing the contents of a project file.
 */
function Markdown({ layoutNode, project, path, assets, mode, onUpdate }: Props) {
  const [height, setHeight] = React.useState<number>(200);
  const containerRef = hooks.useElementRef<'div'>();

  const [content, setContent] = useFile(project, path, 'utf8');

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

  // update the mode on first load
  React.useEffect(() => {
    if (mode !== 'default' || content === null) return;

    onUpdate({ mode: content === '' ? 'edit' : 'preview' });
  }, [mode, content]);

  // resolve assets for the preview
  const [previewContent, setPreviewContent] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (content === null) {
      setPreviewContent(null);
      return;
    }

    const replaced = content.replaceAll(
      /\]\((asset:.*?)\)/g,
      (_match, asset) => `](${assets.get(asset)?.[0] ?? ''})`,
    );
    setPreviewContent(replaced);
  }, [content]);

  useStyles(s);
  useStyles(md_s);
  return (
    <div className={s.root}>
      <div key={`md-${height}`} className={s.container} ref={containerRef}>
        {content === null ? null : mode === 'edit' ? (
          <MDEditor
            value={content}
            onChange={setContent}
            visiableDragbar={false}
            height={height}
            commands={[
              ...commands.getCommands().slice(0, -1),
              {
                name: 'activatePreview',
                keyCommand: 'activatePreview',
                buttonProps: { 'aria-label': 'Activate Preview' },
                icon: commands.fullscreen.icon,
                execute: (_state, _api) => {
                  onUpdate({ mode: 'preview' });
                },
              },
            ]}
          />
        ) : (
          <div className={s.previewContainer}>
            <div className={s.preview}>
              <MDEditor.Markdown source={previewContent} />
            </div>
            <div className={s.previewToolbar}>
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => onUpdate({ mode: 'edit' })}>
                  <MarkdownFileIcon />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
Markdown.defaultProps = {
  // eslint-disable-next-line react/default-props-match-prop-types
  mode: 'default',
};

export default Markdown;
