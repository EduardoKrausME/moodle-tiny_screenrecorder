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
 * Tiny Screen Recorder plugin entrypoint.
 *
 * @module tiny_screenrecorder/plugin
 * @package tiny_screenrecorder
 * @copyright 2026 Eduardo Kraus
 * @license https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define([
    'editor_tiny/loader',
    'editor_tiny/utils',
    'core/str',
    './common',
    './options',
    './recorder',
    './configuration',
], function(
    TinyLoader,
    TinyUtils,
    Str,
    Common,
    Options,
    Recorder,
    Configuration
) {
    return new Promise(async function(resolve) {
        const values = await Promise.all([
            TinyLoader.getTinyMCE(),
            Str.get_string('buttontitle', Common.component),
            TinyUtils.getButtonImage('screen', Common.component),
            TinyUtils.getPluginMetadata(
                Common.component,
                Common.pluginName
            ),
        ]);

        const tinyMCE = values[0];
        const buttonText = values[1];
        const buttonImage = values[2];
        const pluginMetadata = values[3];

        tinyMCE.PluginManager.add(
            Common.component + '/plugin',
            function(editor) {
                Options.register(editor);

                editor.ui.registry.addIcon(
                    Common.buttonIcon,
                    buttonImage.html
                );

                editor.ui.registry.addButton(
                    Common.buttonName,
                    {
                        icon: Common.buttonIcon,
                        tooltip: buttonText,
                        onAction: function() {
                            Recorder.openRecorder(editor);
                        },
                    }
                );

                editor.ui.registry.addMenuItem(
                    Common.buttonName,
                    {
                        icon: Common.buttonIcon,
                        text: buttonText,
                        onAction: function() {
                            Recorder.openRecorder(editor);
                        },
                    }
                );

                return pluginMetadata;
            }
        );

        resolve([
            Common.component + '/plugin',
            Configuration,
        ]);
    });
});
