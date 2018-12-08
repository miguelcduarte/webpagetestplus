window.addEvent("domready", function () {

    var settings = new FancySettings("WPT Plus Settings", "../icons/icon24.png");
    var appSettings = new AppSettings();

    // SERVER
    settings.create({
        tab: i18n.get("server"),
        group: i18n.get("server"),
        name: "endpoint",
        type: "text",
        label: i18n.get("endpoint"),
        text: i18n.get("url")
    });

    // METRICS
    settings.create({
        tab: i18n.get("metrics"),
        group: i18n.get("formatNumber"),
        name: "formatNumberDigits",
        type: "text",
        label: i18n.get("digits"),
        text: i18n.get("digits")
    });

    let resetMetricOrderButton = settings.create({
        tab: i18n.get("metrics"),
        group: i18n.get("order"),
        name: "resetMetricOrder",
        type: "button",
        text: i18n.get("resetOrder")
    });

    let resetMetricCheckedButton = settings.create({
        tab: i18n.get("metrics"),
        group: i18n.get("checked"),
        name: "resetMetricChecked",
        type: "button",
        text: i18n.get("resetChecked")
    })

    // CACHE
    settings.create({
        tab: i18n.get("server"),
        group: i18n.get("cache"),
        name: "useReportCache",
        type: "checkbox",
        label: i18n.get("useReportCache"),
    });

    // LAST TAB
    settings.create({
        tab: i18n.get("lastTab"),
        group: i18n.get("wptResult"),
        name: "lastTabEndpoint",
        type: "text",
        label: i18n.get("endpoint"),
        text: i18n.get("url")
    });

    settings.create({
        tab: i18n.get("lastTab"),
        group: i18n.get("wptResult"),
        name: "lastTabTestCode",
        type: "text",
        label: i18n.get("testCode"),
        text: i18n.get("code")
    });

    resetMetricOrderButton.addEvent('action', function () {
        appSettings.set('metricOrder', undefined);
    });

    resetMetricCheckedButton.addEvent('action', function() {
        appSettings.set('metricChecked', undefined);
    });
});
