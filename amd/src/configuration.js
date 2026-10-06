// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

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
