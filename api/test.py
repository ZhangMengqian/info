#    Licensed under the Apache License, Version 2.0 (the "License");
#    you may not use this file except in compliance with the License.
#    You may obtain a copy of the License at

#        http://www.apache.org/licenses/LICENSE-2.0

#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS,
#    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#    See the License for the specific language governing permissions and
#    limitations under the License.

from __future__ import print_function
from hyperledger.client import Client

import base64
import json
import sys
import time

API_URL = 'http://127.0.0.1:7050'


def query_value(chaincode_name, arg_list):
    """
    Query a list of values.

    :param chaincode_name: The name of the chaincode.
    :param arg_list: List of arguments.
    :return: A list of values.
    """
    result, resp = [], {}
    print("Query value will try at most 20 times.")
    for arg in arg_list:
        for i in range(20):
            try:
                resp = c.chaincode_query(chaincode_name=chaincode_name,
                                         function="query",
                                         args=[arg])
                if resp['result']['status'] == 'OK':
                    result.append(resp['result']['message'])
                    break
            except KeyError:
                print("Wait 1 seconds for the {0} query".format(i))
                time.sleep(1)

    return result

def get_data(payload):
    func = ['init', 'delete', 'write', 'create_account','ac_trade_setup', 'ac_benchmark', 'benchmarks', 'check_decide']
    for i in func:
        if(payload.find(i) >= 0):
            return payload[len(i):]
    data = '0'
    return data
# Usage:
# * python test.py [API_URL=http://127.0.0.1:7050] will deploy first
# E.g.,
# "f389486d91f54d1f8775940f24b1d3bd9f8a8e75d364e158ac92328ddacad629607a3c42be156fc4a7da7173adca2ac7d7eef29afc59c6f07f3ad14abee34f68"
if __name__ == '__main__':
    if len(sys.argv) not in [2, 3]:
        print("Usage: python function_test.py ["
              "API_URL=http://127.0.0.1:7050] [chaincode_name]")
        exit()

    API_URL = sys.argv[1]
    chaincode_name = ""
    # chaincode_name = "7be1529ee16969baf9f3156247a0ee8e7eee99a6a0a816776acff65e6e1def71249f4cb1cad5e0f0b60b25dd2a6975efb282741c0e1ecc53fa8c10a9aaa31137"  # noqa
    if len(sys.argv) == 3:
        chaincode_name = sys.argv[2]

    c = Client(base_url=API_URL)

    print("Checking cluster at {}".format(API_URL))

    print(">>>Test: list the peers")
    res = c.peer_list()
    print(json.dumps(res, sort_keys=True, indent=4))
    assert len(res['peers']) > 0

    print(">>>Test: list the chain")
    chain_status = c.chain_list()
    print(json.dumps(chain_status, sort_keys=True, indent=4))
    assert chain_status['height'] > 0
    print("Existing block number = {0}".format(chain_status["height"]))

    for i in range (1,chain_status['height']):
        res = c.block_get(block=str(i))
        if(res.get('transactions')):
            print(">>>Test: get the content of block :",i)
            # print(json.dumps(res, sort_keys=True, indent=4))
            transactions = res['transactions']
            transactions =  json.dumps(transactions, sort_keys=True, indent=4)
            chaincodeID_start = transactions.find('chaincodeID')
            chaincodeID_end = transactions.find(',',chaincodeID_start)
            chaincodeID=transactions[chaincodeID_start+15:chaincodeID_end-1]
            # print (chaincodeID)
            type_start = transactions.find('type')
            t_type = transactions[type_start+7:type_start+8]
            # print (t_type)
            payload_start = transactions.find('payload')
            payload_end = transactions.find(',',payload_start)
            payload = transactions[payload_start+11:payload_end-1]
            payload = base64.b64decode(payload)
            print(payload)
            data = get_data(payload)
            print(data)
            # print(transactions)


