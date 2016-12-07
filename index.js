"use strict";

var assign = require('lodash.assign');

/**
 * Add a layer group to the map.
 *
 * @param {Map} map
 * @param {string} id The id of the new group
 * @param {Array<Object>} layers The Mapbox style spec layers of the new group
 * @param {string} [beforeId] The layer id or group id after which the group
 *     will be inserted. If ommitted the group is added to the bottom of the
 *     style.
 */
function addGroup(map, id, layers, beforeId) {
    var beforeLayerId = normalizeBeforeId(map, beforeId);
    for (var i = 0; i < layers.length; i++) {
        addLayerToGroup(map, id, layers[i], beforeLayerId, true);
    }
}

/**
 * Add a single layer to an existing layer group.
 *
 * @param {Map} map
 * @param {string} groupId The id of group
 * @param {Object} layer The Mapbox style spec layer
 * @param {string} [beforeId] An existing layer id after which the new layer
 *     will be inserted. If ommitted the layer is added to the bottom of
 *     the group.
 */
function addLayerToGroup(map, groupId, layer, beforeId) {
    var ignoreBeforeIdCheck = arguments[4];

    if (beforeId && !ignoreBeforeIdCheck && (!isLayer(map, beforeId) || getLayerGroup(map, beforeId) !== groupId)) {
        throw new Error('beforeId must be the id of a layer within the same group');
    } else if (!beforeId && !ignoreBeforeIdCheck) {
        beforeId = getLayerIdFromIndex(map, getGroupFirstLayerId(map, groupId) - 1);
    }

    var groupedLayer = assign({}, layer, {metadata: assign({}, layer.metadata || {}, {group: groupId})});
    map.addLayer(groupedLayer, beforeId);
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
    var beforeLayerId = normalizeBeforeId(map, beforeId);

    var layers = map.getStyle().layers;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].metadata.group === id) {
            map.moveLayer(layers[i].id, beforeLayerId);
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
function getGroupFirstLayerId(map, id) {
    return getLayerIdFromIndex(map, getGroupFirstLayerIndex(map, id));
}

/**
 * Get the id of the last layer in a group.
 *
 * @param {Map} map
 * @param {string} id The id of the group.
 * @returns {string}
 */
function getGroupLastLayerId(map, id) {
    return getLayerIdFromIndex(map, getGroupLastLayerIndex(map, id));
}

function getGroupFirstLayerIndex(map, id) {
    var layers = map.getStyle().layers;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].metadata.group === id) return i;
    }
    return -1;
}

function getGroupLastLayerIndex(map, id) {
    var layers = map.getStyle().layers;
    var i = getGroupFirstLayerIndex(map, id);
    if (i === -1) return -1;
    while (i < layers.length && (layers[i].id === id || layers[i].metadata.group === id)) i++;
    return i - 1;
}

function getLayerIdFromIndex(map, index) {
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

function normalizeBeforeId(map, beforeId) {
    if (beforeId && !isLayer(map, beforeId)) {
        return getGroupFirstLayerId(map, beforeId);
    } else if (beforeId && getLayerGroup(map, beforeId)) {
        return getGroupFirstLayerId(map, getLayerGroup(map, beforeId));
    } else {
        return beforeId;
    }
}

module.exports = {
    addGroup,
    removeGroup,
    moveGroup,
    addLayerToGroup,
    getGroupFirstLayer: getGroupFirstLayerId,
    getGroupLastLayer: getGroupLastLayerId
};
