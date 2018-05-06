package main

import (
	"errors"
	"fmt"
	"strconv"
	"encoding/json"
	"github.com/hyperledger/fabric/core/chaincode/shim"
)

// SimpleChaincode example simple Chaincode implementation
type SimpleChaincode struct {
}

// ============================================================================================================================
// Asset Definitions - The ledger will store marbles and owners
// ============================================================================================================================

// ----- Product ----- //
type Product struct {
	ObjectType  string        `json:"docType"` //field for couchdb
	Id          string        `json:"id"`      //the fieldtags are needed to keep case from bouncing around
	Pro_name    string        `json:"pro_name"`
	Pro_num     int           `json:"pro_num"`
	Left_num    int           `json:"left_num"`
    Pro_price   int           `json:"pro_price"`
    Pro_desc    string        `json:"pro_desc"`
	Create_time    string     `json:"create_time"`
	Flag        int           `json:"flag"`
}

// ----- Owners ----- //
type Owner struct {
	ObjectType string `json:"docType"`     //field for couchdb
	Username   string `json:"username"`     // key
	Password   string `json:"password"`
	Type       int    `json:"type"`
}

// ----- Trading ----- //
type Trading struct {
	ObjectType string `json:"docType"`     //field for couchdb
	Id         string `json:"id"`
	Buyer      string `json:"buyer"`
	Pro_id     int    `json:"pro_id"`
	City       string `json:"city"`
	Trading_time      string `json:"trading_time"`
	Flag       int    `json:"flag"`
	Transtime  string `json:"transtime"`
}

// ============================================================================================================================
// Main
// ============================================================================================================================
func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
}


// ============================================================================================================================
// Init - reset all the things
// ============================================================================================================================
func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	var Aval int
	var err error

	if len(args) != 1 {
		return nil, errors.New("Incorrect number of arguments. Expecting 1")
	}

	// Initialize the chaincode
	Aval, err = strconv.Atoi(args[0])
	if err != nil {
		return nil, errors.New("Expecting integer value for asset holding")
	}

	// Write the state to the ledger
	err = stub.PutState("abc", []byte(strconv.Itoa(Aval)))				//making a test var "abc", I find it handy to read/write to it right away to test the network
	if err != nil {
		return nil, err
	}

	return nil, nil
}

// ============================================================================================================================
// Run - Our entry point for Invocations - [LEGACY] obc-peer 4/25/2016
// ============================================================================================================================
func (t *SimpleChaincode) Run(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	fmt.Println("run is running " + function)
	return t.Invoke(stub, function, args)
}

// ============================================================================================================================
// Invoke - Our entry point for Invocations
// ============================================================================================================================
func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	fmt.Println("invoke is running " + function)

	// Handle different functions
	if function == "init" {													//initialize the chaincode state, used as reset
		return t.Init(stub, "init", args)
	} else if function == "delete" {										//deletes an entity from its state
		res, err := t.Delete(stub, args)
		return res, err
	} else if function == "write" {											//writes a value to the chaincode state
		return t.Write(stub, args)
	} else if function == "createPro" {									//create a new product
		return t.init_product(stub, args)
	}
	fmt.Println("invoke did not find func: " + function)					//error

	return nil, errors.New("Received unknown function invocation")
}

// ============================================================================================================================
// Init Product - create a new marble, store into chaincode state
//
// Shows off building a key's JSON value manually
//
//	ObjectType, Id, Pro_name, Pro_num, Left_num, Pro_price, Pro_desc, Create_time, Flag
//
// Inputs - Array of strings
//      0      ,    1  ,     2  ,      3          ,       4
//     id      ,  pro_name, pro_num,  pro_price    ,  pro_desc
// ============================================================================================================================
func (t *SimpleChaincode) init_product(stub shim.ChaincodeStubInterface, args []string) ([]byte, error){
	var err error
	fmt.Println("starting init_product")

	if len(args) != 6 {
	    return nil, errors.New("Incorrect number of arguments. Expecting 6")
	}

	id := args[0]
	name := args[1]
	num := args[2]
	price := args[3]
	desc := args[4]
    time := args[5]

	//build the product json string manually
	str := `{
		"docType": "product",
		"id": "` + id + `",
		"pro_name": "` + name + `",
		"pro_num": "` + num + `",
		"left_num": "` + num + `",
		"pro_price": "` + price + `",
		"pro_desc": "` + desc + `",
		"create_time": "` + time + `",
        "flag": 1
	}`
	err = stub.PutState(id, []byte(str))                         //store product with id as key
	if err != nil {
		jsonResp := "{\"Error\":\"Failed to init product \"}"
        return nil, errors.New(jsonResp)
	}

	fmt.Println("- end init_product")
	return nil, nil

}





// ============================================================================================================================
// Query - Our entry point for Queries
// ============================================================================================================================
func (t *SimpleChaincode) Query(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	fmt.Println("query is running " + function)

	// Handle different functions
	if function == "read" {													//read a variable
		return t.read(stub, args)
	}
	fmt.Println("query did not find func: " + function)						//error

	return nil, errors.New("Received unknown function query")
}

// ============================================================================================================================
// Read - read a variable from chaincode state
// ============================================================================================================================
func (t *SimpleChaincode) read(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	var name, jsonResp string
	var err error
	fmt.Println("-----------------------------starting read------------------------------")

	if len(args) != 1 {
		return nil, errors.New("Incorrect number of arguments. Expecting name of the var to query")
	}

	name = args[0]
	valAsbytes, err := stub.GetState(name)									//get the var from chaincode state
	if err != nil {
		jsonResp = "{\"Error\":\"Failed to get state for " + name + "\"}"
		return nil, errors.New(jsonResp)
	}

    fmt.Println("-----------------------------end read------------------------------")
	return valAsbytes, nil													//send it onward
}

// ============================================================================================================================
// Delete - remove a key/value pair from state
// ============================================================================================================================
func (t *SimpleChaincode) Delete(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	
	return nil, nil
}

// ============================================================================================================================
// Write - write variable into chaincode state
// ============================================================================================================================
func (t *SimpleChaincode) Write(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	var name, value string // Entities
	var err error
	fmt.Println("running write()")

	if len(args) != 2 {
		return nil, errors.New("Incorrect number of arguments. Expecting 2. name of the variable and value to set")
	}

	name = args[0]															//rename for funsies
	value = args[1]
	err = stub.PutState(name, []byte(value))								//write the variable into the chaincode state
	if err != nil {
		return nil, err
	}
	return nil, nil
}


