
const mongoose = require('mongoose');

// 用于存储ID计数器的模型
const CounterSchema = new mongoose.Schema({
  model: { type: String, required: true, unique: true },
  count: { type: Number, default: 1 }
});

const Counter = mongoose.model('Counter', CounterSchema);

/**
 * 为指定模型生成顺序ID
 * @param {string} modelName - 模型名称
 * @returns {Promise<number>} - 生成的顺序ID
 */
async function generateSequentialId(modelName) {
  // 原子操作：查找并更新计数器
  const counter = await Counter.findOneAndUpdate(
    { model: modelName },
    { $inc: { count: 1 } },
    { new: true, upsert: true }
  );
  
  return counter.count;
}

module.exports = { generateSequentialId };