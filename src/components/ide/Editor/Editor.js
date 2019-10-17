// @flow

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import AceEditor from 'react-ace';

import StopIcon from '@material-ui/icons/Stop';
import { styled } from '@material-ui/styles';
import IconButton from '@material-ui/core/IconButton';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import s from './Editor.scss';
import 'brace/mode/javascript';
import 'brace/ext/language_tools';

type AceState = any;

type PropTypes = {|
  callbackSave: (state: AceState) => void,
  callbackGet: () => AceState,
  callbackRun: (code: string) => void,
  callbackStop: () => void,
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
  value: AceState;

  state = {
    initial: true,
    editorWidth: '0',
    editorHeight: '0',
  };

  constructor(props: PropTypes) {
    super(props);
    this.value = this.props.callbackGet();
    this.containerRef = React.createRef();
    this.editorRef = React.createRef();
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
      this.setState({
        editorHeight: `${this.containerRef.current.offsetHeight}px`,
        editorWidth: `${this.containerRef.current.offsetWidth}px`,
      });
    }, 0);
  };

  handleRunCode = () => {
    this.props.callbackRun(this.value);
  };

  handleStopCode = () => {
    this.props.callbackStop();
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
              onClick={this.handleStopCode}
              disableRipple
              color="red"
            >
              <StopIcon />
            </ColoredIconButton>
          ) : (
            <ColoredIconButton
              onClick={this.handleRunCode}
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