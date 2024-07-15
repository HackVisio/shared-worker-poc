let employees = [];
let ports = []
// indexedDB stuff mostly from https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
let db;
let dbReady = false;

const DBOpenRequest = indexedDB.open("employees", 1);

DBOpenRequest.onerror = (event) => {
    console.log("Error loading database")
};

DBOpenRequest.onsuccess = async (event) => {
    console.log("Opened indexedDB database");
    db = DBOpenRequest.result;
    dbReady = true;

    console.log("loadEmployees from onsuccess");
    await loadEmployees();
};

const loadEmployees = () => {
    const employeeObjectStoreData = db.transaction("employees", "readwrite").objectStore("employees").getAll();
    employeeObjectStoreData.onsuccess = (event) => {
        const data = event.target.result;
        console.log(data);
        console.log("in loademployees")
        employees = data;
    }
}

DBOpenRequest.onupgradeneeded = (event) => {
    db = event.target.result;
    
    if (db.objectStoreNames.contains("employees")) {
        console.log("empoyees object store exists already");
        return;
    }
    const objectStore = db.createObjectStore("employees", { keyPath: "lastName" });
    objectStore.createIndex("position", "position", { unique: false });

    // Use transaction oncomplete to make sure the objectStore creation is
    // finished before adding data into it.
    objectStore.transaction.oncomplete = (event) => {
        console.log("objectstore created");
        // Store values in the newly created objectStore.
        const employeeObjectStore = db
        .transaction("employees", "readwrite")
        .objectStore("employees");
        employees.forEach((employee) => {
        employeeObjectStore.add(employee);
        });
    };
    console.log("done with onupgradeneeded");
}

onconnect = function (event) {
    const port = event.ports[0];
    ports.push(port);

    console.log("we are connecting")
    port.onmessage = async function (e) {
        // without using localStorage or the like, the employee
        // data is not presented when a new tab is opened (unless the
        // addEmployee button is clicked). adding this request
        // sends the employee data to the tab when it is first opened,
        // ensuring the data is displayed even without having to click the button
        await waitForDBReady();
        
        console.log(e.data);
        if (e.data === "request") {
            console.log("loggin request");
            port.postMessage(employees);
            return;
        }

        console.log("past logging request")

        employees.push(e.data);
        console.log(employees);

        const transaction = db.transaction(["employees"], "readwrite");
        // Do something when all the data is added to the database.
        transaction.oncomplete = (event) => {
            console.log("All done!");
        };
        
        transaction.onerror = (event) => {
            // Don't forget to handle errors!
        };
        
        const objectStore = transaction.objectStore("employees");
            const request = objectStore.add(e.data);
            request.onsuccess = (event) => {
                console.log("added employee");
            };

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

function waitForDBReady() {
    return new Promise((resolve) => {
        const checkDB = () => {
            if (dbReady) {
                resolve();
            } else {
                setTimeout(checkDB, 100); // Check again after a short delay
            }
        };
        checkDB();
    });
}