const JIG = "jig";
const INPUTS = "inputFields";
var selectedJig = '';
var chart;


//get the saved value function - return the value of "v" from localStorage. 
function getSavedValue(tag) {
    if (!localStorage.getItem(tag)) {
        return '';// You can change this to your defualt value. 
    }
    return localStorage.getItem(tag);
}

function execute(event, endpoint) {
    /**
     * Parse input values upon clicking button.
     * @param {*} event - Event being button clicked.
     * endpoint {string} endpoint - Endpoint of controller server.
     */

    event.preventDefault();
    var inputElements = document.querySelectorAll("input");
    console.log(inputElements);

    for (var i = 0; i < inputElements.length; i++) {
        saveValue(inputElements[i]);
    }

    var ip_ending_value = document.getElementById(JIG).options[document.getElementById(JIG).selectedIndex].value;
    var exp_params = parse(inputElements, ip_ending_value);
    console.log("sending...")
    send(payload = exp_params, endpoint = endpoint, onload_fn = onload_figure);
    console.log("sent!")
};

function execute_kill(event, endpoint) {

    event.preventDefault();
    var inputElements = document.querySelectorAll("input");
    console.log(inputElements);

    for (var i = 0; i < inputElements.length; i++) {
        saveValue(inputElements[i]);
    }

    var ip_ending_value = document.getElementById(JIG).options[document.getElementById(JIG).selectedIndex].value;
    var exp_params = parse(inputElements, ip_ending_value);
    console.log("sending...")
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';

    xhr.open("POST", "/stop", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onload = function() {
        if (xhr.status == 200) {
            var resp = xhr.response;
            console.log("respond", resp);


            if (resp == "Not_started"){
                console.log("nay");
                var banner = document.getElementById('banner'); 
                banner.innerText = 'Jig is not in use';
                banner.style.backgroundColor = 'red';  // Optional: style the banner
            }
            
            else if (resp == "2") {
                console.log("yay");
                var banner = document.getElementById('banner'); 
                banner.innerText = 'Experiment stopped successfully';
                banner.style.backgroundColor = 'green';  // Optional: style the banner
                send(payload = exp_params, endpoint = endpoint, onload_fn = onload_figure);
            }
            else {
                console.log("nay");
                var banner = document.getElementById('banner'); 
                banner.innerText = `Error ${resp}`;
                banner.style.backgroundColor = 'red';  // Optional: style the banner 
            }
        }else {
            console.log('Error with status code ' + xhr.status);
        }
    
    };
    xhr.onerror = function() {
        console.log('Network error');
    };
        
    xhr.send(JSON.stringify(exp_params));
    
    console.log("sent!")



}

function execute_pulse(event, endpoint){
    event.preventDefault();
    var inputElements = document.querySelectorAll("input");
    console.log(inputElements);

    for (var i = 0; i < inputElements.length; i++) {
        saveValue(inputElements[i]);
    }

    var ip_ending_value = document.getElementById(JIG).options[document.getElementById(JIG).selectedIndex].value;
    var exp_params = parse(inputElements, ip_ending_value);
    console.log("sending...")

    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';

    xhr.open("POST", "/pulse", true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = function() {
        if (xhr.status == 200) {
            var resp = xhr.response;
            console.log("respond", resp);


            if (resp == "jig_used"){
                console.log("nay");
                var banner = document.getElementById('banner'); 
                banner.innerText = 'Jig is used';
                banner.style.backgroundColor = 'red';  // Optional: style the banner
            }
            
            else {
                console.log("yay");
                var banner = document.getElementById('banner'); 
                banner.innerText = 'great success!';
                banner.style.backgroundColor = 'green';  // Optional: style the banner
                send(payload = exp_params, endpoint = endpoint, onload_fn = onload_figure);
            }
        }else {
            console.log('Error with status code ' + xhr.status);
        }
    
    };
    xhr.onerror = function() {
        console.log('Network error');
    };
        
    xhr.send(JSON.stringify(exp_params));
   

    
}

function execute_start(event, endpoint) {
    

    event.preventDefault();
    var inputElements = document.querySelectorAll("input");
    console.log(inputElements);

    for (var i = 0; i < inputElements.length; i++) {
        saveValue(inputElements[i]);
    }

    var ip_ending_value = document.getElementById(JIG).options[document.getElementById(JIG).selectedIndex].value;
    var exp_params = parse(inputElements, ip_ending_value);
    console.log("sending...")

    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';

    xhr.open("POST", "/start", true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = function() {
        if (xhr.status == 200) {
            var resp = xhr.response;
            console.log("respond", resp);


            if (resp == "1"){
                console.log("Yay");
                var banner = document.getElementById('banner'); 
                banner.innerText = 'Experiment started successfully';
                banner.style.backgroundColor = 'green';  // Optional: style the banner
            }
            else if (resp == "jig_used") {
                console.log("experiment is already on");
                var banner = document.getElementById('banner'); 
                banner.innerText = 'Experiment is running';
                banner.style.backgroundColor = 'red';  // Optional: style the banner
            }
            else if (resp == "ERR"){
                console.log("An error has occured");
                var banner = document.getElementById('banner'); 
                banner.innerText = 'Error';
                banner.style.backgroundColor = 'red';  // Optional: style the banner
            }
            else {
                console.log("Unkown error")             
            }
        }else {
            console.log('Error with status code ' + xhr.status);
        }
    
    };
    xhr.onerror = function() {
        console.log('Network error');
    };
        
    xhr.send(JSON.stringify(exp_params));
   

   
}


function getJigStatus() {
    selectedJig = document.getElementById(JIG).value;
    send(payload = selectedJig, endpoint = "status", onload_fn = onload_status);
};

function setStatusPage() {

}
function linspace(start, end, n) {
    const step = (end - start) / (n - 1);
    return Array.from({ length: n }, (_, i) => start + step * i);
}


function onload_figure(xhr) {
    if (xhr.status === 200 && xhr.response["amps"][0] != null) {
        var waveform = xhr.response["amps"][0];
        var time_array = linspace(start = 10, end = 20, n = waveform.length);

        // Remove existing canvas
        document.getElementById('figure').remove();

        // Create a new canvas
        var canvas = document.createElement('canvas');
        canvas.id = 'figure';
        document.body.appendChild(canvas);

        const figDiv = document.getElementById('figure').getContext('2d');
        
        chart = plot(figDiv, time_array, waveform);
    }
}

function onload_status(xhr) {
    if (xhr.status === 200) {
        var status = xhr.response["status"];
        var statusDiv = document.getElementById('status');
        statusDiv.innerHTML = `${selectedJig} jig status: ${status}`;
    }
}


function parse(inputElements, ip_ending_value) {
    var exp_params = {};

    for (var i = 0; i < inputElements.length; i++) {
        var input = inputElements[i];
        exp_params[input.id] = input.value;
    }
    exp_params[JIG] = ip_ending_value;

    return exp_params;
}


function persist() {
    var inputElements = document.querySelectorAll("input");
    selectedJig = document.getElementById(JIG).value;

    for (var i = 0; i < inputElements.length; i++) {
        var input = inputElements[i];
        var tag = selectedJig.concat('.', input.id);
        val = getSavedValue(tag);    // set the value to this input
        // console.log(val);
        document.getElementById(input.id).value = val
        // document.getElementById(input.id).value = getSavedValue(tag);    // set the value to this input
    }
}


function plot(figDiv, time_array, waveform) {
    // fetch('path/to/your/data.json')
    //     .then(response => response.json())
    //     .then(data => {
    // Extract the values from the JSON data
    // const waveform = data.values;

    // Create a chart using Chart.js
    new Chart(figDiv, {
        type: 'line',
        data: {
            labels: time_array,
            datasets: [
                {
                    label: 'Waveform',
                    data: waveform,
                    pointRadius: 0,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (us)'
                    },
                    ticks: {
                        callback: function (value, index) {
                            // Customize the tick values as needed
                            // Example: Show only every 2nd tick
                            return index % 50 === 0 ? this.getLabelForValue(value) : '';
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Voltage (V)'
                    }
                }
            }
        }
    });
}


function saveValue(inputElement) {
    /**
     * Docstring
     */
    var id = selectedJig.concat('.', inputElement.id);  // get the sender's id to save it . 
    var val = inputElement.value; // get the value. 
    localStorage.setItem(id, val);// Every time user writing something, the localStorage's value will override . 
}


function send(payload, endpoint, onload_fn) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';

    xhr.open("POST", `/${endpoint}`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        onload_fn(xhr);
    };
    xhr.send(JSON.stringify(payload));
    return xhr;
}

function goto_status(event){
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.open("POST", "/status_page", true);
    xhr.send();
}

function toggleinputfields() {
    selectedjignew = document.getElementById(JIG);

    if (selectedjignew === selectedJig) {
        return;
    }

    selectedjig = selectedjignew;
    document.getElementById("figure").innerhtml = "";
    
}

window.onload = function () {
    /**
     * listen to buttons and act upon them being clicked.
     */// call toggleinputfields on initial load
    
    document.getElementById(JIG).addEventListener("change", function () {
        // getjigstatus();
        toggleinputfields();
        persist();
    });

    document.getElementById("pulse").addEventListener("click", function (event) {
        execute_pulse(event, "pulse");
    });


    document.getElementById("start").addEventListener("click", function (event) {
        // get confirmation
        execute_start(event, "start");
    });

    document.getElementById("kill").addEventListener("click", function (event) {
        // get confirmation
        if (confirm("Are you sure you want to kill experiment?")) {
        execute_kill(event, "stop");
        }
    });

    document.getElementById("go_status").addEventListener("click", function (event) {
        // get confirmation
        window.location.href = "status_page";
    });
}

