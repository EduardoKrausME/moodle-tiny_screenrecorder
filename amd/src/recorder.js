// This file is part of Moodle - https://moodle.org/
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
// along with Moodle.  If not, see <https://www.gnu.org/licenses/>.

/**
 * Screen recorder modal controller.
 *
 * The browser capture engine lives in kapture.js. This controller only handles Moodle UI,
 * optional webcam composition, preview, upload and insertion into TinyMCE.
 *
 * @module tiny_screenrecorder/recorder
 * @package tiny_screenrecorder
 * @copyright 2026 Eduardo Kraus
 * @license https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */


define([
    'core/modal',
    'core/modal_events',
    'core/templates',
    'core/str',
    'core/toast',
    './common',
    './kapture',
    './options',
], function(Modal, ModalEvents, Templates, Str, Toast, Common, Kapture, Options) {
    const getString = Str.get_string;
    const addToast = Toast.add;
    const component = Common.component;
    const KaptureRecorder = Kapture.KaptureRecorder;
    const getData = Options.getData;

    const formatDuration = (seconds) => {
        const safe = Math.max(0, Math.floor(Number(seconds) || 0));
        const minutes = Math.floor(safe / 60);
        return `${minutes}:${String(safe % 60).padStart(2, '0')}`;
    };

    const extensionFromMime = (mimetype) =>
        String(mimetype).toLowerCase().includes('mp4') ? 'mp4' : 'webm';

    const openRecorder = async(editor) => {
        const config = getData(editor);
        const body = await Templates.render('tiny_screenrecorder/recorder', {
            allowwebcam: Boolean(config.allowwebcam),
            allowmicrophone: Boolean(config.allowmicrophone),
            allowppt: Boolean(config.allowppt),
            maxduration: formatDuration(config.maxduration),
        });
        const modal = await Modal.create({
            title: await getString('modal:title', component),
            body,
            large: true,
            removeOnClose: true,
        });
        const recorder = new ScreenRecorder(editor, modal, config);
        modal.getRoot().on(ModalEvents.hidden, () => recorder.destroy());
        modal.show();
    };

    class ScreenRecorder {
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
            this.elapsedSeconds = 0;
            this.destroyed = false;
            this.objectUrl = null;
            this.engine = null;
            this.registerEvents();
            this.updateTimer(0);
        }

        registerEvents() {
            this.root.querySelectorAll('[data-source]').forEach(button => {
                button.addEventListener('click', () => {
                    this.source = button.dataset.source;
                    this.root.querySelectorAll('[data-source]').forEach(item => {
                        item.classList.toggle('active', item === button);
                        item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
                    });
                    this.root.querySelector('[data-region="presentation-help"]')?.classList.toggle(
                        'd-none', this.source !== 'presentation'
                    );
                });
            });
            this.startButton.addEventListener('click', () => this.start());
            this.stopButton.addEventListener('click', () => this.stop());
            this.rerecordButton.addEventListener('click', () => this.reset());
            this.downloadButton.addEventListener('click', () => this.download());
            this.uploadButton.addEventListener('click', () => this.upload());
        }

        async start() {
            if (!KaptureRecorder.isSupported()) {
                await addToast(await getString('error:browser', component), {type: 'error'});
                return;
            }

            this.startButton.disabled = true;
            this.setStatus(await getString('status:acquiring', component));
            this.engine = new KaptureRecorder({
                microphone: Boolean(this.microphoneCheckbox?.checked),
                systemAudio: true,
                maxDuration: Number(this.config.maxduration),
                displayMediaOptions: {
                    video: this.source === 'presentation' ? {
                        displaySurface: 'window',
                        frameRate: {ideal: 30, max: 30},
                    } : {
                        frameRate: {ideal: 30, max: 30},
                    },
                    audio: true,
                    systemAudio: 'include',
                    preferCurrentTab: false,
                },
                prepareOutputStream: engine => this.prepareOutputStream(engine),
                onStart: () => this.onStarted(),
                onStop: result => this.onStopped(result),
                onError: error => console.error(error),
            });

            try {
                await this.engine.start();
                this.preview.src = '';
                this.preview.srcObject = this.engine.outputStream;
                this.preview.muted = true;
                this.preview.controls = false;
                await this.preview.play().catch(() => {});
            } catch (error) {
                this.cleanupExtras();
                this.startButton.disabled = false;
                const message = error?.message || String(error);
                await addToast(await getString('error:capture', component, message), {type: 'error'});
                this.setStatus(await getString('status:ready', component));
            }
        }

        async prepareOutputStream(engine) {
            const output = await engine.buildDefaultOutputStream();
            if (!this.webcamCheckbox?.checked) {
                return output;
            }

            try {
                this.webcamStream = await navigator.mediaDevices.getUserMedia({
                    video: {width: {ideal: 1280}, height: {ideal: 720}},
                    audio: false,
                });
            } catch (error) {
                this.webcamCheckbox.checked = false;
                await addToast(await getString('error:webcam', component), {type: 'warning'});
                return output;
            }

            await this.attachStream(this.screenVideo, engine.displayStream);
            await this.attachStream(this.webcamVideo, this.webcamStream);
            const displayTrack = engine.displayStream.getVideoTracks()[0];
            const settings = displayTrack.getSettings();
            this.canvas.width = Math.max(640, Number(settings.width) || 1280);
            this.canvas.height = Math.max(360, Number(settings.height) || 720);
            this.startCompositor();
            this.canvasStream = this.canvas.captureStream(30);
            return new MediaStream([
                this.canvasStream.getVideoTracks()[0],
                ...output.getAudioTracks(),
            ]);
        }

        async attachStream(element, stream) {
            element.srcObject = stream;
            element.muted = true;
            element.playsInline = true;
            await element.play();
            if (element.readyState < 2) {
                await new Promise(resolve => element.addEventListener('loadeddata', resolve, {once: true}));
            }
        }

        startCompositor() {
            const context = this.canvas.getContext('2d');
            const draw = () => {
                if (this.destroyed || !this.engine?.displayStream) {
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

        async onStarted() {
            this.elapsedSeconds = 0;
            this.setRecordingUi(true);
            this.timerInterval = window.setInterval(() => {
                this.elapsedSeconds = this.engine?.getDuration() || 0;
                this.updateTimer(this.elapsedSeconds);
            }, 250);
            this.setStatus(await getString('status:recording', component));
        }

        stop() {
            this.engine?.stop();
        }

        async onStopped(result) {
            window.clearInterval(this.timerInterval);
            this.timerInterval = null;
            this.elapsedSeconds = result.duration;
            this.cleanupExtras();
            if (this.destroyed) {
                return;
            }
            if (!result.blob.size) {
                this.setRecordingUi(false);
                this.startButton.disabled = false;
                await addToast(await getString('error:emptyrecording', component), {type: 'error'});
                return;
            }

            this.blob = result.blob;
            this.recordingMime = result.mimeType;
            this.filename = `screen-recording.${extensionFromMime(result.mimeType)}`;
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

        updateTimer(seconds) {
            this.timer.textContent = `${formatDuration(seconds)} / ${formatDuration(this.config.maxduration)}`;
        }

        setRecordingUi(recording, complete = false) {
            this.startButton.classList.toggle('d-none', recording || complete);
            this.stopButton.classList.toggle('d-none', !recording);
            this.rerecordButton.classList.toggle('d-none', !complete);
            this.downloadButton.classList.toggle('d-none', !complete);
            this.uploadButton.classList.toggle('d-none', !complete);
            this.root.querySelector('[data-region="capture-options"]')?.classList.toggle(
                'screenrecorder-disabled', recording
            );
        }

        async reset() {
            this.blob = null;
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
                const response = await this.uploadBlob(percent => {
                    const rounded = Math.round(percent);
                    this.progressBar.style.width = `${rounded}%`;
                    this.progressBar.setAttribute('aria-valuenow', String(rounded));
                    getString('status:uploading', component, rounded).then(text => {
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

        uploadBlob(onProgress) {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.upload.addEventListener('progress', event => {
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

        cleanupExtras() {
            window.clearInterval(this.timerInterval);
            this.timerInterval = null;
            if (this.animationFrame) {
                window.cancelAnimationFrame(this.animationFrame);
                this.animationFrame = null;
            }
            [this.webcamStream, this.canvasStream]
                .filter(Boolean)
                .forEach(stream => stream.getTracks().forEach(track => {
                    if (track.readyState !== 'ended') {
                        track.stop();
                    }
                }));
            this.webcamStream = null;
            this.canvasStream = null;
            this.screenVideo.srcObject = null;
            this.webcamVideo.srcObject = null;
        }

        destroy() {
            this.destroyed = true;
            this.engine?.stop();
            this.cleanupExtras();
            this.preview.srcObject = null;
            if (this.objectUrl) {
                URL.revokeObjectURL(this.objectUrl);
                this.objectUrl = null;
            }
        }
    }

    return {
        formatDuration,
        extensionFromMime,
        openRecorder,
    };
});
