# shared-worker-poc

Quick and dirty proof of concept of using shared workers. For a more detailed description of how everything works, see below.

**Note that this does not work when simply opening the index.html file in the Browser, you need to run a live version of this. The simplest way is to use the Live Server Extension in VSCode &rarr; right-click index.html and open with Live Server in VSCode**

*tl;dr:*

1. *create worker.js, add port, add onconnect, add onmessage*
2. *in separate .js file, check for SharedWorkerAPI, gain access to worker with new SharedWorker("worker.js"), send messages with postMessage and listen with onmessage*
3. *????*
4. *Profit*

## index.html

Pretty basic, contains a form where you can enter name, age, and position of an employee. After pressing the submit button, this data is then displayed in a list below the button.

## worker.js

Defines the worker, which is used in addEmployee.js.

We first have to get the port to send/receive messages from, which is done with ```const port = event.ports[0];```. A stackoverflow comment suggests you have to store all open ports to send messages to multiple tabs, see also the corresponding comment in worker.js. However, this was not necessary during preliminary testing.

The onmessage function defines what the worker should do when it receives a message. In this case, it does two things:

1. Deal with a "request". When a new tab is opened, the employee list is not displayed by default, because only the SharedWorker has this list. Therefore, on new tab open, a message is sent to the worker from addEmployee ```employeeWorker.port.postMessage("request");```. When the worker receives the message with data "request", it simply sends over the current employee array. This can then used to display the employees when a new tab is opened. Note that leaving out the request would still synchronise across multiple tabs, you'd simply have to submit a new employee to the list, at which point all previously added employees would be displayed at once.
2. Deal with adding a new employee to the array. In addEmployee, the data from the form is aggregated into an object and sent to the worker ```employeeWorker.port.postMessage(employee);```. The worker adds this to the employees array and sends the new employee array via ```port.postMessage(employees);```. This message is received in addEmployee.js, see below.

Note that refreshing when you only have one tab deletes all data (using the localStorage API or similar would be necessary for persistent state in this scenario).

## addEmployee.js

Deals with the form and displays the employees.

We check for the existence of the SharedWorker API within the current browser right at the beginning with ```if (!!window.SharedWorker)```. The use of double exclamation here is not entirely clear to me atm, but the official Mozilla example (linked from the [documentation page](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker)) does it too.

We then create a new worker with ```const employeeWorker = new SharedWorker("worker.js");```. This worker sends ```employeeWorker.port.postMessage(employee);```and receives ```employeeWorker.port.onmessage ``` messages to ensure persistence across multiple tabs. The onmessage function displays the employees in the ul-element once the worker sends them back.

## addEmployeeWithoutWorker.js

Used for quick testing to rule out saving via local caches etc. Added for the sake of completeness.
