# Collab Server
A nodejs websocket server for managing encrypted real time (per line) collaboration in Note taking apps, primarily aimed at Joplin (link). This project is a work in progress and the server should for now not be deployed other than in local test environments.

## Current features  

### User management
- Authentication is done via the http UPGRADE header - there is no need to create websockets to authenticate.  
- Passwords are stored in sqlite, hashed with SHA256 and individual 128bit salt. 
- User management is done by admin user via api-requests over a websocket. Related api msg types are 'newUser' and 'deleteUser'. 
	- 'newUser' generates an HMAC (hash) based on a new uid and and expiration date, which need to be shared with the new user externally. New users can create accounts themselves by connection to the server and passing the HMAC together with their desired username and password. This info is put together in copy-paste friendly string for sharing via email or messenger apps. 

### Note management
- Notes are stored in sqlite together with a note id. The encryption takes place client side, so the server only stores ciphertext. 

## Installing/testing
- To come.. 

