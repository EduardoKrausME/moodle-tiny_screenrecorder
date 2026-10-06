// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

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
