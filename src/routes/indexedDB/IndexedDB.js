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
      await connection.initDb(getDatabase()); // Error: Unhandled Rejection (ReferenceError): JsStoreWorker is not defined
    } catch (ex) {
      console.error(ex);
    }
    console.log(
      await connection.select({
        from: 'Students',
      }),
    );
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
