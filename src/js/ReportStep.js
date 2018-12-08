var ReportStep = function (reportDocument, stepObj) {

    const metricConfig = new ReportMetricConfig();

    const accept = function (filters) {
        if (filters.runs && filters.runs.indexOf(getValue('run')) == -1) {
            return false;
        }

        if (filters.cachedView && filters.cachedView.indexOf(getValue('cachedView')) == -1) {
            return false;
        }

        if (filters.steps && filters.steps.indexOf(getValue('step')) == -1) {
            return false;
        }

        if (filters.outliers) {
            let filters = {
                cachedView: getValue('cachedView'),
                steps: [getValue('step')]
            };
            let stdevStep = reportDocument.aggregations('standardDeviation', filters)[0];
            let averageStep = reportDocument.aggregations('average', filters)[0];

            let stdevValue = stdevStep.getValue('plt');
            let avgValue = averageStep.getValue('plt');
            let value = getValue('plt')

            if (value < avgValue - stdevValue || avgValue + stdevValue < value) {
                return false;
            }
        }

        return true;
    }

    const getValue = function (metricName) {
        let [value] = get(metricName);

        return value;
    }

    const getFormat = function (metricName) {
        let [value, metric] = get(metricName);

        return metric.format ? metric.format(value) : value;
    }

    const get = function (metricName) {
        let metric = metricConfig.get(metricName),
            value = metric.evaluate(stepObj);

        return [value, metric]
    }

    const values = function (metricNames) {
        return metricNames.map(metricName => getFormat(metricName));
    }

    return {
        accept,
        values,
        getValue,
        getFormat
    }
}