import React, { useEffect, useState } from "react";
import axios from "axios";

const Add = () => {
  const [inputs, setInputs] = useState([{ name: "", type: "" }]);
  const [entityName, setEntityName] = useState("");
  const [tableNames, setTableNames] = useState([]);
  const dataTypes = ["integer", "text", "date"];

  const handleAddInput = () => {
    setInputs([...inputs, { name: "", type: "" }]);
  };

  const handleSave = async () => {
    let duplicate = tableNames.filter((value) => value === entityName);
    if (duplicate.length === 0) {
      const response = await axios.post(
        "http://localhost:3001/api/createEntity",
        { name: entityName, attributes: inputs }
      );
      window.location.reload();
      alert("Saved");
    } else {
      alert(`${entityName} already present please change name`);
    }
  };

  const handleChange = (index, key, value) => {
    const newInputs = [...inputs];
    newInputs[index][key] = value;
    setInputs(newInputs);
  };

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/getTableNames")
      .then((response) => {
        console.log(response.data);
        setTableNames(response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);
  return (
    <div className="container my-4">
      <form>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label>Name</label>
            <input
              type="text"
              className="form-control"
              value={entityName}
              onChange={(e) => {
                const filteredValue = e.target.value.replace(/[\d\s]/g, "");
                setEntityName(filteredValue);
              }}
              placeholder="Entity name"
            />
          </div>
          <div className="form-group col-md-6"></div>
          {inputs.map((input, index) => (
            <div className="d-flex col-md-7" key={index}>
              <div className="form-group col-md-6">
                <label>Name</label>
                <input
                  className="form-control"
                  type="text"
                  placeholder="Attribute Name"
                  value={input.name}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    const filteredValue = inputValue.replace(/[\d\s]/g, "");
                    handleChange(index, "name", filteredValue);
                  }}
                />
              </div>
              <div className="form-group col-md-6">
                <label>Type</label>
                <div className="dropdown ">
                  <button
                    className="btn btn-secondary dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {input.type === "" ? " Select Type" : input.type}
                  </button>
                  <ul className="dropdown-menu">
                    {dataTypes.map((type, index2) => (
                      <li key={index2}>
                        <div
                          onClick={() => {
                            handleChange(index, "type", type);
                          }}
                          className="dropdown-item"
                        >
                          {type}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="form-group col-md-12"></div>
            </div>
          ))}
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
  );
};

export default Add;
