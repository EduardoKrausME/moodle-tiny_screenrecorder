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
 * Tiny Screen Recorder editor configuration.
 *
 * @module      tiny_screenrecorder/configuration
 * @package   tiny_screenrecorder
 * @copyright   2026 Eduardo Kraus
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {buttonName} from './common';
import {addMenubarItem, addToolbarButton} from 'editor_tiny/utils';

/**
 * Add Screen Recorder to the Tiny toolbar and Insert menu.
 *
 * @param {Object} instanceConfig
 * @returns {Object}
 */
export const configure = (instanceConfig) => ({
    toolbar: addToolbarButton(instanceConfig.toolbar, 'content', buttonName),
    menu: addMenubarItem(instanceConfig.menu, 'insert', buttonName),
});
