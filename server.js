import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import path from 'path';

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files from the 'dist' folder
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// For any route, serve index.html so that React Router (or your client) can handle routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
