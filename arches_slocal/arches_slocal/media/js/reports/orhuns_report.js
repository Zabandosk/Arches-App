define([
    'knockout',
    'viewmodels/report',
    'templates/views/report-templates/orhuns_report.htm'
], function(ko, ReportViewModel, customReportTemplate) {
    return ko.components.register('orhuns_report', {
        viewModel: function(params) {
            params.configKeys = []; 
            ReportViewModel.apply(this, [params]);
        },
        template: customReportTemplate,
    });
});