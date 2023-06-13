from dataclasses import dataclass
import json
import logging

from flask import Flask, request, render_template, jsonify
import requests
import time

import config
import utils


@dataclass
class Server:
    zerotier_base_ip: str
    local_ip: str
    port: int
    remote_ip_endings: list[int]
    controller_port: int


server: Server = utils.dataclass_from_dict(dataclass_=Server, dict_=config.config)
app = Flask(__name__)


def make_url(ip_ending: str, endpoint: str) -> str:
    return f'http://{server.zerotier_base_ip}.{ip_ending}:{server.controller_port}/{endpoint}'


def execute(endpoint: str):
    exp_params: dict = request.get_json()
    print("params", exp_params)
    logging.info(exp_params)
    url = make_url(ip_ending=config.machines[exp_params['jig']], endpoint=endpoint)
    print("url: ", url)
    response = requests.post(url=url, data=exp_params).text
    print("response: ", response)
    return response

def execute_kill(endpoint: str):
    exp_params: dict = request.get_json()
    print("params", exp_params)
    logging.info(exp_params)
    url = make_url(ip_ending=config.machines[exp_params['jig']], endpoint=endpoint)
    print("url: ", url)
    response = requests.get(url=url).text
    print("response: ", response)
    return response

def execute_pulse(endpoint: str):
    exp_params: dict = request.get_json()
    print("params", exp_params)

    #make sure the jig is not being used 
    pulse_jig = exp_params['jig']
    url = make_url(
        ip_ending=config.machines[pulse_jig],
        endpoint=config.endpoints['get jig status'])  
    response_status = requests.get(url=url, timeout=1).text
    time.sleep(1)
    if response_status == "0" or response_status == "2":
        logging.info(exp_params)
        url = make_url(ip_ending=config.machines[exp_params['jig']], endpoint=endpoint)
        print("url: ", url)
        response = requests.post(url=url, data=exp_params).text
        print("response: ", response)
        return response
    else:
        return "Jig is currently being used"

def get_status():
    returned = [] 
    jigs = config.machines.keys()

    for jig in jigs:
        url = make_url(
        ip_ending=config.machines[jig],
        endpoint=config.endpoints['get jig status']) 
        response = requests.get(url=url).text
        print(response) 
        returned.append(response)



@app.route('/')
def index():
    return render_template('index.html', jigs=config.machines.keys())

@app.route('/status_page')
def status_page():
    return render_template('status.html', jigs=config.machines.keys())

@app.route('/pulse', methods=['POST'])
def get_wave():
    print("bad")

    return execute_pulse(endpoint=config.endpoints['single pulse'])


@app.route('/start', methods=['POST'])
def calculate():
    print("good")
    return execute(endpoint=config.endpoints['run experiment'])

@app.route('/stop', methods=['POST'])
def end(): 
    print("Hey")
    return execute_kill(endpoint=config.endpoints['stop experiment'])


@app.route('/status', methods=['POST'])
def setStatusPage():
    returned = {}
    jigs = config.machines.keys()
    # jigs = ["controller"]

    for jig in jigs:
        print(jig)
        if jig not in returned:
            returned[jig] = []

        url = make_url(
        ip_ending=config.machines[jig],
        endpoint=config.endpoints['get jig status']) 
        
        try:
            response = requests.get(url=url, timeout=1).text
            
            print(response) 
            returned[jig].append(response)

            # last_updated
            url2 = make_url(
            ip_ending=config.machines[jig],
            endpoint=config.endpoints['get last update']) 

            try:
                response2 = requests.get(url=url2, timeout=1).text
                print(response2)
                if response2 == "-1.0":
                   returned[jig].append("Has not been updated")
                else: 
                    returned[jig].append(int(time.time() - float(response2)))
            

            except Exception as d:
                returned[jig] = "No Connection"
                print("An error occurred:", d)
                

            print(returned)
          
        except Exception as e:
            # Continue execution after catching any exception
            returned[jig].append("No Connection")
            returned[jig].append("No Connection")

            print("An error occurred:", e)

        
    return returned

if __name__ == '__main__':
    app.run(host=server.local_ip, port=server.port, debug=True)