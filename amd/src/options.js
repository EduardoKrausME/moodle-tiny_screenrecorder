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

/**
 * Tiny Screen Recorder options.
 *
 * @module      tiny_screenrecorder/options
 * @copyright   2026 Eduardo Kraus
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {getPluginOptionName} from 'editor_tiny/options';
import {pluginName} from './common';

const dataName = getPluginOptionName(pluginName, 'data');

/**
 * Register plugin configuration supplied by PHP.
 *
 * @param {TinyMCE} editor
 */
export const register = (editor) => {
    editor.options.register(dataName, {
        processor: 'object',
    });
};

/**
 * Return configuration for this editor.
 *
 * @param {TinyMCE} editor
 * @returns {Object}
 */
export const getData = (editor) => editor.options.get(dataName);
