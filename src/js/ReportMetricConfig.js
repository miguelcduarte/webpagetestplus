var ReportMetricConfig = function () {
    const METRICS_STATE_KEY = 'metricsState';

    const appSettings = new AppSettings();

    let numberFormatDigits;

    const miliToSeconds = (time) => formatNumber(time / 1000);

    const bytesToKilobytes = (time) => formatNumber(time / 1024);

    const formatNumber = (value, digits, defaultValue = 0) => Math.round(!value ? defaultValue : value, digits == undefined ? numberFormatDigits : digits);

    const defaultString = (value, defaultValue = 'n/a') => !value ? defaultValue : value;

    const firstValue = (values) => values[0];

    const count = (values) => values.length || 0;

    const metrics = [
        {
            name: 'summaryUrl',
            description: 'Summary Url',
            expression: 'report.summary',
            format: defaultString,
            aggregate: firstValue,
            visible: true
        },
        {
            name: 'testId',
            description: 'Id',
            expression: 'report.id',
            format: defaultString,
            aggregate: firstValue,
            visible: true
        },
        {
            name: 'location',
            description: 'Location',
            expression: 'report.location',
            format: defaultString,
            aggregate: firstValue,
            visible: true
        },
        {
            name: 'label',
            description: 'Label',
            expression: 'report.label',
            format: defaultString,
            aggregate: firstValue,
            visible: true
        },
        {
            name: 'browser',
            description: 'Browser',
            expression: 'browser_name',
            format: defaultString,
            aggregate: firstValue,
            checked: true,
            visible: true
        },
        {
            name: 'connectivity',
            description: 'Connectivity',
            expression: 'report.connectivity',
            format: defaultString,
            aggregate: firstValue,
            checked: true,
            visible: true
        },
        {
            name: 'run',
            description: 'Run',
            expression: 'run',
            format: formatNumber,
            aggregate: count,
            checked: true,
            visible: true
        },
        {
            name: 'cachedView',
            description: 'Cached View',
            expression: 'cachedView',
            format: defaultString,
            aggregate: firstValue,
            checked: true,
            visible: true
        },
        {
            name: 'step',
            description: 'Step',
            expression: '$number(step)',
            format: formatNumber,
            aggregate: firstValue,
            checked: true,
            visible: true
        },
        {
            name: 'plt',
            description: 'PLT',
            expression: 'docTime',
            format: miliToSeconds,
            checked: true,
            visible: true
        },
        {
            name: 'ttfb',
            description: 'TTFB',
            expression: 'TTFB',
            format: miliToSeconds,
            checked: true,
            visible: true
        },
        {
            name: 'render',
            description: 'Start Render',
            expression: 'render',
            format: miliToSeconds,
            checked: true,
            visible: true
        },
        {
            name: 'userTime',
            description: 'User Time',
            expression: 'userTime',
            format: miliToSeconds,
            checked: true,
            visible: true
        },
        {
            name: 'speedIndex',
            description: 'Speed Index',
            expression: 'SpeedIndex',
            format: miliToSeconds,
            checked: true,
            visible: true
        },
        {
            name: 'tti',
            description: 'TTI',
            expression: 'TimeToInteractive',
            format: miliToSeconds,
            checked: true,
            visible: true
        },
        {
            name: 'requestsDoc',
            description: 'Document Requests',
            expression: 'requestsDoc',
            format: formatNumber,
            checked: true,
            visible: true
        },
        {
            name: 'bytesInDoc',
            description: 'Document Bytes In',
            expression: 'bytesInDoc',
            format: bytesToKilobytes,
            checked: true,
            visible: true
        },
        {
            name: 'pageSize',
            description: 'Page Size',
            expression: 'requests[0].objectSizeUncompressed',
            format: bytesToKilobytes,
            checked: true,
            visible: true
        },
        {
            name: 'fullyTime',
            description: 'Fully Loaded',
            expression: 'fullyLoaded',
            format: miliToSeconds,
            checked: true,
            visible: true
        },
        {
            name: 'fullyRequests',
            description: 'Fully Requests',
            expression: 'requestsFull',
            format: formatNumber,
            checked: true,
            visible: true
        },
        {
            name: 'fullyBytes',
            description: 'Fully Bytes In',
            expression: 'bytesIn',
            format: bytesToKilobytes,
            checked: true,
            visible: true
        },
    ];

    const init = function () {
        metrics.forEach(metric => metric.evaluate = jsonata(metric.expression).evaluate);
        setState();

        numberFormatDigits = parseInt(appSettings.get('formatNumberDigits'))
    }

    const get = (name) => metrics.filter((metric) => metric.name == name)[0];

    const list = () => metrics;

    const setMetricsState = function (metricState) {
        appSettings.set(METRICS_STATE_KEY, metricState);
        setState(metricState);
    }

    const setState = function (metricState) {
        metricState = metricState || appSettings.get(METRICS_STATE_KEY);
        metricState && metrics.sort((m1, m2) => {
            let mi1 = metricState.findIndex(e => e.name === m1.name),
                mi2 = metricState.findIndex(e => e.name === m2.name);

            return mi1 - mi2;
        });

        metricState && metrics.forEach((metric, index) => metric.checked = metricState[index].selected);
    }

    init();

    return {
        get,
        list,
        setMetricsState,
    }
}