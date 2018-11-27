var ReportMetricExtractor = function (report) {

    const metricConfig = new ReportMetricConfig();
    let stdevData
    let averageData;

    const pages = function* () {
        let runs = report.runs;
        for (let run in runs) {
            let cachedViews = runs[run];
            for (let cachedView in cachedViews) {
                let test = cachedViews[cachedView];
                if (test.steps) {
                    for (let i = 0; i < test.steps.length; i++) {
                        var step = test.steps[i]
                        setContext(step, report, run, cachedView, i);
                        yield step;
                    }
                }
                else {
                    setContext(test, report, run, cachedView, 1);
                    yield test;
                }
            }
        }
    }

    const aggregations = function* (aggregationType) {
        let cachedViews = report[aggregationType];
        for (let cachedView in cachedViews) {
            let test = cachedViews[cachedView];
            if (test.steps) {
                for (let i = 0; i < test.steps.length; i++) {
                    var step = test.steps[i]
                    setContext(step, report, 0, cachedView, i);
                    yield step;
                }
            }
            else {
                setContext(test, report, 0, cachedView, 1);
                yield test;
            }
        }
    }

    const accept = function (page, filters) {
        if (filters.runs && filters.runs.indexOf(get(page, 'run')) == -1) {
            return false;
        }

        if (filters.cachedView && filters.cachedView.indexOf(get(page, 'cachedView')) == -1) {
            return false;
        }

        if (filters.steps && filters.steps.indexOf(get(page, 'step')) == -1) {
            return false;
        }

        if (filters.outliers) {
            if (!stdevData || !averageData) {
                stdevData = Queryable(aggregations('standardDeviation')).toArray();
                averageData = Queryable(aggregations('average')).toArray();
            }

            let stdevValue = get(aggregatedView(stdevData, page), 'plt')
            let avgValue = get(aggregatedView(averageData, page), 'plt')
            let value = get(page, 'plt')

            if (value < avgValue - stdevValue || avgValue + stdevValue < value) {
                return false;
            }
        }

        return true;
    }

    const aggregatedView = function (aggregateData, page) {
        let cachedView = get(page, 'cachedView'),
            step = get(page, 'step');

        return aggregateData.filter(agg => get(agg, 'cachedView') == cachedView && get(agg, 'step') == step)[0];
    }

    const headers = function (metricNames) {
        return metricNames.map(headerDescription)
    }

    const values = function (page, metricNames, aggregate) {
        return metricNames.map((metricName) => get(page, metricName, aggregate));
    }

    const get = function (page, metricName, aggregate) {
        let metric = metricConfig.get(metricName),
            value;

        if (Array.isArray(page)) {
            let metricValues = page.map(p => metric.expression.evaluate(p));
            value = (metric.aggregate || aggregate)(metricValues);
        }
        else {
            value = metric.expression.evaluate(page);
        }

        return metric.format ? metric.format(value) : value;
    }

    const headerDescription = function (metricName) {
        return metricConfig.get(metricName).description;
    }

    const setContext = function (page, report, run, cachedView, step) {
        page.report = report;
        page.run = run;
        page.cachedView = cachedView;
        page.step = step;
    }

    return {
        pages,
        aggregations,
        accept,
        headers,
        values,
        get
    }
}