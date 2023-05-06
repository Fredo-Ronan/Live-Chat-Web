# Live-Chat-Web
### A live chat web build using HTML, CSS and Javacript

OS : <img alt="Windows" src="https://img.shields.io/badge/Windows-0078D6?logo=windows&logoColor=white&style=flat"/> <img alt="Linux" src="https://img.shields.io/badge/Linux-B0A404?logo=linux&logoColor=white&style=flat"/> <img alt="Mac OS" src="https://img.shields.io/badge/Mac OS-BE06D6?logo=macos&logoColor=white&style=flat"/>

```Version : v1.0.0```

---
### Requirements
- Must have <img alt="Node JS" src="https://img.shields.io/badge/NodeJS-048C14?logo=nodejs&logoColor=white&style=flat"/> installed on your computer to run the backend (main.js file)

---
### Running the backend

- Type these command on your command prompt/terminal

```bash
node main.js
```

- After showing this
```bash
App Listening on port 5000
```
Go to your favourite browser then type ``localhost:5000``, then press ENTER
<br><br>
To stop the running server, use ``Ctrl + C``.

---
### Optional feature

You can automate running the ``main.js`` backend server side using nodemon

- Install nodemon globally
```bash
npm i nodemon
```

- After installation finished, when you want to run the backend server side, just type
```bash
nodemon main.js
```

- Then after showing this
```bash
[nodemon] 2.0.20
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): .
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node main.js`
App Listening on port 5000
```
Same as before you can type to your favourite browser ``localhost:5000``.<br><br>
But the different is, you can edit main.js file anytime and everytime you save changes, nodemon will help to continue running the most updated line of code of that main.js file, so you don't need to ``Ctrl + C`` to stop the server then retype ``node main.js`` again.
