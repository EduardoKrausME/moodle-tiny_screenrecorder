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
 * @module tiny_screenrecorder/configuration
 * @package tiny_screenrecorder
 * @copyright 2026 Eduardo Kraus
 * @license https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define([
    './common',
    'editor_tiny/utils',
], function(Common, TinyUtils) {
    /**
     * Add Screen Recorder to the Tiny toolbar and Insert menu.
     *
     * @param {Object} instanceConfig
     * @returns {Object}
     */
    const configure = function(instanceConfig) {
        return {
            toolbar: TinyUtils.addToolbarButton(
                instanceConfig.toolbar,
                'content',
                Common.buttonName
            ),
            menu: TinyUtils.addMenubarItem(
                instanceConfig.menu,
                'insert',
                Common.buttonName
            ),
        };
    };

    return {
        configure,
    };
});
