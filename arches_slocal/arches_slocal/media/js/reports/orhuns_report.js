define([
    'knockout',
    'viewmodels/report',
    'templates/views/report-templates/orhuns_report.htm'
], function(ko, ReportViewModel, customReportTemplate) {

    return ko.components.register('orhuns_report', {
        viewModel: function(params) {
            var self = this;


            self.report = params.report;


            self.reportDate = self.report.report_json ? self.report.report_json.report_date : 'No date';
            self.firstCardName = self.report.cards && self.report.cards.length > 0 ? self.report.cards[0].name : 'No cards';
            self.hasProvisionalData = function() { return false; };
            self.summary = null;
            self.configForm = null;

            console.log('==== ORHUNS REPORT ====');
            console.log('report object:', self.report);

            // Tiles log (value varsa)
            if (self.report.attributes && self.report.attributes.tiles) {
                self.report.attributes.tiles.forEach(function(tile, i) {
                    console.log('Tile', i, 'tileid:', tile.tileid, 'nodegroup_id:', tile.nodegroup_id);
                    console.log('  data:', tile.data); 
                });
            }
        },
        template: customReportTemplate
    });
});