<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

$string['pluginname'] = 'Screen Recorder';
$string['buttontitle'] = 'Record screen';
$string['modal:title'] = 'Screen Recorder';
$string['source:screen'] = 'Screen or window';
$string['source:presentation'] = 'Presentation (PPT)';
$string['source:presentation_help'] = 'Open the presentation in PowerPoint, LibreOffice or a browser, then select that presentation window in the browser share dialog.';
$string['option:webcam'] = 'Include webcam';
$string['option:microphone'] = 'Include microphone';
$string['action:start'] = 'Start recording';
$string['action:stop'] = 'Stop';
$string['action:rerecord'] = 'Record again';
$string['action:download'] = 'Download';
$string['action:attach'] = 'Insert into editor';
$string['status:ready'] = 'Choose the source and start recording.';
$string['status:acquiring'] = 'Waiting for screen sharing permission...';
$string['status:recording'] = 'Recording';
$string['status:preview'] = 'Recording complete. Review it before inserting it into the editor.';
$string['status:uploading'] = 'Uploading {$a}%';
$string['status:uploaded'] = 'Recording inserted into the editor.';
$string['limit:maxduration'] = 'Maximum duration: {$a}';
$string['error:browser'] = 'Screen recording is not available in this browser or the page is not running in a secure context.';
$string['error:capture'] = 'Could not start screen capture: {$a}';
$string['error:upload'] = 'The recording could not be uploaded.';
$string['error:nofile'] = 'No recording was received.';
$string['error:invalidmime'] = 'The uploaded file is not a valid WebM or MP4 recording.';
$string['error:filesizelimit'] = 'The recording exceeds the maximum upload size allowed in this context.';
$string['error:durationlimit'] = 'The recording exceeds the configured maximum duration.';
$string['error:invaliddraftitem'] = 'The editor does not have a valid draft file area.';
$string['error:filestore'] = 'Moodle could not store the recording.';
$string['error:emptyrecording'] = 'The browser produced an empty recording.';
$string['error:webcam'] = 'The webcam could not be opened. Recording will continue without it.';
$string['error:microphone'] = 'The microphone could not be opened. Recording will continue without it.';
$string['settings:maxduration'] = 'Maximum recording duration';
$string['settings:maxduration_desc'] = 'Maximum time for one screen recording. The browser stops the MediaRecorder automatically when this limit is reached.';
$string['settings:maxduration_invalid'] = 'The maximum duration must be greater than zero.';
$string['settings:allowwebcam'] = 'Allow webcam';
$string['settings:allowwebcam_desc'] = 'Allow users with the webcam capability to add their camera as picture-in-picture to the final recording.';
$string['settings:allowmicrophone'] = 'Allow microphone';
$string['settings:allowmicrophone_desc'] = 'Allow users with the microphone capability to mix microphone audio into the recording.';
$string['settings:allowppt'] = 'Allow presentation mode (PPT)';
$string['settings:allowppt_desc'] = 'Adds a presentation capture mode that asks the browser for a presentation/window share instead of uploading the presentation to an external viewer.';
$string['screenrecorder:use'] = 'Use Screen Recorder';
$string['screenrecorder:usewebcam'] = 'Include webcam in screen recordings';
$string['screenrecorder:usemicrophone'] = 'Include microphone in screen recordings';
$string['screenrecorder:usepresentation'] = 'Use presentation capture mode';
$string['privacy:metadata'] = 'Screen Recorder stores no data of its own. Recordings are placed in the standard Moodle user draft area and become files of the component that owns the editor field when the form is saved.';
