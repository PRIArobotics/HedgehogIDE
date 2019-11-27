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

import filer, { fs } from 'filer';

import { Project } from '../../../core/store/projects';

import s from './Editor.scss';

type PropTypes = {|
  project: Project,
  path: string,
  onExecute: (code: string) => void | Promise<void>,
  onTerminate: () => void | Promise<void>,
  running: boolean,
  layoutNode: any,
|};
type StateTypes = {|
  content: string | null,
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
    content: null,
    editorWidth: '0',
    editorHeight: '0',
  };

  constructor(props: PropTypes) {
    super(props);

    this.refreshFile();
  }

  async refreshFile() {
    const { project, path } = this.props;
    const absolutePath = project.resolve(path);

    const content = await fs.promises.readFile(absolutePath, 'utf8');
    this.setState({ content });
  }

  setContent(content: string) {
    // only set content if the current content is not null,
    // i.e. the original file contents were loaded successfully,
    // and subsequently persist that content
    this.setState(
      ({ content: oldContent }) => (oldContent === null ? {} : { content }),
      () => this.save(),
    );
  }

  async save() {
    const { project, path } = this.props;
    const { content } = this.state;

    // if the content was not loaded yet for whatever reason,
    // don't delete existing file contents.
    if (content === null) return;

    const absolutePath = project.resolve(path);

    await fs.promises.writeFile(absolutePath, this.state.content, 'utf8');
  }

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
    const { running } = this.props;
    const { content, editorWidth, editorHeight } = this.state;

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
              onClick={() => this.props.onExecute(content)}
              disableRipple
              color="limegreen"
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
              onChange={text => this.setContent(text)}
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
