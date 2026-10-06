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
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

declare(strict_types=1);

namespace tiny_screenrecorder;

use advanced_testcase;
use tiny_screenrecorder\local\recording_validator;

/**
 * Tests for recording MIME validation.
 *
 * @package    tiny_screenrecorder
 * @covers     \tiny_screenrecorder\local\recording_validator
 * @copyright  2026 Eduardo Kraus
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
final class recording_validator_test extends advanced_testcase {
    /**
     * Method test_webm_is_detected_from_content_not_extension.
     *
     * @return void Return value.
     */
    public function test_webm_is_detected_from_content_not_extension(): void {
        $path = make_request_directory() . '/not-a-video.txt';
        file_put_contents($path, "\x1A\x45\xDF\xA3" . str_repeat("\x00", 24) . 'webm' . str_repeat("\x00", 32));

        $this->assertSame(recording_validator::MIME_WEBM, recording_validator::detect_mimetype($path));
    }

    /**
     * Method test_mp4_is_detected_from_ftyp_box_not_extension.
     *
     * @return void Return value.
     */
    public function test_mp4_is_detected_from_ftyp_box_not_extension(): void {
        $path = make_request_directory() . '/misleading.webm';
        file_put_contents($path, "\x00\x00\x00\x18ftypisom" . str_repeat("\x00", 32));

        $this->assertSame(recording_validator::MIME_MP4, recording_validator::detect_mimetype($path));
    }

    /**
     * Method test_non_video_content_is_rejected_even_with_video_extension.
     *
     * @return void Return value.
     */
    public function test_non_video_content_is_rejected_even_with_video_extension(): void {
        $path = make_request_directory() . '/payload.webm';
        file_put_contents($path, "<?php echo 'not a video';");

        $this->assertNull(recording_validator::detect_mimetype($path));
    }

    /**
     * Method test_extensions_are_server_controlled.
     *
     * @return void Return value.
     */
    public function test_extensions_are_server_controlled(): void {
        $this->assertSame('webm', recording_validator::extension_for_mimetype('video/webm'));
        $this->assertSame('mp4', recording_validator::extension_for_mimetype('video/mp4'));
        $this->assertNull(recording_validator::extension_for_mimetype('application/octet-stream'));
    }
}
