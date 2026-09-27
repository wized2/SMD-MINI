const fs = require('fs');
const path = require('path');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const { spawn } = require('child_process');

class AudioConverter {
    constructor() {
        this.tempDir = path.join(__dirname, '../temp');
        this.ensureTempDir();
    }

    ensureTempDir() {
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    async cleanFile(file) {
        if (file && fs.existsSync(file)) {
            await fs.promises.unlink(file).catch(() => {});
        }
    }

    async convert(buffer, args, ext, outExt) {
        const uid = Date.now() + '-' + Math.random().toString(36).slice(2);
        const inputPath = path.join(this.tempDir, `${uid}.${ext}`);
        const outputPath = path.join(this.tempDir, `${uid}.${outExt}`);

        await fs.promises.writeFile(inputPath, buffer);

        return new Promise((resolve, reject) => {
            const ffmpeg = spawn(ffmpegPath, [
                '-y',
                '-threads', '2',
                '-i', inputPath,
                ...args,
                outputPath
            ]);

            let stderr = '';

            ffmpeg.stderr.on('data', d => stderr += d.toString());

            const killer = setTimeout(() => {
                ffmpeg.kill('SIGKILL');
            }, 2 * 60 * 1000); // 2 minutes max

            ffmpeg.on('close', async (code) => {
                clearTimeout(killer);
                await this.cleanFile(inputPath);

                if (code !== 0) {
                    await this.cleanFile(outputPath);
                    return reject(new Error(stderr.slice(0, 300)));
                }

                try {
                    const data = await fs.promises.readFile(outputPath);
                    await this.cleanFile(outputPath);
                    resolve(data);
                } catch (e) {
                    reject(e);
                }
            });

            ffmpeg.on('error', async (err) => {
                clearTimeout(killer);
                await this.cleanFile(inputPath);
                await this.cleanFile(outputPath);
                reject(err);
            });
        });
    }

    // 🎵 MP3 (LONG FILE FRIENDLY)
    toAudio(buffer, ext) {
        return this.convert(buffer, [
            '-vn',
            '-ac', '2',
            '-ar', '44100',
            '-b:a', '128k',
            '-preset', 'veryfast',
            '-f', 'mp3'
        ], ext, 'mp3');
    }

    // 🎙️ WhatsApp PTT PERFECT
    toPTT(buffer, ext) {
        return this.convert(buffer, [
            '-vn',
            '-ac', '1',
            '-ar', '48000',
            '-c:a', 'libopus',
            '-b:a', '64k',
            '-vbr', 'on',
            '-compression_level', '10',
            '-f', 'opus'
        ], ext, 'opus');
    }
}

module.exports = new AudioConverter();
