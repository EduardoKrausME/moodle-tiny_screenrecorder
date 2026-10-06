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
 * @module      tiny_screenrecorder/plugin
 * @package   tiny_screenrecorder
 * @copyright   2026 Eduardo Kraus
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {getTinyMCE} from 'editor_tiny/loader';
import {getButtonImage, getPluginMetadata} from 'editor_tiny/utils';
import {get_string as getString} from 'core/str';
import {component, pluginName, buttonName, buttonIcon} from './common';
import {register as registerOptions} from './options';
import {openRecorder} from './recorder';
import * as Configuration from './configuration';

// eslint-disable-next-line no-async-promise-executor
export default new Promise(async(resolve) => {
    const [tinyMCE, buttonText, buttonImage, pluginMetadata] = await Promise.all([
        getTinyMCE(),
        getString('buttontitle', component),
        getButtonImage('screen', component),
        getPluginMetadata(component, pluginName),
    ]);

    tinyMCE.PluginManager.add(`${component}/plugin`, (editor) => {
        registerOptions(editor);
        editor.ui.registry.addIcon(buttonIcon, buttonImage.html);
        editor.ui.registry.addButton(buttonName, {
            icon: buttonIcon,
            tooltip: buttonText,
            onAction: () => openRecorder(editor),
        });
        editor.ui.registry.addMenuItem(buttonName, {
            icon: buttonIcon,
            text: buttonText,
            onAction: () => openRecorder(editor),
        });
        return pluginMetadata;
    });

    resolve([`${component}/plugin`, Configuration]);
});
