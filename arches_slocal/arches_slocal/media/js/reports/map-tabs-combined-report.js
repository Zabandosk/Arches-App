define([
    'knockout',
    'viewmodels/tabbed-report',
    'templates/views/report-templates/map-tabs-combined.htm'
], function(ko, TabbedReportViewModel, mapTabsCombinedTemplate) {
    return ko.components.register('map-tabs-combined-report', {
        viewModel: TabbedReportViewModel,
        template: mapTabsCombinedTemplate,
    });
});
