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
 * Reusable Kapture recording engine adapted for Moodle AMD.
 *
 * @module tiny_screenrecorder/kapture
 * @package tiny_screenrecorder
 * @copyright 2026 Eduardo Kraus
 * @license https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define([], function() {
    class KaptureDevices {
        static buildMicrophoneConstraints(microphoneId = null) {
            const audio = {
                echoCancellation: true,
                noiseSuppression: true,
            };
            if (microphoneId) {
                audio.deviceId = {exact: microphoneId};
            }
            return {audio, video: false};
        }
    }

    class KaptureRecorder {
        constructor(options = {}) {
            this.options = Object.assign({
                mimeType: null,
                audioBitsPerSecond: 128000,
                videoBitsPerSecond: 3000000,
                timeslice: 1000,
                microphone: false,
                microphoneId: null,
                systemAudio: true,
                preferCurrentTab: false,
                displaySurface: null,
                maxDuration: 0,
                displayMediaOptions: null,
                prepareOutputStream: null,
                onReady: null,
                onStart: null,
                onDataAvailable: null,
                onStop: null,
                onError: null,
            }, options);
            this.mediaRecorder = null;
            this.displayStream = null;
            this.microphoneStream = null;
            this.outputStream = null;
            this.audioContext = null;
            this.audioDestination = null;
            this.recordedBlobs = [];
            this.startedAt = null;
            this.stoppedAt = null;
            this.stopTimer = null;
            this.stopping = false;
        }

        static isSupported() {
            return Boolean(window.isSecureContext && navigator.mediaDevices?.getDisplayMedia && window.MediaRecorder);
        }

        static getSupportedMimeType(preferred = null) {
            const types = [
                preferred,
                'video/webm;codecs=vp9,opus',
                'video/webm;codecs=vp8,opus',
                'video/webm',
                'video/mp4;codecs=avc1,mp4a.40.2',
                'video/mp4',
            ].filter(Boolean);
            if (!window.MediaRecorder?.isTypeSupported) {
                return preferred || 'video/webm';
            }
            return types.find(type => MediaRecorder.isTypeSupported(type)) || '';
        }

        buildDisplayMediaOptions() {
            if (this.options.displayMediaOptions) {
                return this.options.displayMediaOptions;
            }
            const video = this.options.displaySurface ? {displaySurface: this.options.displaySurface} : true;
            return {
                video,
                audio: Boolean(this.options.systemAudio),
                systemAudio: this.options.systemAudio ? 'include' : 'exclude',
                preferCurrentTab: Boolean(this.options.preferCurrentTab),
            };
        }

        async buildDefaultOutputStream() {
            const videoTracks = this.displayStream.getVideoTracks();
            const displayAudio = this.displayStream.getAudioTracks();
            const microphoneAudio = this.microphoneStream?.getAudioTracks() || [];
            if (!displayAudio.length || !microphoneAudio.length) {
                return new MediaStream([...videoTracks, ...displayAudio, ...microphoneAudio]);
            }

            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) {
                return new MediaStream([...videoTracks, ...displayAudio.slice(0, 1)]);
            }

            this.audioContext = new AudioContext();
            this.audioDestination = this.audioContext.createMediaStreamDestination();
            [this.displayStream, this.microphoneStream].forEach(stream => {
                if (!stream?.getAudioTracks().length) {
                    return;
                }
                const source = this.audioContext.createMediaStreamSource(new MediaStream(stream.getAudioTracks()));
                source.connect(this.audioDestination);
            });
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            return new MediaStream([...videoTracks, ...this.audioDestination.stream.getAudioTracks()]);
        }

        async start() {
            if (!KaptureRecorder.isSupported()) {
                throw new Error('Screen recording is not supported by this browser.');
            }
            this.resetResult();
            try {
                this.displayStream = await navigator.mediaDevices.getDisplayMedia(this.buildDisplayMediaOptions());
                if (!this.displayStream.getVideoTracks().length) {
                    throw new Error('No screen video track returned by the browser.');
                }
                if (this.options.microphone) {
                    this.microphoneStream = await navigator.mediaDevices.getUserMedia(
                        KaptureDevices.buildMicrophoneConstraints(this.options.microphoneId)
                    );
                }

                this.outputStream = typeof this.options.prepareOutputStream === 'function'
                    ? await this.options.prepareOutputStream(this)
                    : await this.buildDefaultOutputStream();

                const mimeType = KaptureRecorder.getSupportedMimeType(this.options.mimeType);
                const mediaOptions = {
                    audioBitsPerSecond: this.options.audioBitsPerSecond,
                    videoBitsPerSecond: this.options.videoBitsPerSecond,
                };
                if (mimeType) {
                    mediaOptions.mimeType = mimeType;
                }

                this.mediaRecorder = new MediaRecorder(this.outputStream, mediaOptions);
                this.mediaRecorder.addEventListener('dataavailable', event => {
                    if (!event.data?.size) {
                        return;
                    }
                    this.recordedBlobs.push(event.data);
                    this.emit('onDataAvailable', event.data, this.recordedBlobs.length);
                });
                this.mediaRecorder.addEventListener('start', () => {
                    this.startedAt = performance.now();
                    this.emit('onStart', this);
                });
                this.mediaRecorder.addEventListener('stop', () => this.handleStopped());
                this.mediaRecorder.addEventListener('error', event => this.handleError(event.error || event));
                this.displayStream.getVideoTracks()[0].addEventListener('ended', () => this.stop());

                this.emit('onReady', this);
                this.mediaRecorder.start(this.options.timeslice);
                if (Number(this.options.maxDuration) > 0) {
                    this.stopTimer = window.setTimeout(() => this.stop(), Number(this.options.maxDuration) * 1000);
                }
                return this;
            } catch (error) {
                await this.cleanupStreams();
                this.handleError(error);
                throw error;
            }
        }

        stop() {
            if (this.stopping) {
                return;
            }
            this.stopping = true;
            if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                this.mediaRecorder.stop();
            } else {
                this.handleStopped();
            }
        }

        async handleStopped() {
            if (this.stoppedAt) {
                return;
            }
            this.stoppedAt = performance.now();
            if (this.stopTimer) {
                window.clearTimeout(this.stopTimer);
                this.stopTimer = null;
            }
            await this.cleanupStreams();
            this.stopping = false;
            this.emit('onStop', this.getResult(), this);
        }

        async cleanupStreams() {
            [this.outputStream, this.displayStream, this.microphoneStream]
                .filter(Boolean)
                .forEach(stream => stream.getTracks().forEach(track => {
                    if (track.readyState !== 'ended') {
                        track.stop();
                    }
                }));
            if (this.audioContext && this.audioContext.state !== 'closed') {
                await this.audioContext.close().catch(() => {});
            }
            this.outputStream = null;
            this.displayStream = null;
            this.microphoneStream = null;
            this.audioContext = null;
            this.audioDestination = null;
        }

        resetResult() {
            this.recordedBlobs = [];
            this.startedAt = null;
            this.stoppedAt = null;
            this.stopping = false;
            if (this.stopTimer) {
                window.clearTimeout(this.stopTimer);
                this.stopTimer = null;
            }
        }

        getDuration() {
            if (!this.startedAt) {
                return 0;
            }
            return Math.max(0, ((this.stoppedAt || performance.now()) - this.startedAt) / 1000);
        }

        getResult() {
            const mimeType = this.mediaRecorder?.mimeType || this.options.mimeType || 'video/webm';
            return {
                blob: new Blob(this.recordedBlobs, {type: mimeType}),
                blobs: this.recordedBlobs.slice(),
                mimeType,
                duration: this.getDuration(),
            };
        }

        emit(name, ...args) {
            if (typeof this.options[name] === 'function') {
                this.options[name](...args);
            }
        }

        handleError(error) {
            this.emit('onError', error, this);
        }
    }

    return {
        KaptureDevices,
        KaptureRecorder,
    };
});
