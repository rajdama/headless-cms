import React, { useEffect, useState } from "react";
import axios from "axios";

const View = () => {
  const [tableNames, setTableNames] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [columnNames, setColumnNames] = useState([]);
  const [tableRecords, setTableRecords] = useState([]);
  const [inputs, setInputs] = useState([]);
  const [editRecord, setEditRecord] = useState({});

  const Defaults = { integer: "number", text: "", date: "date" };

  const handleAddInput = () => {
    let newInput;
    columnNames.map((column) => {
      newInput = {
        ...newInput,
        [column.column_name]: Defaults[column.data_type],
      };
    });
    setInputs([...inputs, newInput]);
  };

  const handleChange = (index, key, value) => {
    const newInputs = [...inputs];
    newInputs[index][key] = value;
    setInputs(newInputs);
  };

  const handleEdit = (key, value, id) => {
    console.log(id);
    setEditRecord({ ...editRecord, [key]: value });
  };

  const handleDataType = (value, type) => {
    let parsedValue;

    switch (type) {
      case "integer":
        parsedValue = Number(value);
        break;

      default:
        parsedValue = `'${value}'`;
        break;
    }

    return parsedValue;
  };

  const handleSave = async (index) => {
    const res = columnNames.map((column, i) => [
      column.column_name,
      handleDataType(inputs[index][column.column_name], column.data_type),
    ]);
    const response = await axios.post(
      "http://localhost:3001/api/createRecord",
      { name: selectedTable, record: res }
    );
    handleOnSelect(selectedTable);
  };

  const handleEditSave = async () => {
    const res = columnNames.map((column, i) => [
      column.column_name,
      handleDataType(editRecord[column.column_name], column.data_type),
    ]);
    const response = await axios.post("http://localhost:3001/api/editRecord", {
      record: res,
      table_name: selectedTable,
    });
    setEditRecord({});
    handleOnSelect(selectedTable);
    console.log(tableRecords);
  };

  const handleOnSelect = async (table_name) => {
    const response1 = await axios.post(
      "http://localhost:3001/api/getTableColumns?dataType=true",
      { table_name }
    );
    setColumnNames(response1.data);

    const response2 = await axios.post(
      "http://localhost:3001/api/getTableRecords",
      { table_name }
    );
    setTableRecords(response2.data);
    setInputs([]);
  };

  const handleOnDelete = async (column, table_name) => {
    const response1 = await axios.post(
      "http://localhost:3001/api/deleteRecord",
      { column, table_name }
    );
    const response2 = await axios.post(
      "http://localhost:3001/api/getTableRecords",
      { table_name }
    );
    setTableRecords(response2.data);
  };

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/getTableNames")
      .then((response) => {
        setTableNames(response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  return (
    <div className="container my-5">
      <div className="dropdown my-5">
        <button
          className="btn btn-secondary dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          {selectedTable === "" ? " Select Entity" : selectedTable}
        </button>
        <ul className="dropdown-menu">
          {tableNames.length !== 0 ? (
            tableNames.map((tableName, index) => (
              <li key={index}>
                <div
                  onClick={() => {
                    setSelectedTable(tableName);
                    handleOnSelect(tableName);
                  }}
                  className="dropdown-item"
                >
                  {tableName}
                </div>
              </li>
            ))
          ) : (
            <li>
              <div className="dropdown-item">No Entities</div>
            </li>
          )}
        </ul>
      </div>
      <div id="items" className="my-5">
        {selectedTable.length !== 0 && (
          <table className="table">
            <thead>
              <tr>
                {columnNames.map(
                  (columnName, index) =>
                    index !== 0 && (
                      <th key={index} scope="col">
                        {columnName.column_name}
                      </th>
                    )
                )}
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody id="tableBody">
              {tableRecords.length !== 0
                ? tableRecords.map((record, index1) => {
                    return editRecord.index !== index1 ? (
                      <tr key={index1}>
                        {columnNames.map(
                          (columnName, index2) =>
                            index2 !== 0 &&
                            (columnName.data_type !== "date" ? (
                              <td key={index2}>
                                {record[columnName.column_name]}
                              </td>
                            ) : (
                              <td key={index2}>
                                {new Date(
                                  record[columnName.column_name]
                                ).getDate()}
                                -
                                {new Date(
                                  record[columnName.column_name]
                                ).getMonth() + 1}
                                -
                                {new Date(
                                  record[columnName.column_name]
                                ).getFullYear()}
                              </td>
                            ))
                        )}
                        <td>
                          <button
                            onClick={() => {
                              const column = {
                                name: "id",
                                value: record["id"],
                              };
                              handleOnDelete(column, selectedTable);
                            }}
                            className="btn btn-sm btn-primary"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => {
                              setEditRecord({ ...record, index: index1 });
                            }}
                            className="btn btn-sm btn-primary ml-3"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        {columnNames.map(
                          (columnName, index) =>
                            index !== 0 && (
                              <td>
                                <input
                                  className="form-control"
                                  type={`${Defaults[columnName.data_type]}`}
                                  value={`${
                                    editRecord[columnName.column_name]
                                  }`}
                                  onChange={(e) => {
                                    console.log(e.target.value);
                                    handleEdit(
                                      `${columnName.column_name}`,
                                      e.target.value,
                                      editRecord["id"]
                                    );
                                  }}
                                />
                              </td>
                            )
                        )}
                        <td>
                          <button
                            onClick={handleEditSave}
                            className="btn btn-primary "
                          >
                            Save
                          </button>
                        </td>
                      </tr>
                    );
                  })
                : inputs.length === 0 && <h3 className="my-3">No record</h3>}
              {inputs.map((input, i) => (
                <tr>
                  {columnNames.map(
                    (columnName, index) =>
                      index !== 0 && (
                        <td>
                          <input
                            className="form-control"
                            type={`${Defaults[columnName.data_type]}`}
                            placeholder={`Enter ${columnName.column_name}`}
                            onChange={(e) => {
                              handleChange(
                                i,
                                `${columnName.column_name}`,
                                e.target.value
                              );
                            }}
                          />
                        </td>
                      )
                  )}
                  <td>
                    <button
                      onClick={(e) => {
                        handleSave(i);
                      }}
                      className="btn btn-primary "
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {selectedTable !== "" && (
          <button
            onClick={handleAddInput}
            id="add"
            className="btn btn-primary my-5"
          >
            Add Record
          </button>
        )}
      </div>
    </div>
  );
};

export default View;
