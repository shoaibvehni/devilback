const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use(bodyParser.json());
app.use(cors());

let messages = [];

// Endpoint to handle asking questions
app.post('/ask', (req, res) => {
    const { id, question } = req.body;
    const timestamp = new Date().toISOString();
    const newMessage = { id, question, answer: '', timestamp };
    messages.push(newMessage);
    io.emit('newMessage', newMessage); // Emit the new message event
    res.send({ status: 'Question received' });
});

// Endpoint to handle answering questions
app.post('/answer', (req, res) => {
    const { id, answer } = req.body;
    const timestamp = new Date().toISOString();
    const index = messages.findIndex(msg => msg.id === id);
    if (index !== -1) {
        messages[index] = { ...messages[index], answer, timestamp };
        io.emit('updateMessage', messages[index]); // Emit the update message event
        res.send({ status: 'Answer received' });
    } else {
        res.status(404).send({ error: 'Question not found' });
    }
});

// Endpoint to get all questions and their answers
app.get('/messages', (req, res) => {
    res.send(messages);
});

const PORT = 5000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
