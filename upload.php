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

define('AJAX_SCRIPT', true);

require_once(__DIR__ . '/../../../../../config.php');

use tiny_screenrecorder\local\recording_validator;

require_login();
require_sesskey();

$contextid = required_param('contextid', PARAM_INT);
$itemid = required_param('itemid', PARAM_INT);
$duration = optional_param('duration', 0, PARAM_FLOAT);

$context = context::instance_by_id($contextid, MUST_EXIST);
require_capability('tiny/screenrecorder:use', $context);

if ($itemid <= 0) {
    throw new moodle_exception('error:invaliddraftitem', 'tiny_screenrecorder');
}

$maxduration = max(1, (int) get_config('tiny_screenrecorder', 'maxduration'));
if ($duration > ($maxduration + 2)) {
    throw new moodle_exception('error:durationlimit', 'tiny_screenrecorder');
}

if (empty($_FILES['recording']) || !is_array($_FILES['recording'])) {
    throw new moodle_exception('error:nofile', 'tiny_screenrecorder');
}

$upload = $_FILES['recording'];
if (($upload['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    throw new moodle_exception('error:upload', 'tiny_screenrecorder');
}

$tmpname = $upload['tmp_name'] ?? '';
if ($tmpname === '' || !is_uploaded_file($tmpname)) {
    throw new moodle_exception('error:upload', 'tiny_screenrecorder');
}

$filesize = (int) ($upload['size'] ?? filesize($tmpname));
$maxbytes = get_user_max_upload_file_size($context);
if ($maxbytes >= 0 && $filesize > $maxbytes) {
    throw new moodle_exception('error:filesizelimit', 'tiny_screenrecorder');
}

$mimetype = recording_validator::detect_mimetype($tmpname);
$extension = $mimetype ? recording_validator::extension_for_mimetype($mimetype) : null;
if ($extension === null) {
    throw new moodle_exception('error:invalidmime', 'tiny_screenrecorder');
}

$usercontext = context_user::instance($USER->id);
$filename = 'screen-recording-' . date('Ymd-His') . '-' . random_string(8) . '.' . $extension;

$filerecord = [
    'contextid' => $usercontext->id,
    'component' => 'user',
    'filearea' => 'draft',
    'itemid' => $itemid,
    'filepath' => '/',
    'filename' => $filename,
    'userid' => $USER->id,
    'source' => $filename,
    'author' => fullname($USER),
    'license' => $CFG->sitedefaultlicense ?? 'allrightsreserved',
];

$fs = get_file_storage();
$file = $fs->create_file_from_pathname($filerecord, $tmpname);
if (!$file) {
    throw new moodle_exception('error:filestore', 'tiny_screenrecorder');
}

$url = moodle_url::make_draftfile_url($itemid, $file->get_filepath(), $file->get_filename());

header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'url' => $url->out(false),
    'filename' => $file->get_filename(),
    'mimetype' => $mimetype,
]);
