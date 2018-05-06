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
	} else if function == "ac_trade_setup" {									//create a new user
		return t.ac_trade_setup(stub, args)
	} else if function == "ac_benchmark" {									//create a new user
		return t.ac_benchmark(stub, args)
	} else if function == "benchmarks" {									//create a new user
		return t.benchmarks(stub, args)
	} else if function == "check_decide" {									//create a new user
		return t.check_decide(stub, args)
	} else if function == "readOnly" {
	    return t.read(stub, args)
	} else if function == "get_account" {
	    return t.get_account(stub, args)
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
	name := strings.(args[1])
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
		return nil, err.Error()
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

// ============================================================================================================================
// create a new user
// ============================================================================================================================
func (t *SimpleChaincode) create_account(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	
	fmt.Println("- start create user")
	
	newaccount := Account{}
	newaccount.Ac_id = args[0]				
	newaccount.Ac_short_name = args[1]
	newaccount.Status = args[2]
	newaccount.Term_date = args[3]
	newaccount.Inception_date = args[4]
    newaccount.Ac_region  = args[5]
	newaccount.Ac_sub_region = args[6]
	newaccount.Cod_country_domicile = args[7]
	newaccount.Liq_method  = args[8]
	newaccount.Contracting_entity = args[9]
	newaccount.Mgn_entity = args[10]
    	newaccount.Ac_legal_name = args[11]
	newaccount.Manager_name = args[12]
	newaccount.Cod_ccy_base = args[13]
	newaccount.Long_name = args[14]
	newaccount.Mandate_id = args[15]
	newaccount.Client_id = args[16]
	newaccount.Custodian_name = args[17]
    	newaccount.Sub_mandate_id = args[18]
	newaccount.Transfer_agent_name = args[19]
	newaccount.Trust_bank = args[20]
	newaccount.Re_trust_bank = args[21]
    	newaccount.Last_updated_by = args[22]
	newaccount.Last_approved_by = args[23]
	newaccount.Last_update_date = args[24]
	newaccount.Hash = args[25]
	
	acJson, err := stub.GetState(accountStr)
	fmt.Println(acJson)
	if err != nil {
		return nil, err
	}
	
	json.Unmarshal(acJson, &tmp_account)
	str_newac, _ := json.Marshal(newaccount)
	tmp_account=append(tmp_account, string(str_newac))
	jsonAsBytes, _ := json.Marshal(tmp_account)
	err = stub.PutState(accountStr, jsonAsBytes)	
	
	fmt.Println("- end create user")
	return nil, nil
}

func (t *SimpleChaincode) ac_trade_setup(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	
	fmt.Println("- start create user")
	
	newaccount := Ac_trades_setup{}
	newaccount.Ac_id = args[0]				
	newaccount.Lvts = args[1]
	newaccount.Calypso = args[2]
	newaccount.Aladdin = args[3]
	newaccount.Trade_start_date = args[4]
    newaccount.Equity = args[5]
	newaccount.Fixed_income = args[6]
	newaccount.Hash = args[7]
	
	acJson, err := stub.GetState(actradeStr)
	if err != nil {
		return nil, err
	}
	
	json.Unmarshal(acJson, &tmp_tradeset)
	str_newtra, _ := json.Marshal(newaccount)
	
	tmp_allacben=append(tmp_allacben, string(str_newtra))
	jsonAsBytes, _ := json.Marshal(tmp_allacben)
	err = stub.PutState(actradeStr, jsonAsBytes)	
	
	fmt.Println("- end create user")
	return nil, nil
}

func (t *SimpleChaincode) ac_benchmark(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	
	fmt.Println("- start create user")
	
	newaccount := Ac_benchmark{}
	newaccount.Ac_id = args[0]				
	newaccount.Benchmark_id = args[1]
	newaccount.Source = args[2]
	newaccount.Name = args[3]
	newaccount.Currency = args[4]
    newaccount.Primary_flag  = args[5]
	newaccount.Start_date = args[6]
	newaccount.End_date = args[7]
	newaccount.Benchmark_reference_id  = args[8]
	newaccount.Benchmark_reference_id_source = args[9]
	newaccount.Hash = args[10]

	
	acJson, err := stub.GetState(acbenchStr)
	if err != nil {
		return nil, err
	}
	
	json.Unmarshal(acJson, &tmp_allacben)
	str_newacben, _ := json.Marshal(newaccount)
	
	tmp_allacben=append(tmp_allacben, string(str_newacben))
	jsonAsBytes, _ := json.Marshal(tmp_allacben)
	err = stub.PutState(acbenchStr, jsonAsBytes)	
	
	fmt.Println("- end create user")
	return nil, nil
}

func (t *SimpleChaincode) benchmarks(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	
	fmt.Println("- start create user")
	
	newaccount := Benchmarks{}
	newaccount.Benchmark_id = args[0]				
	newaccount.Id_source = args[1]
	newaccount.Name = args[2]
	newaccount.Currency = args[3]
	newaccount.Benchmark_reference_id = args[4]
    newaccount.Benchmark_reference_id_source  = args[5]
	newaccount.Hash = args[6]

	acJson, err := stub.GetState(benchStr)
	if err != nil {
		return nil, err
	}
	
	json.Unmarshal(acJson, &tmp_allbench)
	str_newbench, _ := json.Marshal(newaccount)
	tmp_allbench=append(tmp_allbench, string(str_newbench))
	jsonAsBytes, _ := json.Marshal(tmp_allbench)
	err = stub.PutState(benchStr, jsonAsBytes)	
	
	fmt.Println("- end create user")
	return nil, nil
}

// can not use
func (t *SimpleChaincode) get_account(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
    fmt.Println("- start get account from blockchain")
    acJson, err := stub.GetState("_acIndex")
    fmt.Println(acJson)
    if err != nil {
        fmt.Println("-- ERROR-- ")
        fmt.Println(err)
    	return nil, err
    }
    fmt.Println("- end create user")
    return acJson, nil
}

func (t *SimpleChaincode) check_decide(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	 var empty []string
	 var tmpAllStr []byte
	 
	 jsonAsBytes, err:= json.Marshal(empty)
        if err != nil {
		    return nil, err
	      }	 
	 switch args[0] {
	  case "Account":
	     acJson, err := stub.GetState(accountStr)
	     if err != nil {
		    return nil, err
	      }
	   
	    err = stub.PutState(accountStr, jsonAsBytes)	
		 if args[1]=="accept"  {
		   allAcJson, _ := stub.GetState(store_account)
		   json.Unmarshal(allAcJson, &hold_account)
		   hold_account=append(hold_account, string(acJson))
		   jsonAsBytes, _ = json.Marshal(hold_account)
		   err = stub.PutState(store_account, jsonAsBytes)
		   
		   tmpAllStr, _ = stub.GetState(allStr)
		   json.Unmarshal(tmpAllStr, &allrecords)
		   
		   allrecords=append(allrecords, string(acJson))
		    jsonAsBytes, _ = json.Marshal(allrecords)
			err = stub.PutState(allStr, jsonAsBytes)
		 }
		 
	 case "Ac_trades_setup":
	     acJson2, err:= stub.GetState(actradeStr)
		   if err != nil {
		    return nil, err
	      }
		 jsonAsBytes, err = json.Marshal(empty)	
	    
	     err = stub.PutState(actradeStr, jsonAsBytes)	
		 if args[1]=="accept"  {
		   actradeJson, _ := stub.GetState(store_actrade)
		   json.Unmarshal(actradeJson, &hold_actrade)
		   hold_actrade=append(hold_actrade, string(acJson2))
		   jsonAsBytes, _ := json.Marshal(hold_account)
		   err = stub.PutState(store_actrade, jsonAsBytes)
		   
		    tmpAllStr, err = stub.GetState(allStr)
		   json.Unmarshal(tmpAllStr, &allrecords)
		   allrecords=append(allrecords, string(acJson2))
		    jsonAsBytes, err = json.Marshal(allrecords)
			err = stub.PutState(allStr, jsonAsBytes)
		 }
		
	 case "Ac_benchmark":
	     acJson3, err:= stub.GetState(acbenchStr)
		   if err != nil {
		    return nil, err
	      }
		 jsonAsBytes, err = json.Marshal(empty)	
	   
	      err = stub.PutState(acbenchStr, jsonAsBytes)
		 if args[1]=="accept" {
		   acbenJson, _ := stub.GetState(store_acbench)
		   json.Unmarshal(acbenJson, &hold_acbench)
		   hold_acbench=append(hold_acbench, string(acJson3))
		   jsonAsBytes, _ := json.Marshal(hold_acbench)
		   err = stub.PutState(store_acbench, jsonAsBytes)
		 
		    tmpAllStr, err = stub.GetState(allStr)
		   json.Unmarshal(tmpAllStr, &allrecords)
		   allrecords=append(allrecords, string(acJson3))
		    jsonAsBytes, err = json.Marshal(allrecords)
			err = stub.PutState(allStr, jsonAsBytes)
		 }
		 
	case "Benchmarks":
	     acJson4, err := stub.GetState(benchStr)
		 jsonAsBytes, _ = json.Marshal(empty)	
	     if err != nil {
		    return nil, err
	      }
	
	     err = stub.PutState(benchStr, jsonAsBytes)	
		 if args[1]=="accept" {
		   benJson, _ := stub.GetState(store_bench)
		   json.Unmarshal(benJson, &hold_benchmark)
		   hold_benchmark=append(hold_benchmark, string(acJson4))
		   jsonAsBytes, _ := json.Marshal(hold_benchmark)
		   err = stub.PutState(store_bench, jsonAsBytes)
		 
		    tmpAllStr, err = stub.GetState(allStr)
		   json.Unmarshal(tmpAllStr, &allrecords)
		   allrecords=append(allrecords, string(acJson4))
		    jsonAsBytes, _ = json.Marshal(allrecords)
			err = stub.PutState(allStr, jsonAsBytes)
		 }
	
	}
	fmt.Println("- end checker")
	return nil, nil
	
}


