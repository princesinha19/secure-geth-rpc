# Secure Geth RPC

## Description
RPC has been used in the field of distributed technology from the time when the concepts of distributed computing were fairly new. In a decentralized world, RPC is used to connect to blockchain peer nodes. Bitcoin used authentication for connecting via RPC but ethereum doesn't have any authentication mechanism for connecting to the peer node. As a result, the RPC port exposed to connect to the peer node can be exposed to the attackers. The attackers can drain ethers from the accounts which are in the network. Attackers also, target ERC-20 or ERC-721 tokens owned by the accounts in a particular peer node. Attackers take advantage of an unlocked account on the peer node. Attackers can run a script to get the balance of a particular unlocked account and then transfer the ether to a malicious account under the attacker's control. The attacks like these have been fatal to the other accounts that are already present on that node. Other attacks that can drain the ERC tokens present on the node include the zero gas transaction, stealing tokens from the fisher's account, exploiting the airdrop mechanism, etc.

This project uses a whitelisting mechanism to connect to the peer node. The whitelist consists of IP addresses that are allowed to use the RPC. IP addresses are added to the whitelist after manual KYC verification. Upon successful verification, the IP address is added to the whitelisted address. The project acts as an outer wrapper for the ethereum’s JSON RPC which is not protected by any mechanism by default. The Whitelist is created using UFW (uncomplicated firewall). The IP address that is not added in the firewall as rules will be blocked as the incoming TCP packets are automatically dropped by the firewall. 

The mechanism of addition to the whitelist is fairly simple yet effective. Manual KYC is used to add new IP addresses to the whitelist. The KYC used in the project is a fully decentralized system. At the time of registration, an email with the public key of the user is sent to the admin of the node for manual verification. The public key of the user along with the private key of the admin is used to decrypt the KYC documents stored in the IPFS. After verification of the KYC documents by the admin, the user’s IP address is added to the whitelist. The user will now be able to access the ethereum using JSON RPC.

[![asciicast](https://img.youtube.com/vi/oKeG7z2swoM/0.jpg)](https://www.youtube.com/watch?v=oKeG7z2swoM) 

## Prerequisite needed for running this project:-
1. InterPlanetary File System (IPFS)
2. Uncomplicated Firewall (UFW)
3. Node and NPM
4. Nodemon
5. Geth (go-ethereum)
6. A Linux based machine

## Architecture Diagram
![alt text](https://github.com/princesinha19/secure-geth-rpc/blob/dev/images/Secure%20RPC.png)

## Steps for configuring UFW

#### To download UFW:
> sudo apt-get install ufw

#### Run Commands:
- sudo ufw reset
- sudo ufw enable
- sudo ufw allow ssh
- sudo ufw allow http
- sudo ufw default allow outgoing

## Steps to run this project:-
1. Clone the repository
2. Start IPFS in background
3. Go inside the cloned directory (using command ​ cd secure-geth-rpc​ ), and run command
npm install
It will install all the dependency for the project.
4. Then inside the folder, there is a ​ sample.env file. You need to fill all the blank details like. Gmail
username and password from which system will send mail to admin and user.
5. Then type command ​ nodemon or npm run start
6. Now, you can go to http://127.0.0.1:3000 to fill-up the RPC connection form.
7. If you will fill the form (as a user) then, it will show you a IPFS hash. At the same time, it
will send a mail to the admin for new request with the link.
8. Admin will click that link to check all the details of the user (App Owner) and he/she can
click approve or reject button.
9. If the admin will click approve button, Then, the backend will set a UFW rule to allow the
user for the RPC connection. At the same time, the backend will send a mail to the user
for successful acceptance of application with RPC Link.
10. If admin will click reject then, the backend will send a mail to the user regarding the
rejection of his/her application for RPC Connection.
