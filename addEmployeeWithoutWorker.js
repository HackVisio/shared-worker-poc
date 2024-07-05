// Array to store employee data
let employees = [];

const addEmployeeButton = document.getElementById("addEmployeeButtonNoWorker")

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

    // Add employee object to the array
    employees.push(employee);

    // Update the displayed employee list
    displayEmployees();

    // Clear the form
    document.getElementById("employeeForm").reset();
}

addEmployeeButton.onclick = addEmployee;

function displayEmployees() {
    console.log(employees);
    const employeeList = document.getElementById("employeeList");
    employeeList.innerHTML = "";

    employees.forEach(employee => {
        const li = document.createElement("li");
        li.textContent = `Name: ${employee.firstName} ${employee.lastName}, Age: ${employee.age}, Position: ${employee.position}`;
        employeeList.appendChild(li);
    });
}
