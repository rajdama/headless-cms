import axios from "axios";
import React, { useEffect, useState } from "react";

const Delete = () => {
  const [selectedTable, setSelectedTable] = useState("");
  const [tableNames, setTableNames] = useState([]);

  const handleDelete = async () => {
    const response = await axios.post(
      "http://localhost:3001/api/deleteEntity",
      {
        table_name: selectedTable,
      }
    );
    alert("Deleted");
    window.location.reload();
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
        <button onClick={handleDelete} className="btn btn-danger ">
          Delete
        </button>
      )}
    </div>
  );
};

export default Delete;
