async function save_user(parmclient, parmName, parmEmail) {

  if (!parmclient) {
    throw new Error('MongoClient is required');
  } 
  await parmclient.connect();

  const database = parmclient.db('sample_mflix');
  const collection = database.collection('users');
  const newUser = {
    name: parmName,
    email: parmEmail,
    TIMESTAMP : new Date(),
  };
      const answ = await collection.insertOne(newUser);
       

  const newUsers = await collection.countDocuments({ TIMESTAMP: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }  });
  const listUsers = await collection.find({TIMESTAMP: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)}}).toArray();
  const lst = listUsers.map((user) => ({
      firstName: user.name,
      email: user.email,
      TIMESTAMP: ' - ' + user.TIMESTAMP.toLocaleString(),
    }));
    //console.log(`Новый пользователь: ${listUsers.length} ${JSON.stringify(lst[1])}`);
const len = listUsers.length
  return { len, lst };
}
async function list_users(parmclient) {
  if (!parmclient) {
    throw new Error('MongoClient is required');
  }

  await parmclient.connect();

  const database = parmclient.db('sample_mflix');
  const collection = database.collection('users');

  const totalCount = await collection.countDocuments({});
  const listUsers = await collection.find({}).toArray();
  const lst = listUsers.map((user) => ({
    firstName: user.name,
    email: user.email,
    TIMESTAMP: '',//user.TIMESTAMP,
  }));

  //console.log(`form test Всего юзеров: ${totalCount}`);
  return { totalCount, lst };
}

async function getUsers(parm) {
  if (typeof window !== 'undefined') {
    const response = await fetch('/api/users');
    if (!response.ok) {
      throw new Error('Не удалось получить пользователей');
    }
    return response.json();
  }

  const mongoose = require('mongoose');
  const connectionString = parm || 'mongodb://localhost:27017/qwen1';

  const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
  }, {
    collection: 'users',
    timestamps: true,
  });

  const connection = mongoose.createConnection(connectionString);
  await connection.asPromise();

  try {
    const User = connection.model('User', userSchema, 'users');
    return await User.find({}).lean();
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    throw error;
  } finally {
    await connection.close();
  }
}

async function getUserCloud() {
  const MONGO_URI = 'mongodb+srv://jetsoft:jetsoft2026@cluster0.w292r7w.mongodb.net/';
  const { MongoClient } = require('mongodb');
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const database = client.db('sample_mflix');
    const collection = database.collection('users');
    return await collection.find({}).toArray();
  } catch (error) {
    console.error('Ошибка:', error);
    throw error;
  } finally {
    await client.close();
  }
}

async function countMyDocuments() {
  const MONGO_URI = 'mongodb+srv://jetsoft:jetsoft2026@cluster0.w292r7w.mongodb.net/';
  const { MongoClient } = require('mongodb');
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const database = client.db('sample_mflix');
    const collection = database.collection('movies');

    const totalCount = await collection.countDocuments({});
    console.log(`Всего документов: ${totalCount}`);
    if (typeof alert !== 'undefined') {
      alert(`Всего документов: ${totalCount}`);
    }

    const activeCount = await collection.countDocuments({ status: 'active' });
    console.log(`Активных документов: ${activeCount}`);
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await client.close();
  }
}

if (typeof window !== 'undefined') {
  window.getUsers = getUsers;
  window.countMyDocuments = countMyDocuments;
  window.getUserCloud = getUserCloud;
  window.test = list_users;
  window.save_user = save_user;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { save_user, list_users, test: list_users, getUsers, countMyDocuments, getUserCloud };
}