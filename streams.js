const express = require('express');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { pipeline } = require('stream');

const router = express.Router();
const DATA_DIR = path.join(__dirname, '..', 'data');

/**
 * 1. Use a readable stream to read a file in chunks and log each chunk.
 *    Input:  ./data/big.txt
 *    Output: logs each chunk to the console
 *    URL: GET /stream/read-chunks
 */
router.get('/read-chunks', (req, res) => {
  const filePath = path.join(DATA_DIR, 'big.txt');
  const readable = fs.createReadStream(filePath, {
    encoding: 'utf8',
    highWaterMark: 16 * 1024 // 16KB chunks
  });

  let chunkCount = 0;

  readable.on('data', (chunk) => {
    chunkCount++;
    console.log(`Chunk #${chunkCount} (${chunk.length} chars):`);
    console.log(chunk.slice(0, 100) + '...'); // log a preview of the chunk
  });

  readable.on('end', () => {
    console.log(`Finished reading. Total chunks: ${chunkCount}`);
    res.json({ message: 'File read in chunks successfully.', totalChunks: chunkCount });
  });

  readable.on('error', (err) => {
    console.error('Error reading file:', err);
    res.status(500).json({ message: 'Error reading file.', error: err.message });
  });
});

/**
 * 2. Use readable and writable streams to copy content from one file to another.
 *    Input:  ./data/source.txt -> ./data/dest.txt
 *    Output: File copied using streams
 *    URL: GET /stream/copy
 */
router.get('/copy', (req, res) => {
  const sourcePath = path.join(DATA_DIR, 'source.txt');
  const destPath = path.join(DATA_DIR, 'dest.txt');

  const readable = fs.createReadStream(sourcePath);
  const writable = fs.createWriteStream(destPath);

  readable.pipe(writable);

  writable.on('finish', () => {
    console.log('File copied using streams.');
    res.json({ message: 'File copied using streams.' });
  });

  readable.on('error', (err) => {
    res.status(500).json({ message: 'Error reading source file.', error: err.message });
  });

  writable.on('error', (err) => {
    res.status(500).json({ message: 'Error writing destination file.', error: err.message });
  });
});

/**
 * 3. Create a pipeline that reads a file, compresses it, and writes it to another file.
 *    Input:  ./data/data.txt -> ./data/data.txt.gz
 *    URL: GET /stream/compress
 */
router.get('/compress', (req, res) => {
  const inputPath = path.join(DATA_DIR, 'data.txt');
  const outputPath = path.join(DATA_DIR, 'data.txt.gz');

  const readable = fs.createReadStream(inputPath);
  const gzip = zlib.createGzip();
  const writable = fs.createWriteStream(outputPath);

  pipeline(readable, gzip, writable, (err) => {
    if (err) {
      console.error('Pipeline failed:', err);
      return res.status(500).json({ message: 'Compression failed.', error: err.message });
    }
    console.log('File compressed successfully using pipeline.');
    res.json({ message: 'File compressed and written successfully.', output: 'data.txt.gz' });
  });
});

module.exports = router;
