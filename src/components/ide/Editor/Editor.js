// @flow

import * as React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import AceEditor from 'react-ace';
import 'brace/mode/javascript';
import 'brace/ext/language_tools';
import 'brace/theme/github';

import {
  ExecuteIcon,
  TerminateIcon,
  ResetIcon,
  TerminateAndResetIcon,
} from '../../misc/palette';

import ExecutionAction from '../Ide';
import ToolBar from '../ToolBar';
import ToolBarIconButton from '../ToolBar/ToolBarIconButton';
import ToolBarItem from '../ToolBar/ToolBarItem';

import s from './Editor.scss';

type Props = {|
  layoutNode: any,
  content: string | null,
  onContentChange: (content: string) => void | Promise<void>,
  onExecutionAction: (action: ExecutionAction) => void | Promise<void>,
  running: boolean,
|};

function Editor({
  layoutNode,
  content,
  onContentChange,
  onExecutionAction,
  running,
}: Props) {
  const [[width, height], setDimension] = React.useState<[string, string]>([
    '0',
    '0',
  ]);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // update editor size when the containing tab is resized or made visible
  React.useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        if (containerRef.current === null) return;
        setDimension([
          `${containerRef.current.offsetWidth}px`,
          `${containerRef.current.offsetHeight}px`,
        ]);
      }, 0);
    };

    layoutNode.setEventListener('resize', handleResize);
    layoutNode.setEventListener('visibility', handleResize);
    handleResize();

    return () => {
      layoutNode.setEventListener('resize', null);
      layoutNode.setEventListener('visibility', null);
    };
  }, [layoutNode]);

  useStyles(s);
  return (
    <div className={s.root}>
      <div className={s.container} ref={containerRef}>
        {content === null ? null : (
          <AceEditor
            mode="javascript"
            theme="github"
            name="editor"
            width={width}
            height={height}
            // onLoad={onLoad}
            onChange={text => onContentChange(text)}
            fontSize={16}
            // onSelectionChange={onSelectionChange}
            // onCursorChange={onCursorChange}
            // onValidate={onValidate}
            value={content}
            showGutter
            highlightActiveLine
            autoScrollEditorIntoView
            style={{
              position: 'absolute',
            }}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              // enableSnippets: enableSnippets,
              showLineNumbers: true,
              tabSize: 2,
            }}
          />
        )}
      </div>
      <ToolBar>
        <ToolBarItem>
          <ToolBarIconButton
            icon={ExecuteIcon}
            color="limegreen"
            onClick={() => {
              if (content !== null)
                onExecutionAction({
                  action: 'EXECUTE',
                  code: content,
                });
            }}
            disableRipple
            disabled={running || content === null}
          />
        </ToolBarItem>
        {running ? (
          <ToolBarItem key="terminate-and-reset">
            <ToolBarIconButton
              onClick={() => {
                onExecutionAction({
                  action: 'TERMINATE',
                  reset: true,
                });
              }}
              icon={TerminateAndResetIcon}
              color="red"
              disableRipple
            />
          </ToolBarItem>
        ) : (
          <ToolBarItem key="reset">
            <ToolBarIconButton
              onClick={() => {
                onExecutionAction({
                  action: 'RESET',
                });
              }}
              icon={ResetIcon}
              disableRipple
            />
          </ToolBarItem>
        )}
        <ToolBarItem>
          <ToolBarIconButton
            onClick={() => {
              onExecutionAction({
                action: 'TERMINATE',
                reset: false,
              });
            }}
            icon={TerminateIcon}
            color="red"
            disableRipple
            disabled={!running}
          />
        </ToolBarItem>
      </ToolBar>
    </div>
  );
}

export default Editor;
