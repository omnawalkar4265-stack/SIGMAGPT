import dns from 'node:dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import chatRouter from './routs/chat.js';

const port = process.env.PORT || 8080;
const app = express();

app.use(express.json());
app.use(cors());
app.use('/api', chatRouter);



app.get('/', (req, res) => {
    res.send('SIGMAGPT Backend is Running Successfully!');
});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

connectDB();

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});