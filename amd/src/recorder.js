// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Screen capture, composition, preview and upload workflow.
 *
 * @module      tiny_screenrecorder/recorder
 * @package   tiny_screenrecorder
 * @copyright   2026 Eduardo Kraus
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import Modal from 'core/modal';
import ModalEvents from 'core/modal_events';
import * as Templates from 'core/templates';
import {get_string as getString} from 'core/str';
import {add as addToast} from 'core/toast';
import {component} from './common';
import {getData} from './options';

/**
 * Format a duration in seconds.
 *
 * @param {Number} seconds
 * @returns {String}
 */
export const formatDuration = (seconds) => {
    const safe = Math.max(0, Math.floor(Number(seconds) || 0));
    const minutes = Math.floor(safe / 60);
    const remainder = String(safe % 60).padStart(2, '0');
    return `${minutes}:${remainder}`;
};

/**
 * Determine the extension for a MediaRecorder MIME type.
 *
 * @param {String} mimetype
 * @returns {String}
 */
export const extensionFromMime = (mimetype) =>
    String(mimetype).toLowerCase().includes('mp4') ? 'mp4' : 'webm';

/**
 * Pick a MediaRecorder MIME type supported by this browser.
 *
 * @returns {String}
 */
const chooseMimeType = () => {
    const candidates = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4;codecs=avc1,mp4a.40.2',
        'video/mp4',
    ];

    return candidates.find((type) => window.MediaRecorder.isTypeSupported(type)) || '';
};

/**
 * Open the recorder modal.
 *
 * @param {TinyMCE} editor
 * @returns {Promise<void>}
 */
export const openRecorder = async(editor) => {
    const config = getData(editor);
    const body = await Templates.render('tiny_screenrecorder/recorder', {
        allowwebcam: Boolean(config.allowwebcam),
        allowmicrophone: Boolean(config.allowmicrophone),
        allowppt: Boolean(config.allowppt),
        maxduration: formatDuration(config.maxduration),
    });
    const title = await getString('modal:title', component);
    const modal = await Modal.create({
        title,
        body,
        large: true,
        removeOnClose: true,
    });

    const recorder = new ScreenRecorder(editor, modal, config);
    modal.getRoot().on(ModalEvents.hidden, () => recorder.destroy());
    modal.show();
};

/**
 * Recorder controller. Capture/composition concepts are adapted from Kopere Kapture,
 * but storage and UI are native Moodle APIs.
 */
class ScreenRecorder {
    /**
     * @param {TinyMCE} editor
     * @param {Modal} modal
     * @param {Object} config
     */
    constructor(editor, modal, config) {
        this.editor = editor;
        this.modal = modal;
        this.config = config;
        this.root = modal.getRoot()[0].querySelector('[data-region="screenrecorder"]');
        this.preview = this.root.querySelector('[data-region="preview"]');
        this.canvas = this.root.querySelector('[data-region="canvas"]');
        this.screenVideo = this.root.querySelector('[data-region="screen-source"]');
        this.webcamVideo = this.root.querySelector('[data-region="webcam-source"]');
        this.timer = this.root.querySelector('[data-region="timer"]');
        this.progress = this.root.querySelector('[data-region="progress"]');
        this.progressBar = this.root.querySelector('[data-region="progressbar"]');
        this.status = this.root.querySelector('[data-region="status"]');
        this.startButton = this.root.querySelector('[data-action="start"]');
        this.stopButton = this.root.querySelector('[data-action="stop"]');
        this.rerecordButton = this.root.querySelector('[data-action="rerecord"]');
        this.downloadButton = this.root.querySelector('[data-action="download"]');
        this.uploadButton = this.root.querySelector('[data-action="upload"]');
        this.webcamCheckbox = this.root.querySelector('[data-option="webcam"]');
        this.microphoneCheckbox = this.root.querySelector('[data-option="microphone"]');
        this.source = 'screen';
        this.chunks = [];
        this.elapsedSeconds = 0;
        this.destroyed = false;
        this.audioSources = [];
        this.objectUrl = null;
        this.registerEvents();
        this.updateTimer(0);
    }

    registerEvents() {
        this.root.querySelectorAll('[data-source]').forEach((button) => {
            button.addEventListener('click', () => {
                this.source = button.dataset.source;
                this.root.querySelectorAll('[data-source]').forEach((item) => {
                    item.classList.toggle('active', item === button);
                    item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
                });
                const help = this.root.querySelector('[data-region="presentation-help"]');
                if (help) {
                    help.classList.toggle('d-none', this.source !== 'presentation');
                }
            });
        });

        this.startButton.addEventListener('click', () => this.start());
        this.stopButton.addEventListener('click', () => this.stop());
        this.rerecordButton.addEventListener('click', () => this.reset());
        this.downloadButton.addEventListener('click', () => this.download());
        this.uploadButton.addEventListener('click', () => this.upload());
    }

    /**
     * Start capture and recording.
     *
     * @returns {Promise<void>}
     */
    async start() {
        if (!window.isSecureContext || !navigator.mediaDevices?.getDisplayMedia || !window.MediaRecorder) {
            await addToast(await getString('error:browser', component), {type: 'error'});
            return;
        }

        this.startButton.disabled = true;
        this.setStatus(await getString('status:acquiring', component));

        try {
            const displayOptions = {
                video: this.source === 'presentation' ? {
                    displaySurface: 'window',
                    frameRate: {ideal: 30, max: 30},
                } : {
                    frameRate: {ideal: 30, max: 30},
                },
                audio: true,
                systemAudio: 'include',
                preferCurrentTab: false,
            };

            this.screenStream = await navigator.mediaDevices.getDisplayMedia(displayOptions);
            const screenTrack = this.screenStream.getVideoTracks()[0];
            if (!screenTrack) {
                throw new Error('No screen video track returned by the browser.');
            }
            screenTrack.addEventListener('ended', () => this.stop());

            if (this.webcamCheckbox?.checked) {
                try {
                    this.webcamStream = await navigator.mediaDevices.getUserMedia({
                        video: {width: {ideal: 1280}, height: {ideal: 720}},
                        audio: false,
                    });
                } catch (error) {
                    this.webcamCheckbox.checked = false;
                    await addToast(await getString('error:webcam', component), {type: 'warning'});
                }
            }

            if (this.microphoneCheckbox?.checked) {
                try {
                    this.microphoneStream = await navigator.mediaDevices.getUserMedia({
                        video: false,
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                        },
                    });
                } catch (error) {
                    this.microphoneCheckbox.checked = false;
                    await addToast(await getString('error:microphone', component), {type: 'warning'});
                }
            }

            this.outputStream = await this.buildOutputStream();
            const mimetype = chooseMimeType();
            const mediaOptions = {
                videoBitsPerSecond: 3000000,
            };
            if (mimetype) {
                mediaOptions.mimeType = mimetype;
            }

            this.chunks = [];
            this.mediaRecorder = new MediaRecorder(this.outputStream, mediaOptions);
            this.mediaRecorder.addEventListener('dataavailable', (event) => {
                if (event.data?.size) {
                    this.chunks.push(event.data);
                }
            });
            this.mediaRecorder.addEventListener('stop', () => this.onStopped());

            this.preview.src = '';
            this.preview.srcObject = this.outputStream;
            this.preview.muted = true;
            this.preview.controls = false;
            await this.preview.play().catch(() => {});

            this.recordingStartedAt = performance.now();
            this.elapsedSeconds = 0;
            this.mediaRecorder.start(1000);
            this.setRecordingUi(true);
            this.timerInterval = window.setInterval(() => this.tick(), 250);
            this.setStatus(await getString('status:recording', component));
        } catch (error) {
            this.cleanupCapture();
            this.startButton.disabled = false;
            const message = error?.message || String(error);
            await addToast(await getString('error:capture', component, message), {type: 'error'});
            this.setStatus(await getString('status:ready', component));
        }
    }

    /**
     * Build final video stream, compositing the webcam when requested and mixing audio.
     *
     * @returns {Promise<MediaStream>}
     */
    async buildOutputStream() {
        let videoTrack = this.screenStream.getVideoTracks()[0];

        if (this.webcamStream?.getVideoTracks().length) {
            await this.attachStream(this.screenVideo, this.screenStream);
            await this.attachStream(this.webcamVideo, this.webcamStream);

            const settings = videoTrack.getSettings();
            this.canvas.width = Math.max(640, Number(settings.width) || 1280);
            this.canvas.height = Math.max(360, Number(settings.height) || 720);
            this.startCompositor();
            const canvasStream = this.canvas.captureStream(30);
            this.canvasStream = canvasStream;
            videoTrack = canvasStream.getVideoTracks()[0];
        }

        const audioTracks = await this.buildAudioTracks();
        return new MediaStream([videoTrack, ...audioTracks]);
    }

    /**
     * Start a muted helper video.
     *
     * @param {HTMLVideoElement} element
     * @param {MediaStream} stream
     * @returns {Promise<void>}
     */
    async attachStream(element, stream) {
        element.srcObject = stream;
        element.muted = true;
        element.playsInline = true;
        await element.play();
        if (element.readyState < 2) {
            await new Promise((resolve) => element.addEventListener('loadeddata', resolve, {once: true}));
        }
    }

    /**
     * Draw screen and webcam picture-in-picture into the recording canvas.
     */
    startCompositor() {
        const context = this.canvas.getContext('2d');
        const draw = () => {
            if (this.destroyed || !this.screenStream) {
                return;
            }

            context.drawImage(this.screenVideo, 0, 0, this.canvas.width, this.canvas.height);

            if (this.webcamStream && this.webcamVideo.videoWidth) {
                const margin = Math.max(12, Math.round(this.canvas.width * 0.012));
                const width = Math.min(360, Math.round(this.canvas.width * 0.24));
                const ratio = this.webcamVideo.videoHeight / this.webcamVideo.videoWidth || 0.5625;
                const height = Math.round(width * ratio);
                const x = this.canvas.width - width - margin;
                const y = this.canvas.height - height - margin;
                const radius = Math.min(24, Math.round(width * 0.06));

                context.save();
                this.roundedRect(context, x, y, width, height, radius);
                context.clip();
                context.drawImage(this.webcamVideo, x, y, width, height);
                context.restore();

                context.save();
                context.strokeStyle = 'rgba(255,255,255,.92)';
                context.lineWidth = Math.max(2, Math.round(this.canvas.width / 640));
                this.roundedRect(context, x, y, width, height, radius);
                context.stroke();
                context.restore();
            }

            this.animationFrame = window.requestAnimationFrame(draw);
        };

        draw();
    }

    /**
     * Add a rounded rectangle path without depending on CanvasRenderingContext2D.roundRect.
     *
     * @param {CanvasRenderingContext2D} context
     * @param {Number} x
     * @param {Number} y
     * @param {Number} width
     * @param {Number} height
     * @param {Number} radius
     */
    roundedRect(context, x, y, width, height, radius) {
        const r = Math.min(radius, width / 2, height / 2);
        context.beginPath();
        context.moveTo(x + r, y);
        context.arcTo(x + width, y, x + width, y + height, r);
        context.arcTo(x + width, y + height, x, y + height, r);
        context.arcTo(x, y + height, x, y, r);
        context.arcTo(x, y, x + width, y, r);
        context.closePath();
    }

    /**
     * Mix screen/tab audio with microphone audio when both exist.
     *
     * @returns {Promise<MediaStreamTrack[]>}
     */
    async buildAudioTracks() {
        const tracks = [
            ...(this.screenStream?.getAudioTracks() || []),
            ...(this.microphoneStream?.getAudioTracks() || []),
        ];

        if (tracks.length <= 1) {
            return tracks;
        }

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
            return [tracks[0]];
        }

        this.audioContext = new AudioContext();
        const destination = this.audioContext.createMediaStreamDestination();
        this.audioSources = tracks.map((track) => {
            const source = this.audioContext.createMediaStreamSource(new MediaStream([track]));
            source.connect(destination);
            return source;
        });
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        return destination.stream.getAudioTracks();
    }

    tick() {
        if (!this.recordingStartedAt || !this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
            return;
        }

        this.elapsedSeconds = (performance.now() - this.recordingStartedAt) / 1000;
        this.updateTimer(this.elapsedSeconds);

        if (this.elapsedSeconds >= Number(this.config.maxduration)) {
            this.stop();
        }
    }

    updateTimer(seconds) {
        this.timer.textContent =
            `${formatDuration(seconds)} / ${formatDuration(this.config.maxduration)}`;
    }

    stop() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
    }

    async onStopped() {
        window.clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.elapsedSeconds = this.recordingStartedAt
            ? (performance.now() - this.recordingStartedAt) / 1000
            : this.elapsedSeconds;
        this.cleanupCapture(false);

        if (this.destroyed) {
            return;
        }

        if (!this.chunks.length) {
            this.setRecordingUi(false);
            this.startButton.disabled = false;
            await addToast(await getString('error:emptyrecording', component), {type: 'error'});
            return;
        }

        const mimetype = this.mediaRecorder.mimeType || this.chunks[0].type || 'video/webm';
        this.blob = new Blob(this.chunks, {type: mimetype});
        this.recordingMime = mimetype;
        this.filename = `screen-recording.${extensionFromMime(mimetype)}`;

        if (this.objectUrl) {
            URL.revokeObjectURL(this.objectUrl);
        }
        this.objectUrl = URL.createObjectURL(this.blob);
        this.preview.srcObject = null;
        this.preview.src = this.objectUrl;
        this.preview.muted = false;
        this.preview.controls = true;
        this.preview.load();

        this.setRecordingUi(false, true);
        this.updateTimer(this.elapsedSeconds);
        this.setStatus(await getString('status:preview', component));
    }

    setRecordingUi(recording, complete = false) {
        this.startButton.classList.toggle('d-none', recording || complete);
        this.stopButton.classList.toggle('d-none', !recording);
        this.rerecordButton.classList.toggle('d-none', !complete);
        this.downloadButton.classList.toggle('d-none', !complete);
        this.uploadButton.classList.toggle('d-none', !complete);
        this.root.querySelector('[data-region="capture-options"]')?.classList.toggle('screenrecorder-disabled', recording);
    }

    async reset() {
        this.blob = null;
        this.chunks = [];
        this.preview.pause();
        this.preview.removeAttribute('src');
        this.preview.srcObject = null;
        this.preview.controls = false;
        this.preview.load();
        if (this.objectUrl) {
            URL.revokeObjectURL(this.objectUrl);
            this.objectUrl = null;
        }
        this.elapsedSeconds = 0;
        this.updateTimer(0);
        this.startButton.disabled = false;
        this.setRecordingUi(false, false);
        this.setStatus(await getString('status:ready', component));
    }

    download() {
        if (!this.blob) {
            return;
        }
        const link = document.createElement('a');
        link.href = this.objectUrl;
        link.download = this.filename;
        document.body.append(link);
        link.click();
        link.remove();
    }

    /**
     * Upload through the plugin endpoint and insert the draft URL in Tiny.
     *
     * @returns {Promise<void>}
     */
    async upload() {
        if (!this.blob) {
            return;
        }

        if (Number(this.config.maxbytes) >= 0 && this.blob.size > Number(this.config.maxbytes)) {
            await addToast(await getString('error:filesizelimit', component), {type: 'error'});
            return;
        }

        this.uploadButton.disabled = true;
        this.progress.classList.remove('d-none');
        this.progressBar.style.width = '0%';
        this.progressBar.setAttribute('aria-valuenow', '0');

        try {
            const response = await this.uploadBlob((percent) => {
                const rounded = Math.round(percent);
                this.progressBar.style.width = `${rounded}%`;
                this.progressBar.setAttribute('aria-valuenow', String(rounded));
                getString('status:uploading', component, rounded).then((text) => {
                    this.uploadButton.textContent = text;
                });
            });

            const html = await Templates.render('tiny_screenrecorder/embed_video', {
                url: response.url,
                mimetype: response.mimetype,
            });
            this.editor.insertContent(html);
            this.editor.nodeChanged();
            await addToast(await getString('status:uploaded', component));
            this.modal.hide();
        } catch (error) {
            this.uploadButton.disabled = false;
            this.uploadButton.textContent = await getString('action:attach', component);
            const message = error?.message || error?.error || String(error);
            await addToast(message || await getString('error:upload', component), {type: 'error'});
        }
    }

    /**
     * Perform authenticated upload to Moodle.
     *
     * @param {Function} onProgress
     * @returns {Promise<Object>}
     */
    uploadBlob(onProgress) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    onProgress(event.loaded / event.total * 100);
                }
            });
            xhr.addEventListener('load', () => {
                let response;
                try {
                    response = JSON.parse(xhr.responseText);
                } catch (error) {
                    reject(new Error('Invalid server response.'));
                    return;
                }

                if (xhr.status < 200 || xhr.status >= 300 || response.error) {
                    reject(new Error(response.message || response.error || 'Upload failed.'));
                    return;
                }
                resolve(response);
            });
            xhr.addEventListener('error', () => reject(new Error('Upload transport error.')));

            const data = new FormData();
            data.append('recording', this.blob, this.filename);
            data.append('contextid', String(this.config.contextid));
            data.append('itemid', String(this.config.itemid));
            data.append('duration', String(this.elapsedSeconds));
            data.append('sesskey', this.config.sesskey || M.cfg.sesskey);

            xhr.open('POST', `${M.cfg.wwwroot}/lib/editor/tiny/plugins/screenrecorder/upload.php`, true);
            xhr.send(data);
        });
    }

    setStatus(text) {
        this.status.textContent = text;
    }

    cleanupCapture(stopRecorder = true) {
        window.clearInterval(this.timerInterval);
        this.timerInterval = null;

        if (stopRecorder && this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            try {
                this.mediaRecorder.stop();
            } catch (error) {
                // Recorder may already be stopping.
            }
        }

        if (this.animationFrame) {
            window.cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        [this.screenStream, this.webcamStream, this.microphoneStream, this.canvasStream, this.outputStream]
            .filter(Boolean)
            .forEach((stream) => stream.getTracks().forEach((track) => {
                if (track.readyState !== 'ended') {
                    track.stop();
                }
            }));

        this.screenStream = null;
        this.webcamStream = null;
        this.microphoneStream = null;
        this.canvasStream = null;
        this.outputStream = null;

        this.screenVideo.srcObject = null;
        this.webcamVideo.srcObject = null;

        if (this.audioContext) {
            this.audioContext.close().catch(() => {});
            this.audioContext = null;
        }
        this.audioSources = [];
    }

    destroy() {
        this.destroyed = true;
        this.cleanupCapture();
        if (this.objectUrl) {
            URL.revokeObjectURL(this.objectUrl);
            this.objectUrl = null;
        }
    }
}
