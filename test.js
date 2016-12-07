"use strict";

require('./flow-remove-types-register');

var t = require('tap');
var mapboxgl = require('mapbox-gl');
var window = require('mapbox-gl/js/util/window');
var groups = require('./index');

t.test('getGroupFirstLayer', function(t) {

    t.test('for a non-existent id', function(t) {
        createMap([], function(err, map) {
            t.error(err);

            t.equal(groups.getGroupFirstLayer(map, 'nonexistent'), undefined);

            t.end();
        });
    });

    t.test('for a group', function(t) {
        createMap([l('layer1'), l('layer2', 'group1')], function(err, map) {
            t.error(err);

            t.equal(groups.getGroupFirstLayer(map, 'group1'), 'layer2');

            t.end();
        });
    });

    t.end();
});

t.test('getGroupLastLayer', function(t) {

    t.test('for a non-existent id', function(t) {
        createMap([], function(err, map) {
            t.error(err);

            t.equal(groups.getGroupLastLayer(map, 'nonexistent'), undefined);

            t.end();
        });
    });

    t.test('for a group', function(t) {
        createMap([l('layer1', 'group1'), l('layer2', 'group1')], function(err, map) {
            t.error(err);

            t.equal(groups.getGroupLastLayer(map, 'group1'), 'layer2');

            t.end();
        });
    });

    t.end();
});

t.test('addGroup', function(t) {

    t.test('to an empty style', function(t) {
        createMap([], function(err, map) {
            t.error(err);

            groups.addGroup(map, 'group1', [l('layer1')]);

            t.deepEqual(
                map.getStyle().layers,
                [l('layer1', 'group1')]
            );

            t.end();
        });
    });

    t.test('at the bottom of a style (without a "beforeId")', function(t) {
        createMap(
            [l('layer1')],
            function(err, map) {
                t.error(err);

                groups.addGroup(map, 'group1', [l('layer2')]);

                t.deepEqual(map.getStyle().layers, [
                    l('layer1'),
                    l('layer2', 'group1'),
                ]);

                t.end();
            }
        );
    });

    t.test('before a layer', function(t) {
        createMap(
            [l('layer1'), l('layer2')],
            function(err, map) {
                t.error(err);

                groups.addGroup(map, 'group1', [l('layer3')], 'layer2');

                t.deepEqual(map.getStyle().layers, [
                    l('layer1'),
                    l('layer3', 'group1'),
                    l('layer2')
                ]);

                t.end();
            }
        );
    });

    t.test('before a group', function(t) {
        createMap(
            [l('layer1', 'group1'), l('layer2', 'group2')],
            function(err, map) {
                t.error(err);

                groups.addGroup(map, 'group3', [l('layer3')], 'group2');

                t.deepEqual(map.getStyle().layers, [
                    l('layer1', 'group1'),
                    l('layer3', 'group3'),
                    l('layer2', 'group2')
                ]);

                t.end();
            }
        );
    });


    t.test('before a layer in the middle of another group', function(t) {
        createMap(
            [l('layer1', 'group1'), l('layer2', 'group1')],
            function(err, map) {
                t.error(err);

                groups.addGroup(map, 'group2', [l('layer3')], 'layer2');

                t.deepEqual(map.getStyle().layers, [
                    l('layer3', 'group2'),
                    l('layer1', 'group1'),
                    l('layer2', 'group1')
                ]);

                t.end();
            }
        );
    });

    t.end();
});

t.test('addLayerToGroup', function(t) {

    t.test('at the bottom of a group (without a "beforeId")', function(t) {
        createMap(
            [l('layer1', 'group1')],
            function(err, map) {
                t.error(err);

                groups.addLayerToGroup(map, 'group1', l('layer2'));

                t.deepEqual(map.getStyle().layers, [
                    l('layer1', 'group1'),
                    l('layer2', 'group1')
                ]);

                t.end();
            }
        );
    });

    t.test('before a layer within the same group', function(t) {
        createMap(
            [l('layer1', 'group1')],
            function(err, map) {
                t.error(err);

                groups.addLayerToGroup(map, 'group1', l('layer2'), 'layer1');

                t.deepEqual(map.getStyle().layers, [
                    l('layer2', 'group1'),
                    l('layer1', 'group1')
                ]);

                t.end();
            }
        );
    });

    t.test('to a non-existant group', function(t) {
        createMap([l('layer1', 'group1')], function(err, map) {
            t.error(err);

            groups.addLayerToGroup(map, 'group2', l('layer2'));

            t.deepEqual(map.getStyle().layers, [
                l('layer1', 'group1'),
                l('layer2', 'group2')
            ]);

            t.end();
        });
    });

    t.test('before a layer within a different group', function(t) {
        createMap(
            [l('layer1', 'group1'), l('layer2', 'group2')],
            function(err, map) {
                t.error(err);

                t.throws(function() {
                    groups.addLayerToGroup(map, 'group1', l('layer3'), 'layer2');
                });

                t.end();
            }
        );
    });

    t.test('before a group', function(t) {
        createMap(
            [l('layer1', 'group1')],
            function(err, map) {
                t.error(err);

                t.throws(function() {
                    groups.addLayerToGroup(map, 'group1', l('layer3'), 'group1');
                });

                t.end();
            }
        );
    });

    t.test('before a non-existant group', function(t) {
        createMap([], function(err, map) {
            t.error(err);

            t.throws(function() {
                groups.addLayerToGroup(map, 'group1', l('layer1'), 'group1');
            });

            t.end();
        });
    });

    t.end();
});

t.test('removeGroup', function(t) {

    t.test('a non-existent id', function(t) {
        createMap([], function(err, map) {
            t.error(err);
            groups.removeGroup(map, 'nonexistent');
            t.deepEqual(map.getStyle().layers, []);
            t.end();
        }
        );
    });

    t.test('a group', function(t) {
        createMap(
            [
                l('layer1'),
                l('layer2', 'group1'),
                l('layer3', 'group1'),
                l('layer4')
            ],
            function(err, map) {
                t.error(err);
                groups.removeGroup(map, 'group1');
                t.deepEqual(map.getStyle().layers, [l('layer1'), l('layer4')]);
                t.end();
            }
        );
    });

    t.end();
});

t.test('moveGroup', function(t) {

    t.test('a non-existent id', function(t) {
        createMap([], function(err, map) {
            t.error(err);
            groups.moveGroup(map, 'nonexistent');
            t.deepEqual(map.getStyle().layers, []);
            t.end();
        });
    });

    t.test('a group before an ungrouped layer', function(t) {
        createMap(
            [
                l('layer1'),
                l('layer2', 'group1'),
                l('layer3', 'group1')
            ],
            function(err, map) {
                t.error(err);
                groups.moveGroup(map, 'group1', 'layer1');
                t.deepEqual(map.getStyle().layers, [
                    l('layer2', 'group1'),
                    l('layer3', 'group1'),
                    l('layer1')
                ]);
                t.end();
            }
        );
    });

    t.test('a group before a grouped layer', function(t) {
        createMap(
            [
                l('layer1', 'group1'),
                l('layer2', 'group1'),
                l('layer3', 'group2'),
                l('layer4', 'group2')
            ],
            function(err, map) {
                t.error(err);
                groups.moveGroup(map, 'group2', 'layer2');
                t.deepEqual(map.getStyle().layers, [
                    l('layer3', 'group2'),
                    l('layer4', 'group2'),
                    l('layer1', 'group1'),
                    l('layer2', 'group1')
                ]);
                t.end();
            }
        );
    });

    t.test('a group before a group', function(t) {
        createMap(
            [
                l('layer1', 'group1'),
                l('layer2', 'group2'),
                l('layer3', 'group2')
            ],
            function(err, map) {
                t.error(err);
                groups.moveGroup(map, 'group2', 'group1');
                t.deepEqual(map.getStyle().layers, [
                    l('layer2', 'group2'),
                    l('layer3', 'group2'),
                    l('layer1', 'group1')
                ]);
                t.end();
            }
        );
    });

    t.test('a group to the end', function(t) {
        createMap(
            [
                l('layer1', 'group1'),
                l('layer2', 'group1'),
                l('layer3')
            ],
            function(err, map) {
                t.error(err);
                groups.moveGroup(map, 'group1');
                t.deepEqual(map.getStyle().layers, [
                    l('layer3'),
                    l('layer1', 'group1'),
                    l('layer2', 'group1')
                ]);
                t.end();
            }
        );
    });

    t.end();
});

function l(layerId, groupId) {
    return {id: layerId, type: 'background', metadata: {group: groupId}};
}

function createMap(layers, callback) {
    const container = window.document.createElement('div');
    container.offsetWidth = 200;
    container.offsetHeight = 200;

    const map = new mapboxgl.Map({
        container: container,
        interactive: false,
        attributionControl: false,
        style: {
            "version": 8,
            "sources": {},
            "layers": layers
        }
    });

    if (callback) map.on('load', () => {
        callback(null, map);
    });
}
