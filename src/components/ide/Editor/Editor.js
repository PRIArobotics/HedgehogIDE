// @flow

import * as React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import AceEditor from 'react-ace';
import 'brace/mode/javascript';
import 'brace/ext/language_tools';

import StopIcon from '@material-ui/icons/Stop';
import { styled } from '@material-ui/styles';
import IconButton from '@material-ui/core/IconButton';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

import s from './Editor.scss';

type PropTypes = {|
  layoutNode: any,
  content: string | null,
  onContentChange: (content: string) => void | Promise<void>,
  onExecute: (code: string) => void | Promise<void>,
  onTerminate: () => void | Promise<void>,
  running: boolean,
|};
type StateTypes = {|
  editorWidth: string,
  editorHeight: string,
|};

const ColoredIconButton = styled(({ color, ...other }) => (
  <IconButton {...other} />
))({
  color: props => props.color,
  padding: '4px',
});

class Editor extends React.Component<PropTypes, StateTypes> {
  containerRef: RefObject<'div'> = React.createRef();
  editorRef: RefObject<typeof AceEditor> = React.createRef();

  state = {
    editorWidth: '0',
    editorHeight: '0',
  };

  componentDidMount() {
    this.props.layoutNode.setEventListener('resize', this.handleResize);
    this.props.layoutNode.setEventListener('visibility', this.handleResize);
    this.handleResize();
  }

  handleResize = () => {
    setTimeout(() => {
      if (this.containerRef.current !== null) {
        this.setState({
          editorWidth: `${this.containerRef.current.offsetWidth}px`,
          editorHeight: `${this.containerRef.current.offsetHeight}px`,
        });
      }
    }, 0);
  };

  render() {
    const { content, running } = this.props;
    const { editorWidth, editorHeight } = this.state;

    return (
      <div className={s.root}>
        <div className={s.sidebar}>
          {running ? (
            <ColoredIconButton
              onClick={() => this.props.onTerminate()}
              disableRipple
              color="red"
            >
              <StopIcon />
            </ColoredIconButton>
          ) : (
            <ColoredIconButton
              onClick={() => {
                if (content !== null) this.props.onExecute(content);
              }}
              disableRipple
              color="limegreen"
              disabled={content === null}
            >
              <PlayArrowIcon />
            </ColoredIconButton>
          )}
          <br />
        </div>
        <div className={s.container} ref={this.containerRef}>
          {content === null ? null : (
            <AceEditor
              mode="javascript"
              name="editor"
              width={editorWidth}
              height={editorHeight}
              ref={this.editorRef}
              // onLoad={this.onLoad}
              onChange={text => this.props.onContentChange(text)}
              fontSize={16}
              // onSelectionChange={this.onSelectionChange}
              // onCursorChange={this.onCursorChange}
              // onValidate={this.onValidate}
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
                // enableSnippets: this.state.enableSnippets,
                showLineNumbers: true,
                tabSize: 2,
              }}
            />
          )}
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Editor);
