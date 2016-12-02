"use strict";

var assign = require('lodash.assign');

/**
 * Add a layer group to the map.
 *
 * @param {Map} map
 * @param {string} id The id of the new group
 * @param {Array<Object>} layers The Mapbox style spec layers of the new group
 * @param {string} [beforeId] The layer id or group id after which the group
 *     will be inserted after. If ommitted the group is added to the bottom of
 *     the style.
 */
function addGroup(map, id, layers, beforeId) {
    if (beforeId) {
        if (!isLayer(map, beforeId)) {
            beforeId = getGroupFirstLayer(map, beforeId);
        } else if (getLayerGroup(map, beforeId)) {
            beforeId = getGroupFirstLayer(map, getLayerGroup(map, beforeId));
        }
    }

    for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        var groupedMetadata = assign({}, layers[i].metadata || {}, {group: id});
        var groupedLayer = assign({}, layer, {metadata: groupedMetadata});
        map.addLayer(groupedLayer, beforeId);
    }
}

/**
 * Remove a layer group and all of its layers from the map.
 *
 * @param {Map} map
 * @param {string} id The id of the group to be removed.
 */
function removeGroup(map, id) {
    var layers = map.getStyle().layers;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].metadata.group === id) {
            map.removeLayer(layers[i].id);
        }
    }
}

/**
 * Remove a layer group and all of its layers from the map.
 *
 * @param {Map} map
 * @param {string} id The id of the group to be removed.
 */
function moveGroup(map, id, beforeId) {
    if (beforeId && !isLayer(map, beforeId)) {
        beforeId = getGroupFirstLayer(map, beforeId);
    } else if (beforeId && getLayerGroup(map, beforeId)) {
        beforeId = getGroupFirstLayer(map, getLayerGroup(map, beforeId));
    }

    var layers = map.getStyle().layers;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].metadata.group === id) {
            map.moveLayer(layers[i].id, beforeId);
        }
    }
}

/**
 * Get the id of the first layer in a group.
 *
 * @param {Map} map
 * @param {string} id The id of the group.
 * @returns {string}
 */
function getGroupFirstLayer(map, id) {
    return getLayerFromIndex(map, getGroupFirstIndex(map, id));
}

/**
 * Get the id of the last layer in a group.
 *
 * @param {Map} map
 * @param {string} id The id of the group.
 * @returns {string}
 */
function getGroupLastLayer(map, id) {
    return getLayerFromIndex(map, getGroupLastIndex(map, id));
}

function getGroupFirstIndex(map, id) {
    var layers = map.getStyle().layers;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].metadata.group === id) return i;
    }
    return -1;
}

function getGroupLastIndex(map, id) {
    var layers = map.getStyle().layers;
    var i = getGroupFirstIndex(map, id);
    if (i === -1) return -1;
    while (i < layers.length && (layers[i].id === id || layers[i].metadata.group === id)) i++;
    return i - 1;
}

function getLayerFromIndex(map, index) {
    if (index === -1) return undefined;
    var layers = map.getStyle().layers;
    return layers[index] && layers[index].id;
}

function getLayerGroup(map, id) {
    return map.getLayer(id).metadata.group;
}

function isLayer(map, id) {
    return !!map.getLayer(id);
}

module.exports = {
    addGroup,
    removeGroup,
    moveGroup,
    getGroupFirstLayer,
    getGroupLastLayer
};
