# Screen Recorder

Screen Recorder adds a native button to the Moodle TinyMCE toolbar for recording the user's screen directly in the browser and inserting the resulting video into the editor content.

The workflow is intentionally short: click the screen-recording button, choose what to share, optionally include microphone and webcam, record, review the result and insert it. The video is stored in the same Moodle draft file area already used by the editor, so saving the surrounding form moves the recording through Moodle's normal file lifecycle.

## Recording experience

The recorder opens in a Moodle modal and uses the browser's `getDisplayMedia` and `MediaRecorder` APIs. A recording can contain the selected screen/window, system or tab audio when the browser exposes it, microphone audio, and an optional webcam picture-in-picture.

The webcam is composited into the final video with a canvas before MediaRecorder receives the stream. This is an important difference from simply displaying a floating camera preview on top of the page: the camera remains part of the generated video even when the user shares another window or an entire monitor.

When both shared audio and microphone audio are available, the plugin mixes them through the Web Audio API into one recording track. If the user stops sharing from the browser's own sharing indicator, the recording is stopped as well.

After stopping, the modal shows the actual generated recording. The user can play it, record again, download a local copy, or insert it into TinyMCE.

## Presentation mode

Administrators can enable a dedicated **Presentation (PPT)** mode. This mode is designed for PowerPoint, LibreOffice Impress, Keynote and browser-based presentations: the presenter opens the slides first, then chooses the presentation window in the browser share dialog.

The plugin deliberately does not upload a `.ppt` or `.pptx` file to Microsoft Office Online. The older Kapture flow used an external Office viewer for presentation files, which requires handing an externally reachable document URL to that service and does not fit well with authenticated Moodle draft files. Window capture keeps the presentation local while still producing the expected presentation video.

## Administrative controls

The site administrator can define the maximum recording duration and independently allow or disable webcam, microphone and presentation mode. Each optional resource also has its own capability, allowing role-level control in addition to the global switch.

Available capabilities are:

- `tiny/screenrecorder:use`
- `tiny/screenrecorder:usewebcam`
- `tiny/screenrecorder:usemicrophone`
- `tiny/screenrecorder:usepresentation`

The recorder automatically stops when the configured maximum duration is reached. The current editor/file-area upload limit is also exposed to the modal so an oversized recording can be rejected before upload.

## Storage and security

Recordings are sent to a dedicated Moodle endpoint only after the user explicitly chooses **Insert into editor**. The endpoint requires an authenticated session and valid sesskey, resolves the editor context, checks `tiny/screenrecorder:use`, enforces the Moodle upload-size limit and writes through the Moodle File API into the current user's draft area.

The server does not trust the filename or extension supplied by the browser. It inspects the uploaded content and only accepts WebM or MP4 containers; the final extension and stored filename are generated on the server from the detected container type.

The plugin has no database tables and no private persistent file area of its own. Its Privacy API implementation therefore declares no plugin-owned personal data. Once the surrounding Moodle form is saved, ownership and persistence of the recording follow the component that owns that editor field.

## Kapture lineage

The browser capture engine is now isolated in `amd/src/kapture.js`, following the reusable recorder core extracted from Eduardo Kraus' Kapture project. The Tiny controller delegates screen capture, MediaRecorder lifecycle, audio mixing, duration tracking and automatic stop to that engine, while Moodle-specific UI, webcam composition, upload, sesskey/context validation and editor insertion remain in the plugin. The standalone Kapture application, its jQuery UI, PHP endpoints and FFmpeg bundle are not loaded by the TinyMCE plugin.
