/* const mongoose = require("mongoose");

// 定义 MongoDB 连接参数
const username = "P2211355";
const rawPassword = "XHX123456";
const password = encodeURIComponent(rawPassword);
const cluster = "ecommerce.1rsj5.mongodb.net";
const dbName = "Ecommerce";
const options = "retryWrites=true&w=majority&appName=Ecommerce";

// 拼接 MongoDB 连接字符串
const mongoUrl = `mongodb+srv://${username}:${password}@${cluster}/${dbName}?${options}`;

// 连接 MongoDB
mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("成功连接到 MongoDB"))
  .catch((error) => console.error("连接 MongoDB 失败:", error));

module.exports = mongoose; */

const mongoose = require("mongoose");

// 定义 MongoDB 连接参数
const username = "P2211355";
const rawPassword = "XHX123456";
const password = encodeURIComponent(rawPassword);
const cluster = "ecommerce.1rsj5.mongodb.net";
const dbName = "Ecommerce";
const options = "retryWrites=true&w=majority&appName=Ecommerce";

// 拼接 MongoDB 连接字符串
const mongoUrl = `mongodb+srv://${username}:${password}@${cluster}/${dbName}?${options}`;

// 设置数据库索引的函数
const setupDatabaseIndexes = async () => {
  try {
    console.log('Setting up database indexes...');
    
    // 获取optionvalues集合引用
    const collection = mongoose.connection.collection('optionvalues');
    
    // 查找现有索引
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);
    
    // 查找并删除旧的唯一索引
    for (const index of indexes) {
      if (index.name === 'value_id_1' && index.unique) {
        console.log('Dropping old unique index on value_id');
        await collection.dropIndex('value_id_1');
      }
    }
    
    // 确保创建我们需要的复合索引
    console.log('Creating compound index on option_id and value_name');
    await collection.createIndex(
      { option_id: 1, value_name: 1 }, 
      { unique: true }
    );
    
    console.log('Database indexes setup completed');
  } catch (err) {
    console.error('Error setting up database indexes:', err);
  }
};

// 连接 MongoDB
mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("成功连接到 MongoDB");
    
    // 连接成功后设置索引
    await setupDatabaseIndexes();
  })
  .catch((error) => console.error("连接 MongoDB 失败:", error));

// 添加连接事件监听器，以便在重新连接时也执行索引设置
mongoose.connection.on('reconnected', async () => {
  console.log('MongoDB reconnected');
  await setupDatabaseIndexes();
});

module.exports = mongoose;