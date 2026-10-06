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
 * Tiny Screen Recorder options.
 *
 * @module      tiny_screenrecorder/options
 * @package   tiny_screenrecorder
 * @copyright   2026 Eduardo Kraus
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define(["exports","editor_tiny/options","./common"],function(_exports,_editorOptions,_common){"use strict";Object.defineProperty(_exports,"__esModule",{value:true});_exports.register=_exports.getData=void 0;const dataName=(0,_editorOptions.getPluginOptionName)(_common.pluginName,"data");_exports.register=editor=>{editor.options.register(dataName,{processor:"object"});};_exports.getData=editor=>editor.options.get(dataName);});
