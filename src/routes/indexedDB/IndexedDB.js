import React from 'react';
import connection from './jsstore_con';

const stateDatabase = {
  name: 'IndexDBState',
  tables: [
    {
      name: 'States',
      columns: {
        id: {
          primaryKey: true,
          dataType: 'string',
        },
        state: {
          default: '',
          dataType: 'string',
        },
      },
    },
  ],
};

export default class IndexedDB extends React.Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    // limit accessing the global connection to this constructor call
    this.connection = connection;
    this.state = { html: '' };
  }

  componentDidMount() {
    (async () => {
      try {
        await this.connection.initDb(stateDatabase);
      } catch (error) {
        console.error(error);
      }
      this.inputRef.current.value = await this.getState('Input');
    })();
  }

  async getState(id) {
    const selectedArr = await this.connection.select({
      from: 'States',
      where: [{ id }],
    });

    // eslint-disable-next-line no-throw-literal
    if (selectedArr.length === 0) throw 'not found';

    return selectedArr[0].state;
  }

  async setState(id, state) {
    await this.connection.insert({
      into: 'States',
      values: [{ id, state }],
      upsert: true,
    });
  }

  handleInput = () => this.setState('Input', this.inputRef.current.value);

  render() {
    return (
      <div>
        <h1>IndexedDB with JsStore</h1>
        <div>{this.state.html}</div>
        <input type="text" ref={this.inputRef} onInput={this.handleInput} />
      </div>
    );
  }
}
