let employees = [];
let ports = []

onconnect = function (event) {
    const port = event.ports[0];
    ports.push(port);

    port.onmessage = function (e) {
        // without using localStorage or the like, the employee
        // data is not presented when a new tab is opened (unless the
        // addEmployee button is clicked). adding this request
        // sends the employee data to the tab when it is first opened,
        // ensuring the data is displayed even without having to click the button
        console.log(e.data);
        if (e.data === "request") {
            port.postMessage(employees);
            return;
        }

        employees.push(e.data);
        console.log(employees);
        // according to stackoverflow, you'd have to store all ports
        // and iterate over them, sending the message to every one.
        // however, when commenting out this code, it still worked *on my machine*
        // https://stackoverflow.com/questions/51069506/show-message-using-sharedworker-in-all-tabs
        // ports.forEach((port) => {
        //     port.postMessage(employees);
        // })
        port.postMessage(employees);
    }

    // port.start is only necessary if adding the onmessage
    // through addEventListener. see also
    // https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker
    // port.start();
}