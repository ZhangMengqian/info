# Steps to set the environment:

# 1. 
  Install native Docker for Windows: https://docs.docker.com/docker-for-windows/install/
  Notice: The current version of Docker for Windows runs on 64bit Windows 10 Pro, Enterprise and Education (1511 November update, Build 10586 or later). Do not use Docker Toolbox because there are some problems when it runs with the blockchain.
# 2. 
  Pull the Fabric images from Docker Hub (execute these 2 commands in command window):  

```
  docker pull hyperledger/fabric-peer:x86_64-1.0.1
  docker pull hyperledger/fabric-membersrvc:latest
```  
  Then you can use “docker images” command to check whether you can see “hyperledger/fabric-peer” and “hyperledger/fabric-membersrvc” images. If you see these two images, you can go on to the next step.
# 3. 
  Add an environment variable “CORE_VM_ENDPOINT” with the value of “unix:///var/run/docker.sock” or “127.0.0.1:2375” (both of these two values would work so you can select one) for Windows.
  Add an environment variable “CORE_PEER_ID” with the value of “vp0”.
# 4. 
  Download Git if it is not in your computer: https://git-scm.com/downloads
  You can use “git version” command to check whether Git is successfully installed. You may see something like “git version 2.9.0.windows.1”.
# 5. 
  Download Go if it is not in your computer: https://golang.org/dl/#go1.6.3 
  Select “go1.6.3.windows-amd64.msi”. After you install it, create your desired workspace directory for Go and add an environment variable “GOPATH” with the value of this directory (such as “D:\gopath”).
  You can use “go version” command to check whether Go is successfully installed.
# 6. 
  Put the hyperledger fabric into your work directory: 
  “mkdir -p $GOPATH/src/github.com/hyperledger” (if you cannot use “mkdir -p” command in Windows, you can manually create these folders in your computer)

```
   d:enter the disk where directory is first
   cd $GOPATH/src/github.com/hyperledger
   git clone -b v0.6 http://gerrit.hyperledger.org/r/fabric
```

# 7. 
   Download node.js: https://nodejs.org/en/download/
   When node.js is installed, npm is also installed. You can use “node -v” and “npm -v” commands to check whether they are successfully installed.
# 8. 
   Download my demo project for the blockchain (which is rewritten based on IBM Blockchain demo) in your desired directory:
```
   git clone https://github.com/ZhangMengqian/marbles.git
```
# 9. 
   Set the environment in your desired directory: 
```  
   git clone https://github.com/IBM-Blockchain/fabric-images.git
   cd fabric-images/docker-compose
   setenv.sh
   docker-compose -f single-peer-ca.yaml up
```
   After these steps you can click http://localhost:7050/chain . If you see some codes in json like this then the environment is fine (the contents will not be exactly the same):
```
{
	"height": 1,
	"currentBlockHash": "lJ5dfqGBmhpkn1yHgbpbLnK9GEzrzsAnCm0AJZCIr0GaYznWDCt7j9yC09fGUe2MNXS+HEooKBbajHb+T40kIg==",
	"previousBlockHash": "UYTfnosVy6PqW59Gs4roQTLZ5av/t8sMrkWDKetAwFzoueZ3SkIcW6qPVLQPHuxCJO17AxLYsjzmYNN1fNtwFg=="
} 
```
   When you ran “docker-compose -f single-peer-ca.yaml up” command, if you see the error message like “ARCH_TAG” is not set and “manifest for ibmblockchain/fabric-membersrvc: latest not found”, just add the environment variable “ARCH_TAG” with the value of “x86_64-0.6.1-preview” and then restart the command window.
# 10. 
   [optional]
   Change value for docker variable to avoid running out deploy time problem.
   In the Windows command window:
```
   docker-compose -f single-peer-ca.yaml up
   Open another Windows command window:
   docker ps
   docker exec -it [docker id for ibmblockchain/fabric-peer:x86_64-0.6.1-preview] bash 
   cd peer
   vi core.yaml
```
   Find 314th line change “deploytimeout: 30000” into “deploytimeout: 300000” then exit after saving file.
```
   export CORE_CHAINCODE_DEPLOYTIMEOUT =300000(optional)	
   go build
```
   Stop blockchain service set up by single-peer-ca.yaml and restart it.
# 11.  
   Install mysql server
   Download MySQL if it is not in your computer.
   https://dev.mysql.com/downloads/mysql/#downloads
   Set your user name to "root" and password to "".
   Open command shell for mysql server, type this:
```
   create database morgan;
   use morgan;
   source [file directory]morgan.sql;
```
# 12. 
   In the Windows command line window, type this(in project directory):
```
   npm install gulp -g
   npm install mysql -g
   npm install jssha -g
   npm install  
   gulp
 ```
   Wait until you see the message like the following:
 ```
 [ibc-js] Deploying Chaincode - Complete
 ---------------------------------------- Websocket Up ------------------------------------------
 ```

   This means everything is fine and click http://localhost:3000 to view the demo. 
