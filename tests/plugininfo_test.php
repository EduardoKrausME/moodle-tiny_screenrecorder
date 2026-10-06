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
// along with Moodle.  If not, see <https://www.gnu.org/licenses/>.

declare(strict_types=1);

namespace tiny_screenrecorder;

use advanced_testcase;
use context_system;

/**
 * Tests for the Tiny plugin definition.
 *
 * @package    tiny_screenrecorder
 * @covers     \tiny_screenrecorder\plugininfo
 * @copyright  2026 Eduardo Kraus
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
final class plugininfo_test extends advanced_testcase {
    protected function setUp(): void {
        parent::setUp();
        $this->resetAfterTest();
        set_config('maxduration', 300, 'tiny_screenrecorder');
        set_config('allowwebcam', 1, 'tiny_screenrecorder');
        set_config('allowmicrophone', 1, 'tiny_screenrecorder');
        set_config('allowppt', 1, 'tiny_screenrecorder');
    }

    public function test_guest_user_cannot_use_recorder(): void {
        $this->setGuestUser();
        $context = context_system::instance();

        $this->assertFalse(plugininfo::is_enabled(
            $context,
            ['maxfiles' => 1],
            ['media' => ['itemid' => 123]]
        ));
    }

    public function test_configuration_contains_editor_context_and_limits(): void {
        $user = $this->getDataGenerator()->create_user();
        $this->setUser($user);
        $context = context_system::instance();

        $config = plugininfo::get_plugin_configuration_for_context(
            $context,
            ['maxfiles' => 1, 'maxbytes' => 1048576],
            ['media' => ['itemid' => 123]]
        );

        $this->assertSame($context->id, $config['data']['contextid']);
        $this->assertSame(123, $config['data']['itemid']);
        $this->assertSame(300, $config['data']['maxduration']);
        $this->assertLessThanOrEqual(1048576, $config['data']['maxbytes']);
        $this->assertNotEmpty($config['data']['sesskey']);
    }
}
