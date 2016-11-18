"use strict";

// This is a hacked up version of "flow-remove-types/register" which allows
// us to include "mapbox-gl" directly.

var Module = require('module');
var removeTypes = require('flow-remove-types');

var _compileSuper = Module.prototype._compile;
Module.prototype._compile = function _compile(source, filename) {
    var transformedSource = filename.indexOf('node_modules/mapbox-gl') !== -1 ? removeTypes(source) : source;
    _compileSuper.call(this, transformedSource, filename);
};
