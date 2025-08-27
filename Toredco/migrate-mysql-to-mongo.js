const mysql = require('mysql2/promise');
const { MongoClient, ObjectId } = require('mongodb');

const MYSQL_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: 'your_mysql_password', // <-- sửa lại cho đúng
  database: 'your_mysql_dbname',   // <-- sửa lại cho đúng
};

const MONGO_URI = 'mongodb://localhost:27017';
const MONGO_DB = 'your_mongo_dbname'; // <-- sửa lại cho đúng

async function migrateTable(tableName) {
  // Kết nối MySQL
  const mysqlConn = await mysql.createConnection(MYSQL_CONFIG);
  const [rows] = await mysqlConn.execute(`SELECT * FROM ${tableName}`);
  await mysqlConn.end();

  // Kết nối MongoDB
  const mongoClient = new MongoClient(MONGO_URI);
  await mongoClient.connect();
  const db = mongoClient.db(MONGO_DB);

  // Chuyển đổi id sang ObjectId nếu cần
  const docs = rows.map(row => {
    if (row.id) {
      row._id = new ObjectId(); // Để MongoDB tự sinh _id mới
      delete row.id;
    }
    return row;
  });

  // Import vào MongoDB
  if (docs.length > 0) {
    await db.collection(tableName).insertMany(docs);
    console.log(`Đã chuyển ${docs.length} bản ghi từ ${tableName}`);
  } else {
    console.log(`Không có dữ liệu trong bảng ${tableName}`);
  }

  await mongoClient.close();
}

async function main() {
  await migrateTable('User');
  await migrateTable('Job');
  // Thêm các bảng khác nếu cần
}

main().catch(console.error); 