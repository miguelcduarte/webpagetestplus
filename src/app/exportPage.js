var ExportPage = (function () {

    const settings = new AppSettings();
    const metricConfig = new ReportMetricConfig();
    const cache = settings.get('useReportCache') ? new MemoryCache() : undefined;

    const init = function (endpoint, testCode) {
        let settings = new AppSettings();

        document.getElementById("exportEndpoint").value = endpoint || settings.get('endpoint');
        document.getElementById("testCode").value = testCode;        
        
        renderMetricsSelector();
        bindEvents();
    }

    const generateCsv = function () {
        let exportEndpoint = FormHelper.getInputValue('exportEndpoint');
        let testCodes = FormHelper.getInputValue('testCode').split(',');

        let reportExporter = new ReportExporter(exportEndpoint, cache);

        let tasks = testCodes.map(testCode => {
            return reportExporter
                .get(testCode)
                .catch((status) => {
                    console.log(status);
                });
        })

        Promise.all(tasks).then(reports => {
            setResult(reportExporter.exportCsv(reports, { metrics: getExportMetrics(), filters: getFilters(), aggregate: getAggregation() }));
        })
    }

    const copyToClipboard = function () {
        let csvInput = FormHelper.getInput('resultCsv');
        csvInput.select();
        document.execCommand("copy");
    }

    const onAggregationChange = function () {
        let aggregationInput = this,
            aggretateTypeInputs = document.getElementsByClassName("js-aggregationOption"),
            disabledAttr = 'disabled';

        Array.from(aggretateTypeInputs).forEach(i => {
            if (aggregationInput.checked) {
                i.removeAttribute(disabledAttr);
            }
            else {
                i.setAttribute(disabledAttr, disabledAttr);
            }
        });
    }

    const onMetricMoved = () => {
        setMetricsState();
    }

    const onMetricChange = () => {
        setMetricsState();
    }

    const setMetricsState = () => {
        var metrics = getExportMetrics(i => true);

        metricConfig.setMetricsState(metrics);
    }

    const getExportMetrics = function (filterCallback) {
        let metricInputs = FormHelper.getInputs('metrics');
        
        filterCallback = filterCallback || (i => i.checked);
        
        return Array.from(metricInputs).filter(filterCallback).map((i) => { 
            return { name: i.value, selected: i.checked }
        });
    }

    const getFilters = function () {
        let filters = {};

        let cachedView = FormHelper.getCheckedInputValues('exportCachedView');
        if (cachedView.length) {
            filters.cachedView = cachedView;
        }

        let steps = FormHelper.getInputValue('steps')
            .split(',')
            .filter(s => s);
        if (steps.length) {
            filters.steps = steps.map(s => parseInt(s));
        }

        let outliers = FormHelper.getCheckedInputValue('filterOutliers');
        if (outliers == '1') {
            filters.outliers = true;
        }

        let header = FormHelper.getCheckedInputValue('header');
        filters.header = (header == 'header');

        return filters;
    }

    const getAggregation = function () {
        let aggregate = {};

        let aggregateValue = FormHelper.getCheckedInputValue("aggregate");
        if (aggregateValue == '1') {
            let aggregateType = FormHelper.getCheckedInputValue("aggregateType");
            aggregate.type = aggregateType;
        }

        let mergeTestValue = FormHelper.getCheckedInputValue('mergeTest')
        aggregate.mergeTest = mergeTestValue == 'merge';

        return aggregate;
    }

    const setResult = function (text) {
        let csvInput = FormHelper.getInput('resultCsv');
        csvInput.innerText = text;
    }

    const renderMetricsSelector = function () {
        let metricSelector = document.getElementById('metricSelector');

        metricConfig.list()
            .filter(metric => metric.visible)
            .forEach(metric => HtmlHelper.insertBeforeEnd(metricSelector, Template.render('metricCheckbox', metric)));
    }

    const bindEvents = function () {
        document.getElementById('btnResult').addEventListener('click', generateCsv);
        document.getElementById('btnCopyClipboard').addEventListener('click', copyToClipboard);
        document.getElementById('aggregate').addEventListener('change', onAggregationChange);

        UIkit.util.on('#metricSelector', 'moved', onMetricMoved);
        UIkit.util.on('#metricSelector', 'change', onMetricChange);
    }

    return {
        init,
        generateCsv,
        copyToClipboard
    };
})()