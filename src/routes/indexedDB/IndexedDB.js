import React from 'react';
import { connection } from './jsstore_con';

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

export default class IndexedDB extends React.Component {
  constructor(props) {
    super(props);
    this.dbRef = React.createRef();
  }

  async componentDidMount() {
    try {
      await connection.initDb(getDatabase());
    } catch (ex) {
      console.error(ex);
    }
    await connection.clear('Students');
    await this.setStudents();
    this.dbRef.current.innerHTML += 'Inserted values:</br>';
    this.dbRef.current.innerHTML += JSON.stringify(await this.getStudents());
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
    const noOfRowsInserted = await connection.insert({
      into: 'Students',
      values: [value],
    });
    if (noOfRowsInserted > 0) {
      this.dbRef.current.innerHTML += 'Insert successful</br>';
    }
  }

  getStudents() {
    return connection.select({
      from: 'Students',
    });
  }

  render() {
    return (
      <div>
        <h1>IndexedDB with JsStore</h1>
        <div ref={this.dbRef} />
      </div>
    );
  }
}
