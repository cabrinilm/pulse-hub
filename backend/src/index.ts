import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './services/supabaseClient.ts';
import { ProfileController } from './controllers/ProfileController.ts';


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api', (_req, res) => {
  res.json({ message: 'PulseHub Backend' });
});

app.post('/api/signup', async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!/^[a-zA-Z0-9]{3,20}$/.test(username)) {
    return res.status(400).json({ error: 'Username must be 3-20 alphanumeric characters' });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ user_id: data.user.id, username });

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    res.status(201).json({ message: 'Signup successful', user: data.user });
  } else {
    res.status(400).json({ error: 'User creation failed' });
  }
});

app.post('/api/profile', ProfileController.create);
app.get('/api/profile', ProfileController.get);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});