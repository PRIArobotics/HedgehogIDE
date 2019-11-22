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

type AceState = any;

type PropTypes = {|
  callbackSave: (state: AceState) => void,
  callbackGet: () => AceState,
  onExecute: (code: string) => void | Promise<void>,
  onTerminate: () => void | Promise<void>,
  running: boolean,
  layoutNode: any,
|};
type StateTypes = {|
  initial: boolean,
  editorHeight: string,
  editorWidth: string,
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
  value: AceState;

  state = {
    initial: true,
    editorWidth: '0',
    editorHeight: '0',
  };

  constructor(props: PropTypes) {
    super(props);
    this.value = this.props.callbackGet();
  }

  componentDidMount() {
    this.setState({ initial: false });
    this.props.layoutNode.setEventListener('resize', this.handleResize);
    this.props.layoutNode.setEventListener('visibility', this.handleResize);
    this.handleResize();
  }

  onChange = (newValue: AceState) => {
    this.value = newValue;
    this.props.callbackSave(this.value);
  };

  handleResize = () => {
    setTimeout(() => {
      if (this.containerRef.current !== null) {
        this.setState({
          editorHeight: `${this.containerRef.current.offsetHeight}px`,
          editorWidth: `${this.containerRef.current.offsetWidth}px`,
        });
      }
    }, 0);
  };

  render() {
    // not rendering directly after the component was mounted
    // somehow fixes a strange display bug.
    if (this.state.initial) return null;

    return (
      <div className={s.root}>
        <div className={s.sidebar}>
          {this.props.running ? (
            <ColoredIconButton
              onClick={() => this.props.onTerminate()}
              disableRipple
              color="red"
            >
              <StopIcon />
            </ColoredIconButton>
          ) : (
            <ColoredIconButton
              onClick={() => this.props.onExecute(this.value)}
              disableRipple
              color="limegreen"
            >
              <PlayArrowIcon />
            </ColoredIconButton>
          )}
          <br />
        </div>
        <div className={s.container} ref={this.containerRef}>
          <AceEditor
            mode="javascript"
            name="editor"
            height={this.state.editorHeight}
            width={this.state.editorWidth}
            ref={this.editorRef}
            // onLoad={this.onLoad}
            onChange={this.onChange}
            fontSize={16}
            // onSelectionChange={this.onSelectionChange}
            // onCursorChange={this.onCursorChange}
            // onValidate={this.onValidate}
            value={this.value}
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
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Editor);
