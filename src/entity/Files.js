const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Files',
  tableName: 'files',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    file_name: {
      type: 'varchar',
    },
    file_date: {
      type: 'timestamp',
    },
    created_at: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
});

