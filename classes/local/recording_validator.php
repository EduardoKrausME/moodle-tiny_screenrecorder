<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle. If not, see <http://www.gnu.org/licenses/>.

namespace tiny_screenrecorder\local;

/**
 * Validate containers produced by browser MediaRecorder.
 *
 * The original filename and its extension are intentionally ignored.
 *
 * @package    tiny_screenrecorder
 * @copyright  2026 Eduardo Kraus
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class recording_validator {
    /** @var string WebM MIME type. */
    public const MIME_WEBM = 'video/webm';

    /** @var string MP4 MIME type. */
    public const MIME_MP4 = 'video/mp4';

    /**
     * Detect an allowed recording MIME type from file contents.
     *
     * @param string $path
     * @return string|null
     */
    public static function detect_mimetype(string $path): ?string {
        if (!is_file($path) || !is_readable($path)) {
            return null;
        }

        $handle = fopen($path, 'rb');
        if ($handle === false) {
            return null;
        }
        $header = fread($handle, 4096);
        fclose($handle);

        if ($header === false) {
            return null;
        }

        // WebM uses the EBML header and declares "webm" as DocType near the start.
        if (strlen($header) >= 4
                && substr($header, 0, 4) === "\x1A\x45\xDF\xA3"
                && stripos($header, 'webm') !== false) {
            return self::MIME_WEBM;
        }

        // ISO Base Media (including normal browser-generated MP4) exposes an ftyp box.
        if (strlen($header) >= 12 && substr($header, 4, 4) === 'ftyp') {
            return self::MIME_MP4;
        }

        if (class_exists('finfo')) {
            $finfo = new \finfo(FILEINFO_MIME_TYPE);
            $detected = $finfo->file($path);
            if (in_array($detected, self::allowed_mimetypes(), true)) {
                return $detected;
            }
        }

        return null;
    }

    /**
     * Get accepted MIME types.
     *
     * @return string[]
     */
    public static function allowed_mimetypes(): array {
        return [
            self::MIME_WEBM,
            self::MIME_MP4,
        ];
    }

    /**
     * Return the server-controlled extension for a detected MIME.
     *
     * @param string $mimetype
     * @return string|null
     */
    public static function extension_for_mimetype(string $mimetype): ?string {
        return match ($mimetype) {
            self::MIME_WEBM => 'webm',
            self::MIME_MP4 => 'mp4',
            default => null,
        };
    }
}
