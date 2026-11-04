import express from 'express';
import { Thread } from '../models/threads.js';
import { getOpenAIResponse } from '../utils/openai.js';

const router = express.Router();

// GET /api/ask?message=hello  → returns AI reply directly
router.get('/ask', async (req, res) => {
    try {
        const { message } = req.query;
        if (!message) {
            return res.status(400).json({ error: "Please provide a 'message' query parameter" });
        }

        const aiReply = await getOpenAIResponse(message);
        res.status(200).json({ question: message, answer: aiReply });
    } catch (error) {
        console.error("Error in /ask:", error);
        res.status(500).json({ error: "Failed to get AI response" });
    }
});


//get all threads
router.get('/threads', async (req, res) => {
    try {
        const threads = await Thread.find().sort({ updatedAt: -1 });
        res.status(200).json(threads);
    } catch (error) {
        console.error("Error fetching threads:", error);
        res.status(500).json({ error: "Failed to fetch threads" });
    }
});

//get a specific thread by id
router.get('/threads/:id', async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id);
        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }
        res.status(200).json(thread);
    } catch (error) {
        console.error("Error fetching thread:", error);
        res.status(500).json({ error: "Failed to fetch thread" });
    }
});

// delete a specific thread by id
router.delete('/threads/:id', async (req, res) => {
    try {
        const thread = await Thread.findByIdAndDelete(req.params.id);   
        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }
        res.status(200).json({ message: "Thread deleted successfully" });
    } catch (error) {
        console.error("Error deleting thread:", error);
        res.status(500).json({ error: "Failed to delete thread" });
    }
});


//create a new thread
router.post('/threads', async (req, res) => {
    try {
        const { title, messages } = req.body;
        if (!title) {
            return res.status(400).json({ error: "Title is required" });
        }
        const newThread = new Thread({ title, messages });
        await newThread.save();
        res.status(201).json(newThread);
    } catch (error) {
        console.error("Error creating thread:", error);
        res.status(500).json({ error: "Failed to create thread" });
    }
});

//add a message to a specific thread
router.post('/threads/:id/messages', async (req, res) => {
    try {
        const { content, senderrole } = req.body;
        if (!content || !senderrole) {
            return res.status(400).json({ error: "Content and senderrole are required" });
        }
        const thread = await Thread.findById(req.params.id);
        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }
        thread.messages.push({ content, senderrole });
        thread.updatedAt = Date.now();
        await thread.save();
        res.status(201).json(thread);
    }
    catch (error) {
        console.error("Error adding message to thread:", error);
        res.status(500).json({ error: "Failed to add message to thread" });
    }
});



export default router;