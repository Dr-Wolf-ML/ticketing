var Bugsnag = require('@bugsnag/js');
var BugsnagPluginExpress = require('@bugsnag/plugin-express');

export const startBugsnag = async () => {
    await Bugsnag.start({
        apiKey: process.env.BUGSNAG_API_KEY!,
        plugins: [BugsnagPluginExpress],
    });

    // send test error to Bugsnag
    let currentdate = new Date();
    const timeStamp = `
    ${currentdate.getDate()}/
    ${currentdate.getMonth() + 1}/
    ${currentdate.getFullYear()} @ 
    ${currentdate.getHours()}:
    ${currentdate.getMinutes()}:
    ${currentdate.getSeconds()}
    `;

    Bugsnag.notify(new Error(`Test error from Auth Service on ${timeStamp}`));
};
