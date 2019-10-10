import React from 'react';
import connection from './jsstore_con';

const getDatabase = () => {
  const tblStudent = {
    name: 'Students',
    columns: {
      id: {
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        notNull: true,
        dataType: 'string',
      },
      gender: {
        dataType: 'string',
        default: 'male',
      },
      country: {
        notNull: true,
        dataType: 'string',
      },
      city: {
        dataType: 'string',
        notNull: true,
      },
    },
  };
  const dataBase = {
    name: 'IndexedDB',
    tables: [tblStudent],
  };
  return dataBase;
};

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
    this.dbRef = React.createRef();
    this.inputRef = React.createRef();
    // limit accessing the global connection to this constructor call
    this.connection = connection;
    this.state = { html: '' };
  }

  componentDidMount() {
    /* (async () => {
      try {
        await this.connection.initDb(getDatabase());
      } catch (ex) {
        console.error(ex);
      }
      await this.connection.clear('Students');
      await this.setStudents();
      this.dbRef.current.innerHTML += 'Inserted values:</br>';
      this.dbRef.current.innerHTML += JSON.stringify(await this.getStudents());
    })(); */
    (async () => {
      try {
        await this.connection.initDb(stateDatabase);
      } catch (error) {
        console.error(error);
      }
      this.inputRef.current.value = await this.selectDbState('Input');
    })();
  }

  async selectDbState(id) {
    const selectedArr = await this.connection.select({
      from: 'States',
      where: [
        {
          id,
        },
      ],
    });
    const selectedObj = selectedArr[0];
    return selectedObj.state;
  }

  async insertDbState(id, state) {
    await this.connection.insert({
      into: 'States',
      values: [
        {
          id,
          state,
        },
      ],
      upsert: true,
    });
  }

  async setStudents() {
    const value = {
      name: 'someone',
      /* gender: 'male', */
      // gender has a default value
      country: 'somewhere',
      city: 'somewhere2',
    };
    this.dbRef.current.innerHTML += 'Insert started</br>';
    const noOfRowsInserted = await this.connection.insert({
      into: 'Students',
      values: [value],
    });
    if (noOfRowsInserted > 0) {
      this.dbRef.current.innerHTML += 'Insert successful<br>';
    }
  }

  getStudents() {
    return this.connection.select({
      from: 'Students',
    });
  }

  handleInput = async () => {
    await this.insertDbState('Input', this.inputRef.current.value);
  };

  render() {
    return (
      <div>
        <h1>IndexedDB with JsStore</h1>
        <div>{this.state.html}</div>
        <form>
          <input type="text" ref={this.inputRef} onInput={this.handleInput} />
        </form>
      </div>
    );
  }
}
