import React, { useEffect, useState } from "react";
import axios from "axios";

const Update = () => {
  const [inputs, setInputs] = useState([]);
  const [entityName, setEntityName] = useState("");
  const [selectedTable, setSelectedTable] = useState("");
  const dataTypes = ["integer", "text", "date"];
  const [tableNames, setTableNames] = useState([]);

  const handleAddInput = () => {
    setInputs([...inputs, { column_name: "", data_type: "" }]);
    console.log(inputs);
  };

  const handleSave = async () => {
    if (entityName !== selectedTable) {
      const response1 = await axios.post(
        "http://localhost:3001/api/updateTableName",
        { new_name: entityName, old_name: selectedTable }
      );
    }

    alert("Updated");
    window.location.reload();
    const response2 = await axios.post(
      "http://localhost:3001/api/updateAttributes",
      { name: entityName, attributes: inputs }
    );
  };

  const handleDelete = async (name) => {
    const response1 = await axios.post(
      "http://localhost:3001/api/deleteAttribute",
      { attribute_name: name, table_name: entityName }
    );

    handleOnSelect(entityName);
    console.log(inputs);
  };

  const handleChange = (index, key, value) => {
    const newInputs = [...inputs];
    newInputs[index][key] = value;
    setInputs(newInputs);
  };

  const handleOnSelect = async (table_name) => {
    const response1 = await axios.post(
      "http://localhost:3001/api/getTableColumns",
      { table_name }
    );
    setEntityName(table_name);
    response1.data = response1.data.map((column) => {
      column.delete = true;
      return column;
    });
    console.log(response1.data);
    setInputs(response1.data);
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
    <div className="container my-4">
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
      {selectedTable !== "" && (
        <div className="container">
          <form>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label>Name</label>
                <input
                  type="text"
                  className="form-control"
                  onChange={(e) => {
                    setEntityName(e.target.value);
                  }}
                  value={`${entityName}`}
                  placeholder="Entity name"
                />
              </div>
              <div className="form-group col-md-6"></div>

              {inputs.map(
                (input, index) =>
                  index !== 0 && (
                    <div className="d-flex col-md-12" key={index}>
                      <div className="form-group col-md-3">
                        <label>Name</label>
                        <input
                          className="form-control"
                          type="text"
                          placeholder="Attribute Name"
                          value={input.column_name}
                          onChange={(e) =>
                            handleChange(index, "column_name", e.target.value)
                          }
                        />
                      </div>
                      <div className="form-group col-md-3">
                        <label>Type</label>
                        {!input.delete ? (
                          <div className="dropdown ">
                            <button
                              className="btn btn-secondary dropdown-toggle"
                              type="button"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              {input.data_type === ""
                                ? " Select Type"
                                : input.data_type}
                            </button>
                            <ul className="dropdown-menu">
                              {dataTypes.map((type) => (
                                <li>
                                  <div
                                    onClick={() => {
                                      console.log(input);
                                      handleChange(index, "data_type", type);
                                    }}
                                    className="dropdown-item"
                                  >
                                    {type}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="dropdown ">
                            <button className="btn btn-secondary" type="button">
                              {input.data_type}
                            </button>
                          </div>
                        )}
                      </div>
                      <div className=" col-md-0 my-4">
                        {input.delete && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              inputs[index].delete = false;
                              handleDelete(input.column_name);
                            }}
                            className="btn btn-danger "
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  )
              )}
            </div>
          </form>
          <div className="d-flex">
            <button
              onClick={handleAddInput}
              id="add"
              className="btn btn-primary d-block mr-5"
            >
              Add Attributes
            </button>
            <button
              onClick={handleSave}
              id="add"
              className="btn btn-primary d-block"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Update;
