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
    name: 'Demo',
    tables: [tblStudent],
  };
  return dataBase;
};

export default class IndexedDB extends React.Component {
  async componentDidMount() {
    try {
      await connection.initDb(getDatabase());
    } catch (ex) {
      console.error(ex);
    }
    const value = {
      name: 'someone',
      gender: 'male',
      country: 'somewhere',
      city: 'somewhere2',
    };
    console.log('Insert started');
    const noOfRowsInserted = await connection.insert({
      into: 'Students',
      values: [value],
    });
    if (noOfRowsInserted > 0) {
      console.log('Insert successful');
    }
    console.log(await this.getStudents());
    // await connection.clear('Students');
  }

  getStudents() {
    return connection.select({
      from: 'Students',
    });
  }

  render() {
    return <h1>Hallo</h1>;
  }
}
