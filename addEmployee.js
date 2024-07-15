// make sure SharedWorker API is supported by the browser
// why !! ? not sure, but official FireFox doc example does it too
if (!!window.SharedWorker) {
    // create a new sharedworker
    const employeeWorker = new SharedWorker("worker.js");

    const addEmployeeButton = document.getElementById("addEmployeeButton")

    function addEmployee() {
        // Get form values
        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;
        const age = document.getElementById("age").value;
        const position = document.getElementById("position").value;

        // Create an employee object
        const employee = {
            firstName,
            lastName,
            age,
            position
        };

        // Send the employee to the sharedworker
        employeeWorker.port.postMessage(employee);

        // Clear the form
        document.getElementById("employeeForm").reset();
    }

    addEmployeeButton.onclick = addEmployee;

    // display the employees after the worker has added them
    // to the array inside worker.js and the worker has
    // sent his message back
    employeeWorker.port.onmessage = function (employees) {
        console.log(employees);
        const employeeList = document.getElementById("employeeList");
        employeeList.innerHTML = "";

        employees.data.forEach(employee => {
            const li = document.createElement("li");
            li.textContent = `Name: ${employee.firstName} ${employee.lastName}, Age: ${employee.age}, Position: ${employee.position}`;
            employeeList.appendChild(li);
        });
    }

    // send a request to the worker, which sends back the employee array.
    // this is necessary because the website does not have access to the this
    // array immediately when a new tab is opened, it has to be requested.
    // otherwise, you'd have to click the button at least once to add a new employee
    // and receive the employee array back to display all the employees.
    employeeWorker.port.postMessage("request");
}
