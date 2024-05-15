const express = require("express");
const bodyParser = require("body-parser");
const env = require("dotenv");
const cors = require("cors");
const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());
env.config();

const { Client } = require("pg");
const client = new Client({
  host: process.env.HOST,
  user: process.env.USER,
  port: process.env.PORT,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

client.connect();

app.post("/api/createEntity", (req, res) => {
  const { name, attributes } = req.body;
  let attributes_query = "id SERIAL PRIMARY KEY,";

  for (let index = 0; index < attributes.length; index++) {
    const attribute = attributes[index];
    attributes_query =
      attributes_query + `${attribute.name}` + ` ` + `${attribute.type}`;
    if (index != attributes.length - 1) {
      attributes_query = attributes_query + ",";
    }
  }

  const create_query = `CREATE TABLE IF NOT EXISTS ${name} (${attributes_query})`;

  client.query(create_query, (err, result) => {
    if (!err) {
      res.json({ message: "Entity created successfully" });
    } else {
      res.status(500).json({ error: err.message });
    }
    client.end;
  });
});

app.post("/api/updateAttributes", (req, res) => {
  const { name, attributes } = req.body;
  const query1 = `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${name}'`;

  client
    .query(query1)
    .then((result1) => {
      let changed = result1.rows.filter((column, index) => {
        if (
          column.column_name !== attributes[index].column_name ||
          column.data_type !== attributes[index].data_type
        ) {
          column.index = index;
          return column;
        }
      });

      for (
        let index = result1.rows.length;
        index < attributes.length;
        index++
      ) {
        const query2 = `ALTER TABLE ${name} ADD COLUMN ${attributes[index].column_name}  ${attributes[index].data_type}`;
        client.query(query2);
      }

      changed.forEach((element) => {
        if (element.index) {
          const old_name = element.column_name;
          const new_name = attributes[element.index].column_name;
          const old_type = element.data_type;
          const new_type = attributes[element.index].data_type;

          const name_query =
            old_name != new_name
              ? `ALTER TABLE ${name} RENAME COLUMN ${old_name} TO ${new_name}`
              : ``;

          const type_query =
            old_type != new_type
              ? `ALTER TABLE ${name} ALTER COLUMN ${new_name} SET DATA TYPE ${new_type} USING ${new_name}::${new_type}`
              : ``;

          Promise.all([client.query(name_query), client.query(type_query)])
            .then((results) => {
              res.send("Updated");
            })
            .catch((err) => {
              res.send(err);
              client.end();
            });
        }
      });
    })
    .catch((err) => {
      console.error("Error executing query1:", err);
      client.end();
    });
});

app.post("/api/updateTableName", (req, res) => {
  const { new_name, old_name } = req.body;
  console.log(new_name, old_name);

  client.query(
    `ALTER TABLE ${old_name} RENAME TO ${new_name}`,
    (err, result) => {
      if (!err) {
        res.json(result);
      } else {
        res.status(500).json({ error: err.message });
      }
      client.end;
    }
  );
});

app.post("/api/deleteAttribute", (req, res) => {
  const { attribute_name, table_name } = req.body;
  client.query(
    `ALTER TABLE ${table_name} DROP COLUMN ${attribute_name}`,
    (err, result) => {
      if (!err) {
        res.send("Deleted");
      } else {
        res.status(500).json({ error: err.message });
      }
      client.end;
    }
  );
});

app.get("/api/getTableNames", (req, res) => {
  client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public'",
    (err, result) => {
      if (!err) {
        let tableNames = result.rows;
        tableNames = tableNames.map((name, i) => {
          return name.table_name;
        });
        res.json(tableNames);
      } else {
        res.status(500).json({ error: err.message });
      }
      client.end;
    }
  );
});

app.post("/api/getTableRecords", (req, res) => {
  const table_name = req.body.table_name;
  client.query(`SELECT * FROM ${table_name}`, (err, result) => {
    if (!err) {
      res.json(result.rows);
    } else {
      res.status(500).json({ error: err.message });
    }
    client.end;
  });
});

app.post("/api/getTableColumns", (req, res) => {
  const table_name = req.body.table_name;
  const dataType = req.query.dataType;
  client.query(
    `SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = '${table_name}'`,
    (err, result) => {
      if (!err) {
        let columnNames = result.rows;
        if (dataType == "false") {
          columnNames = columnNames.map((name, i) => {
            return name.column_name;
          });
        }
        res.json(columnNames);
      } else {
        res.status(500).json({ error: err.message });
      }
      client.end;
    }
  );
});

app.post("/api/createRecord", (req, res) => {
  const { name, record } = req.body;
  let columns = "";
  let values = "";
  record.map((value, index) => {
    if (index != 0) {
      columns = columns + value[0];
      values = values + value[1];
      if (index != record.length - 1) {
        columns = columns + ",";
        values = values + ",";
      }
    }
  });
  let query = `INSERT INTO ${name} (${columns}) VALUES (${values})`;
  console.log(query);
  client.query(query, (err, result) => {
    if (!err) {
      res.json({ message: "Record created successfully" });
    } else {
      res.status(500).json({ error: err.message });
    }
    client.end;
  });
});

app.post("/api/editRecord", (req, res) => {
  const { table_name, record } = req.body;
  let update = "";

  record.map((value, index) => {
    if (index != 0) {
      update = update + `${value[0]} = ${value[1]}`;
      if (index != record.length - 1) {
        update = update + ",";
      }
    }
  });

  const query = `UPDATE ${table_name} SET ${update} WHERE ${record[0][0]} = ${record[0][1]}`;
  console.log(query);
  client.query(query, (err, result) => {
    if (!err) {
      res.json({ message: "Record edited successfully" });
    } else {
      res.status(500).json({ error: err.message });
    }
    client.end;
  });
});

app.post("/api/deleteRecord", (req, res) => {
  const { column, table_name } = req.body;
  client.query(
    `DELETE FROM ${table_name} WHERE ${column.name} = ${column.value}`,
    (err, result) => {
      if (!err) {
        res.json({ message: "Entity deleted successfully" });
      } else {
        res.status(500).json({ error: err.message });
      }
      client.end;
    }
  );
});

app.post("/api/deleteEntity", (req, res) => {
  const { table_name } = req.body;
  client.query(`DROP TABLE ${table_name}`, (err, result) => {
    if (!err) {
      res.json({ message: "Table deleted successfully" });
    } else {
      res.status(500).json({ error: err.message });
    }
    client.end;
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${process.env.SERVERPORT}`);
});
