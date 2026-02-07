define([
    'knockout',
    'templates/views/report-templates/orhuns_report.htm'
], function (ko, customReportTemplate) {

    return ko.components.register('orhuns_report', {
        viewModel: function (params) {
            var self = this;

            self.report = params.report;

            self.reportDate = self.report.report_json
                ? self.report.report_json.report_date
                : 'No date';

            console.log('==== ORHUNS REPORT ====');
            console.log('Report:', self.report);


            var nodeLookup = {};
            (self.report.attributes.graph.nodes || []).forEach(function (node) {
                nodeLookup[node.nodeid] = node;
            });


            self.tiles = ko.observableArray(
                (self.report.attributes.tiles || []).map(function (tile) {

                    var nodes = [];

                    Object.keys(tile.data || {}).forEach(function (nodeid, i) {
                        var nodeDef = nodeLookup[nodeid];
                        var raw = tile.data[nodeid];

                        var label = '—';

                        if (nodeDef && raw) {
                            if (nodeDef.datatype === 'string') {
                                label =
                                    (raw.en && raw.en.value) ||
                                    Object.values(raw)[0]?.value ||
                                    '—';
                            } else if (nodeDef.datatype === 'number') {
                                label = raw.value ?? '—';
                            } else if (nodeDef.datatype === 'resource-instance') {
                                label = raw.label || raw.resourceId || '—';
                            } else {
                                label = JSON.stringify(raw);
                            }
                        }

                        nodes.push({
                            alias: nodeDef ? nodeDef.alias : nodeid,
                            datatype: nodeDef ? nodeDef.datatype : '',
                            label: label
                        });
                    });

                    return {
                        tileid: tile.tileid,
                        nodegroup_id: tile.nodegroup_id,
                        nodes: nodes
                    };
                })
            );
        },
        template: customReportTemplate
    });
});