// db.js
class Database {
  constructor(dbName) {
    this.dbName = dbName;
    this.data = this.load() || {};
  }

  load() {
    try {
      return JSON.parse(require('fs').readFileSync(this.dbName + '.json'));
    } catch (err) {
      return null;
    }
  }

  save() {
    require('fs').writeFileSync(this.dbName + '.json', JSON.stringify(this.data));
  }

  create(collectionName, data) {
    try {
      if (!this.data[collectionName]) this.data[collectionName] = [];
      this.data[collectionName].push(data);
      this.save();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  read(collectionName, query = {}) {
    try {
      if (!this.data[collectionName]) return [];
      if (Object.keys(query).length === 0) return this.data[collectionName];
      return this.data[collectionName].filter(item => {
        for (const key in query) {
          if (item[key] !== query[key]) return false;
        }
        return true;
      });
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  update(collectionName, query, data) {
    try {
      const collection = this.data[collectionName];
      if (!collection) return false;
      const index = collection.findIndex(item => {
        for (const key in query) {
          if (item[key] !== query[key]) return false;
        }
        return true;
      });
      if (index === -1) return false;
      collection[index] = { ...collection[index], ...data };
      this.save();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  delete(collectionName, query) {
    try {
      const collection = this.data[collectionName];
      if (!collection) return false;
      const index = collection.findIndex(item => {
        for (const key in query) {
          if (item[key] !== query[key]) return false;
        }
        return true;
      });
      if (index === -1) return false;
      collection.splice(index, 1);
      this.save();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}

module.exports = Database;
```

```javascript
// app.js
const express = require('express');
const Database = require('./db');

const app = express();
app.use(express.json());

const db = new Database('data');

// Create
app.post('/api/:collection', (req, res) => {
  const collection = req.params.collection;
  const data = req.body;
  const success = db.create(collection, data);
  res.status(success ? 201 : 500).send({ message: success ? 'Document created successfully' : 'Failed to create document' });
});

// Read
app.get('/api/:collection', (req, res) => {
  const collection = req.params.collection;
  const query = req.query;
  const data = db.read(collection, query);
  res.send(data);
});

// Update
app.put('/api/:collection', (req, res) => {
  const collection = req.params.collection;
  const query = req.query;
  const data = req.body;
  const success = db.update(collection, query, data);
  res.status(success ? 200 : 404).send({ message: success ? 'Document updated successfully' : 'Document not found' });
});

// Delete
app.delete('/api/:collection', (req, res) => {
  const collection = req.params.collection;
  const query = req.query;
  const success = db.delete(collection, query);
  res.status(success ? 200 : 404).send({ message: success ? 'Document deleted successfully' : 'Document not found' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});