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

define(["exports","editor_tiny/loader","editor_tiny/utils","core/str","./common","./options","./recorder","./configuration"],function(_exports,_loader,_utils,_str,_common,_options,_recorder,Configuration){"use strict";Object.defineProperty(_exports,"__esModule",{value:true});_exports.default=void 0;const pluginPromise=new Promise(async resolve=>{const[tinyMCE,buttonText,buttonImage,pluginMetadata]=await Promise.all([(0,_loader.getTinyMCE)(),(0,_str.get_string)("buttontitle",_common.component),(0,_utils.getButtonImage)("screen",_common.component),(0,_utils.getPluginMetadata)(_common.component,_common.pluginName)]);tinyMCE.PluginManager.add(_common.component+"/plugin",editor=>{(0,_options.register)(editor);editor.ui.registry.addIcon(_common.buttonIcon,buttonImage.html);editor.ui.registry.addButton(_common.buttonName,{icon:_common.buttonIcon,tooltip:buttonText,onAction:()=>(0,_recorder.openRecorder)(editor)});editor.ui.registry.addMenuItem(_common.buttonName,{icon:_common.buttonIcon,text:buttonText,onAction:()=>(0,_recorder.openRecorder)(editor)});return pluginMetadata;});resolve([_common.component+"/plugin",Configuration]);});_exports.default=pluginPromise;});
