const { Worker } = require('bullmq');
const path = require('path');
const fs = require('fs-extra');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('ffprobe-static').path;
const Deal = require('../models/Deal');
require('dotenv').config();

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5003";

const convertToWebm = (filePath, component) => {
    return new Promise(async (resolve, reject) => {
        try {
            const uploadDir = path.join(process.cwd(), 'uploads', component);
            await fs.ensureDir(uploadDir);

            const parsedPath = path.parse(filePath);
            const filename = `${parsedPath.name}.webm`;
            const webmPath = path.join(uploadDir, filename);

            ffmpeg(filePath)
                .outputOptions(['-c:v libvpx-vp9', '-crf 35', '-b:v 0', '-c:a libopus'])
                .output(webmPath)
                .on('end', async () => {
                    try {
                        await fs.unlink(filePath);
                        console.log(`✅ Video converted to WebM: ${webmPath}`);
                        resolve(`${SERVER_URL}/uploads/${component}/${filename}`);
                    } catch (unlinkError) {
                        console.error(`❌ Error deleting original file: ${unlinkError.message}`);
                        reject(unlinkError); // Reject if original file deletion fails
                    }
                })
                .on('error', (err) => {
                    console.error(`❌ Error converting video to WebM: ${err.message}`);
                    fs.unlink(filePath).catch(e => console.error(`Failed to delete original file after error: ${e.message}`));
                    reject(err);
                })
                .run();
        } catch (error) {
            console.error(`❌ Error in convertToWebm setup: ${error.message}`);
            reject(error);
        }
    });
};

const worker = new Worker('video-processing', async job => {
  const { dealId, videoId, tempFilePath } = job.data;
  console.log(`Processing video for deal: ${dealId}, video: ${videoId}`);

  try {
    const finalUrl = await convertToWebm(tempFilePath, 'dealvideos');

    const deal = await Deal.findById(dealId);
    if (deal) {
      const video = deal.videos.id(videoId);
      if (video) {
        video.url = finalUrl;
        video.status = 'ready';
        await deal.save();
        console.log(`✅ Successfully updated video status to 'ready' for deal: ${dealId}`);
      }
    }
  } catch (error) {
    console.error(`❌ Video processing failed for deal: ${dealId}, video: ${videoId}`, error);
    const deal = await Deal.findById(dealId);
    if (deal) {
      const video = deal.videos.id(videoId);
      if (video) {
        video.status = 'failed';
        await deal.save();
      }
    }
  }
}, {
    connection: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
    },
    limiter: {
      max: 5, // Process 5 jobs every
      duration: 1000, // 1 second
    },
});

console.log("Video worker started");

module.exports = { worker }; 