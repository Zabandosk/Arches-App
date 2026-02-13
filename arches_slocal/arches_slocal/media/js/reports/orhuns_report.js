define([
    'knockout',
    'viewmodels/report',
    'templates/views/report-templates/orhuns_report.htm'
], function (ko, ReportViewModel, template) {

    return ko.components.register('orhuns_report', {
        viewModel: function (params) {

            var self = this;

            self.report = params.report;
            self.reportDate = self.report.report_json 
                ? self.report.report_json.report_date 
                : 'No date';

            /* ---------------- NODE LOOKUP ---------------- */
            var nodeLookup = {};
            (self.report.attributes.graph.nodes || []).forEach(function (n) {
                nodeLookup[n.nodeid] = n;
            });

            /* ---------------- NORMALIZE RELATED ---------------- */
            function normalizeRelatedReport(json) {

                var gNodes = {};
                (json.graph.nodes || []).forEach(function (n) {
                    gNodes[n.nodeid] = n;
                });

                return (json.tiles || []).map(function (tile) {

                    var nodes = [];

                    Object.keys(tile.data || {}).forEach(function (nid) {

                        var def = gNodes[nid];
                        var raw = tile.data[nid];
                        var label = '—';

                        if (def) {

                            if (def.datatype === 'string') {
                                label =
                                    (raw?.en?.value) ||
                                    (raw?.ar?.value) ||
                                    (raw?.he?.value) ||
                                    raw ||
                                    '—';
                            }

                            if (def.datatype === 'number') {
                                label = raw;
                            }

                            if (def.datatype === 'resource-instance') {
                                if (Array.isArray(raw) && raw.length) {
                                    label = raw[0].displayValue || raw[0].label || raw[0].resourceId;
                                }
                            }
                        }

                        nodes.push({
                            nodename: def ? def.name : nid,
                            label: label
                        });
                    });

                    return { nodes: nodes };
                });
            }

            /* ---------------- FETCH RELATED ---------------- */
            self.loadRelatedObject = function (node) {

                if (node.relatedTiles()) return;

                var url = '/api/resource_report/' 
                    + node.value 
                    + '?v=beta&uncompacted=true';

                fetch(url)
                    .then(r => {
                        if (!r.ok) throw new Error('HTTP ' + r.status);
                        return r.json();
                    })
                    .then(json => {
                        console.log("RELATED JSON:", json);
                        node.relatedTiles(normalizeRelatedReport(json));
                    })
                    .catch(err => {
                        console.error('Related resource fetch failed', err);
                    });
            };

            /* ---------------- MAIN TILES ---------------- */
            self.tiles = ko.observableArray(
                (self.report.attributes.tiles || []).map(function (tile) {

                    var nodes = [];

                    Object.keys(tile.data || {}).forEach(function (nodeid) {

                        var def = nodeLookup[nodeid];
                        var raw = tile.data[nodeid];
                        var value = null;
                        var label = '—';

                        if (def) {

                            if (def.datatype === 'string') {
                                label =
                                    (raw?.en?.value) ||
                                    (raw?.ar?.value) ||
                                    (raw?.he?.value) ||
                                    '—';
                            }

                            if (def.datatype === 'number') {
                                label = raw;
                            }

                            if (def.datatype === 'resource-instance') {
                                if (Array.isArray(raw) && raw.length) {
                                    value = raw[0].resourceId;
                                    label = raw[0].displayValue || raw[0].label || value;
                                }
                            }
                        }

                        nodes.push({
                            nodename: def ? def.name : '',
                            datatype: def ? def.datatype : '',
                            value: value,
                            label: label,
                            relatedTiles: ko.observable(null)
                        });
                    });

                    return {
                        tileid: tile.tileid,
                        nodes: nodes
                    };
                })
            );
        },

        template: template
    });
});