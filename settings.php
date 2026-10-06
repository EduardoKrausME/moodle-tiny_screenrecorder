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

/**
 * Administration settings for Screen Recorder.
 *
 * @package    tiny_screenrecorder
 * @copyright  2026 Eduardo Kraus
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

if ($ADMIN->fulltree) {
    $duration = new admin_setting_configduration(
        'tiny_screenrecorder/maxduration',
        get_string('settings:maxduration', 'tiny_screenrecorder'),
        get_string('settings:maxduration_desc', 'tiny_screenrecorder'),
        600
    );
    $duration->set_validate_function(static function($value): string {
        return (int) $value > 0 ? '' : get_string('settings:maxduration_invalid', 'tiny_screenrecorder');
    });
    $settings->add($duration);

    $settings->add(new admin_setting_configcheckbox(
        'tiny_screenrecorder/allowwebcam',
        get_string('settings:allowwebcam', 'tiny_screenrecorder'),
        get_string('settings:allowwebcam_desc', 'tiny_screenrecorder'),
        1
    ));

    $settings->add(new admin_setting_configcheckbox(
        'tiny_screenrecorder/allowmicrophone',
        get_string('settings:allowmicrophone', 'tiny_screenrecorder'),
        get_string('settings:allowmicrophone_desc', 'tiny_screenrecorder'),
        1
    ));

    $settings->add(new admin_setting_configcheckbox(
        'tiny_screenrecorder/allowppt',
        get_string('settings:allowppt', 'tiny_screenrecorder'),
        get_string('settings:allowppt_desc', 'tiny_screenrecorder'),
        1
    ));
}
