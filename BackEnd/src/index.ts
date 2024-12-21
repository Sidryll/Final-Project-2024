//app.ts

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import backendRouters from './routers';

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());
app.use('/api', backendRouters);

const port = 3000;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
