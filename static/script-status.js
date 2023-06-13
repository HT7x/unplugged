
function getJigStatus() {
    selectedJig = document.getElementById(JIG).value;
    send(payload = selectedJig, endpoint = "status", onload_fn = onload_status);
};



function send(payload, endpoint, onload_fn) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';

    xhr.open("POST", `/${endpoint}`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        onload_fn(xhr);
    };
    xhr.send(JSON.stringify(payload));
}


window.onload = function() {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.open("POST", "/status", true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = function() {
        if (xhr.status == 200) {
            var data = xhr.response;
            console.log(data);

            var table = document.getElementById('dataTable');
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    // Create new table row (tr) element
                    var tr = document.createElement('tr');

                    // Create new table data (td) element for the key
                    var td1 = document.createElement('td');
                    td1.textContent = key;

                    // Create new table data (td) element for the value
                    var td2 = document.createElement('td');
                    td2.textContent = data[key][0];

                    var td3 = document.createElement('td');
                    td3.textContent = data[key][1];

                    // Append the td elements to the tr
                    tr.appendChild(td1);
                    tr.appendChild(td2);
                    tr.appendChild(td3);

                    // Append the tr to the table
                    table.appendChild(tr);
                }
            }
        }
    };

    xhr.onerror = function() {
        console.error('An error occurred during the transaction');
    };

    xhr.send();
};










    // var url = "http://example.com";

    // var xhr = new XMLHttpRequest();

    // xhr.open('GET', url, true);

    // xhr.onload = function() {
    //     if (this.status === 200) {

            // var responseText = `[
            //     {
            //     "jig": "Jig 1",
            //     "status": "connected",
            //     "lastUpdated": "22 years ago"
            //     },
            //     {
            //     "jig": "Jig 2",
            //     "status": "disconnected",
            //     "lastUpdated": "15 years ago"
            //     }
            // ]`;

        //     var machines = {
        //         "old": "10.251.67.20",
        //         "solid-state": "10.251.67.78",
        //         "bobbin": "10.251.67.218",
        //         "becca": "10.251.67.227",
        //         "controller": "10.251.67.175"
        //     };
           
        //     var port = "5002";

        //     for (var machine in machines) {
        //         send(payload = machine, endpoint = "status", onload_fn = onload_status);
        //     }
            
            

        //         var data = JSON.parse(responseText);
            
        //         console.log(console.log(config.config.zerotier_base_ip));
        //         console.log(data)
    
    
        //         var table = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
    
        //         for (var i = 0; i < data.length; i++) {
        //             var row = table.insertRow();
    
        //             var jigCell = row.insertCell(0);
        //             jigCell.textContent = data[i].jig;
    
        //             var statusCell = row.insertCell(1);
        //             statusCell.textContent = data[i].status;
    
        //             var updatedCell = row.insertCell(2);
        //             updatedCell.textContent = data[i].lastUpdated;
        //         }
        // };

          
    //     } else {
    //         console.error("Failed to load data");
    //     }
    // };

    // xhr.onerror = function() {
    //     console.error("An error occurred");
    // };

    // xhr.send()
