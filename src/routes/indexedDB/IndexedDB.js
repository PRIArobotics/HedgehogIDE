import React from 'react';
import * as JsStore from 'jsstore';

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
  constructor(props) {
    super(props);
    this.connection = new JsStore.Instance();
    try {
      this.connection.initDb(getDatabase()); // Error: Unhandled Rejection (ReferenceError): JsStoreWorker is not defined
    } catch (ex) {
      console.error(ex);
    }
    console.log(
      this.connection.select({
        from: 'Students',
      }),
    );
  }

  getStudents() {
    return this.connection.select({
      from: 'Students',
    });
  }

  render() {
    return <h1>Hallo</h1>;
  }
}
