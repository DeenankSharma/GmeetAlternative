import express from 'express';
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';
import authRoutes from './routes/auth.routes';
import connectToDB from './db/connectToDB';
import SignalingServer from './services/signalingServer';

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const server=http.createServer(app);
const signalingServer= new SignalingServer(server);

// Middlewares
app.use(
    cors({
        origin: "http://localhost:3000",
        optionsSuccessStatus: 200, 
    })
)
app.use(express.json()) 
app.use(cookieParser()) 
app.use(express.urlencoded({extended:true}));
app.use("/api/auth", authRoutes)

app.get('/',(req,res) => {
    res.send("Hello World")
})

app.post('/summarize', async (req, res) => {
    const { transcript } = req.body;
  
    try {
      const response = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-cnn', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: transcript,
        }),
      });
  
      const summary = await response.json();
      res.json(summary);
    } catch (error:any) {
      res.status(500).json({ error: error.message });
    }
  });

server.listen(PORT, () => {
    connectToDB();
    console.log(`server is running on port ${PORT}`)
})