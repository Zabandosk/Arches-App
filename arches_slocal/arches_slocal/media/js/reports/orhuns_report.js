define([
    'knockout',
    'templates/views/report-templates/orhuns_report.htm'
], function(ko, customReportTemplate) {

    return ko.components.register('orhuns_report', {
        viewModel: function(params) {
            var self = this;

            self.report = params.report;

            console.log('==== ORHUNS REPORT ====');
            console.log('report object:', self.report);

            /* ---------------------------
             * NODE LOOKUP (graph)
             * --------------------------- */
            var nodeLookup = {};
            (self.report.attributes.graph.nodes || []).forEach(function(node) {
                nodeLookup[node.nodeid] = node;
            });

            console.log('Node lookup:', nodeLookup);

            /* ---------------------------
             * NODEGROUP -> TILES MAP
             * --------------------------- */
            var groups = {};

            (self.report.attributes.tiles || []).forEach(function(tile) {
                if (!groups[tile.nodegroup_id]) {
                    groups[tile.nodegroup_id] = {
                        nodegroup_id: tile.nodegroup_id,
                        tiles: []
                    };
                }

                var nodes = [];

                Object.keys(tile.data || {}).forEach(function(nodeid, i) {
                    var nodeDef = nodeLookup[nodeid];
                    var raw = tile.data[nodeid];

                    var label = '—';
                    var value = null;

                    if (nodeDef) {
                        switch (nodeDef.datatype) {

                            case 'string':
                                value =
                                    (raw.en && raw.en.value) ||
                                    (raw.ar && raw.ar.value) ||
                                    (raw.he && raw.he.value) ||
                                    '';
                                label = value || '—';
                                break;

                            case 'number':
                                value = raw.value;
                                label = value !== null && value !== undefined ? value : '—';
                                break;

                            case 'resource-instance':
                                value = raw.resourceId;
                                label = raw.label || raw.resourceId || '—';
                                break;

                            default:
                                label = JSON.stringify(raw);
                        }
                    } else {
                        label = '[Unknown node]';
                    }

                    nodes.push({
                        order: i + 1,
                        nodeid: nodeid,
                        alias: nodeDef ? nodeDef.alias : nodeid,
                        nodename: nodeDef ? nodeDef.name : '',
                        datatype: nodeDef ? nodeDef.datatype : '',
                        label: label
                    });
                });

                groups[tile.nodegroup_id].tiles.push({
                    tileid: tile.tileid,
                    nodes: nodes
                });
            });

            /* ---------------------------
             * KO observable
             * --------------------------- */
            self.nodegroups = ko.observableArray(
                Object.values(groups)
            );

            console.log('Grouped nodegroups:', self.nodegroups());
        },

        template: customReportTemplate
    });
});