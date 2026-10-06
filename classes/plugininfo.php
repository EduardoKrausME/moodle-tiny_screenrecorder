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
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

namespace tiny_screenrecorder;

use context;
use editor_tiny\editor;
use editor_tiny\plugin;
use editor_tiny\plugin_with_buttons;
use editor_tiny\plugin_with_configuration;
use editor_tiny\plugin_with_menuitems;

/**
 * TinyMCE Screen Recorder plugin definition.
 *
 * @package    tiny_screenrecorder
 * @copyright  2026 Eduardo Kraus
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class plugininfo extends plugin implements plugin_with_buttons, plugin_with_menuitems, plugin_with_configuration {
    /**
     * Whether the plugin can be used in this editor instance.
     *
     * @param context $context
     * @param array $options
     * @param array $fpoptions
     * @param editor|null $editor
     * @return bool
     */
    public static function is_enabled(
        context $context,
        array $options,
        array $fpoptions,
        ?editor $editor = null
    ): bool {
        if (!isloggedin() || isguestuser() || !has_capability('tiny/screenrecorder:use', $context)) {
            return false;
        }

        return !empty($options['maxfiles']);
    }

    /**
     * Get buttons exposed by this plugin.
     *
     * @return string[]
     */
    public static function get_available_buttons(): array {
        return [
            'tiny_screenrecorder/screen',
        ];
    }

    /**
     * Get menu items exposed by this plugin.
     *
     * @return string[]
     */
    public static function get_available_menuitems(): array {
        return [
            'tiny_screenrecorder/screen',
        ];
    }

    /**
     * Configuration passed to JavaScript for the current editor context.
     *
     * @param context $context
     * @param array $options
     * @param array $fpoptions
     * @param editor|null $editor
     * @return array
     */
    public static function get_plugin_configuration_for_context(
        context $context,
        array $options,
        array $fpoptions,
        ?editor $editor = null
    ): array {
        $itemid = (int) ($options['itemid'] ?? 0);
        if ($itemid <= 0) {
            $mediaoptions = $fpoptions['media'] ?? [];
            if (is_object($mediaoptions)) {
                $itemid = (int) ($mediaoptions->itemid ?? 0);
            } else {
                $itemid = (int) ($mediaoptions['itemid'] ?? 0);
            }
        }

        $maxbytes = get_user_max_upload_file_size($context);
        if (!empty($options['maxbytes'])) {
            $editorlimit = (int) $options['maxbytes'];
            if ($editorlimit > 0 && ($maxbytes < 0 || $editorlimit < $maxbytes)) {
                $maxbytes = $editorlimit;
            }
        }

        $config = get_config('tiny_screenrecorder');
        $maxduration = property_exists($config, 'maxduration') ? (int) $config->maxduration : 600;
        $allowwebcam = property_exists($config, 'allowwebcam') ? (bool) $config->allowwebcam : true;
        $allowmicrophone = property_exists($config, 'allowmicrophone') ? (bool) $config->allowmicrophone : true;
        $allowppt = property_exists($config, 'allowppt') ? (bool) $config->allowppt : true;

        return [
            'data' => [
                'contextid' => $context->id,
                'itemid' => $itemid,
                'maxduration' => max(1, $maxduration),
                'maxbytes' => $maxbytes,
                'allowwebcam' => $allowwebcam && has_capability('tiny/screenrecorder:usewebcam', $context),
                'allowmicrophone' => $allowmicrophone && has_capability('tiny/screenrecorder:usemicrophone', $context),
                'allowppt' => $allowppt && has_capability('tiny/screenrecorder:usepresentation', $context),
                'sesskey' => sesskey(),
            ],
        ];
    }
}
