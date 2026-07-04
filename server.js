const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const JSLib = require('./js/listUser');
require('dotenv').config();

const app = express();
app.set ('views', path.join (__dirname , 'views')); 
app.set ('view engine', 'pug');

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGODB_URI
//const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qwen1';

if (!process.env.MONGODB_URI) {
  console.warn('Warning: MONGODB_URI is not set. Using fallback to localhost.');
}
// Новый блок
  //const uri = MONGO_URI;
  const { MongoClient } = require('mongodb');
  

  app.get('/add', async (req, res) => {
    const client = new MongoClient(MONGO_URI);

    try {
      const step = 10;
      const { len, lst } = await JSLib.save_user(
        client, 'John Doe-' + step, 'john.doe@example' + step + '.com'
      );

      res.render('users', {
        title: `Список новых пользователей (всего ${len})`,
        totalCount: len,
        lst,
      });
    } catch (error) {
      console.error('Ошибка:', error);
      res.status(500).json({ message: 'Ошибка при получении списка пользователей' });
    } finally {
      await client.close();
    }
  });

  app.get('/all_users', async (req, res) => {
    const client = new MongoClient(MONGO_URI);

    try {
      const { totalCount, lst } = await JSLib.list_users(client);
      res.render('users', {
        title: `Список пользователей (всего ${totalCount})`,
        totalCount,
        lst,
      });
    } catch (error) {
      console.error('Ошибка:', error);
      res.status(500).json({ message: 'Ошибка при получении списка пользователей' });
    } finally {
      await client.close();
    }
  });
  /*
  try {
    const { totalCount, lst } = await JSLib.list_users(client);
    res.render('users', {
      title: `Список пользователей (всего ${totalCount})`,
      totalCount,
      lst,
    });
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ message: 'Ошибка при получении списка пользователей' });
  } finally {
    await client.close();
  }
  //res.render('about', { title: '***Обо мне' });
  });
  
app.get('/api/list', async (req, res) => {
  try {
    const { totalCount, lst } = await JSLib.list_users(client);
    res.render('users', {
      title: `Список пользователей (всего ${totalCount})`,
      totalCount,
      lst,
    });
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ message: 'Ошибка при получении списка пользователей' });
  } finally {
    await client.close();
  }
});*/
// Новый блок - конец
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    match: [/^[А-ЯЁа-яёA-Za-z\s-]+$/, 'Имя не должно содержать цифр'],
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    match: [/^[А-ЯЁа-яёA-Za-z\s-]+$/, 'Фамилия не должна содержать цифр'],
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/.+@.+\..+/, 'Введите корректный email'],
    unique: true,
  },
}, {
  timestamps: true,
});

global.User = mongoose.model('users', userSchema);


/* app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Разрешить всем
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}); */
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
app.set('view engine', 'pug'); 

app.get('/', (req, res) => {
  res.render('index', { title: 'Главная' });
});

app.get('/register', (req, res) => {
  res.render('register', { title: 'Регистрация', withoutHeader: true });
});

app.get('/about', (req, res) => {
  res.render('about', { title: '***Обо мне' });
});

/*app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}).lean();
    res.json(users);
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    res.status(500).json({ message: 'Ошибка при получении пользователей' });
  }
});*/

app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    console.log('Received registration data:', { firstName, lastName, email });

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: 'Все поля обязательны для заполнения.' });
    }

    const user = new User({ firstName, lastName, email });
    await user.save();

    return res.status(201).json({ message: 'Пользователь успешно зарегистрирован.' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Пользователь с этим email уже существует.' });
    }

    const message = error.message || 'Ошибка при сохранении пользователя.';
    return res.status(500).json({ message });
  }
});

mongoose.connect(MONGO_URI, {
  
})
  .then(() => {
    console.log('Connected to MongoDB');
    /*
    const client = mongoose.connection.getClient();
    const db = client.db('sample_mflix');
    //const moviesCollection = db.collection('movies');
    count = await db.collection('users').countDocuments({});
    //console.log('Movies count:', moviesCollection.countDocuments({}));  
    console.log('Movies count:'+count);
    */
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

//work.countMyDocuments();