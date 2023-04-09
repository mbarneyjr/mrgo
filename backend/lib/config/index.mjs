export default {
  dynamodb: {
    tableName: process.env.TABLE_NAME,
    indexes: {
      byUserId: 'byUserId',
    },
  },
};
