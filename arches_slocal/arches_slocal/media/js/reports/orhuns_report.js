define([
    'knockout',
    'viewmodels/report',
    'templates/views/report-templates/orhuns_report.htm'
], function(ko, ReportViewModel, customReportTemplate) {

    return ko.components.register('orhuns_report', {
        viewModel: function(params) {
            var self = this;

            self.report = params.report;

            // --- Metadata ---
            self.reportDate = self.report.report_json ? self.report.report_json.report_date : 'No date';
            self.firstCardName = self.report.cards && self.report.cards.length > 0 ? self.report.cards[0].name : 'No cards';
            self.hasProvisionalData = function() { return false; };
            self.summary = null;
            self.configForm = null;

            console.log('==== ORHUNS REPORT ====');
            console.log('report object:', self.report);

            // --- Node lookup ---
            var nodeLookup = {};
            (self.report.attributes.graph?.nodes || []).forEach(function(node) {
                nodeLookup[node.nodeid] = node;
            });
            console.log('Node lookup:', nodeLookup);

            // --- Tiles normalize ---
            self.tiles = ko.observableArray(
                (self.report.attributes.tiles || []).map(function(tile) {

                    var nodes = [];

                    Object.keys(tile.data || {}).forEach(function(nodeid, i) {
                        var nodeDef = nodeLookup[nodeid];
                        var raw = tile.data[nodeid];

                        var value = null;
                        var label = '—';

                        if (!nodeDef) {
                            label = '[Unknown node]';
                        } else {
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
                                    value = raw;  // number primitive
                                    label = (value !== null && value !== undefined) ? value : '—';
                                    break;

                                case 'resource-instance':
                                    if (Array.isArray(raw) && raw.length > 0) {
                                        value = raw[0].resourceId;
                                        label = raw[0].label || value || '—';
                                    } else {
                                        value = null;
                                        label = '—';
                                    }
                                    break;

                                default:
                                    value = raw;
                                    label = JSON.stringify(raw);
                            }
                        }

                        nodes.push({
                            order: i + 1,
                            nodeid: nodeid,
                            alias: nodeDef ? nodeDef.alias : nodeid,
                            nodename: nodeDef ? nodeDef.name : '',
                            datatype: nodeDef ? nodeDef.datatype : '',
                            value: value,
                            label: label
                        });
                    });

                    return {
                        tileid: tile.tileid,
                        nodegroup_id: tile.nodegroup_id,
                        parenttile_id: tile.parenttile_id,
                        resourceinstance_id: tile.resourceinstance_id,
                        nodes: nodes
                    };
                })
            );

            console.log('Tiles (processed):', self.tiles());

        },
        template: customReportTemplate
    });
});