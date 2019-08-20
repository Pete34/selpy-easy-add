"use strict";
// all the work is done after Dom is loaded.
window.addEventListener('DOMContentLoaded', function () {
    // get elements on form to work with..
    var logoutButton = document.getElementById('logout');
    var logInForm = document.getElementById('loginForm');
    var errorPasswordDiv = document.getElementById('errorPassword');
    var errorEmailDiv = document.getElementById('errorEmail');
    checkStorage();
    handleForm();
    urlButtonHandler();
    /**
     * 1. We look for token.
     * 2. If Token exists we call function to handle that (display message to user)
     * 3. If it does not exist we hide logged in message.
     */
    function checkStorage() {
        var token = localStorage.getItem('access_token');
        logoutButton.addEventListener('click', function (e) {
            removeToken();
        });
        if (token) {
            handleTokenExists();
        }
        else {
            hideUrlButtons();
        }
    }
    /**
     * 1. We add listener to submit button
     * 2. We check if form is valid.
     * 3. If User submits a valid form we try to login to get token.
     */
    function handleForm() {
        // event listener watches for submissions.
        logInForm.addEventListener('submit', function (e) {
            // prevent form from trying to submit data itself
            e.preventDefault();
            // get elements of form that we need to work with.
            var email = getEmailControl();
            var password = getPasswordControl();
            // check to see if form inputs are valid and get error strings if they are not.
            var emailError = checkEmailControl(email);
            var passwordError = checkPasswordControl(password);
            // check to see if both form inputs are valid
            var validForm = !emailError && !passwordError;
            // set elements of form to errors if they exist.
            setErrors(errorEmailDiv, emailError, errorPasswordDiv, passwordError);
            // if the form is valid we try to get token from server.
            if (validForm) {
                console.log('submitting form');
                Login({ email: email, password: password });
            }
        });
        // set any errors in the form after submission
        function setErrors(errorEmailElement, emailError, errorPasswordElement, passwordError) {
            errorEmailElement.innerHTML = emailError;
            errorPasswordElement.innerHTML = passwordError;
        }
        // gets password control value
        function getPasswordControl() {
            return document.getElementById('mochiPasswordControl')
                .value;
        }
        //gets email control value
        function getEmailControl() {
            return document.getElementById('mochiEmailControl')
                .value;
        }
    }
    // listener for url button
    function urlButtonHandler() {
        chrome.tabs.query({ active: true, currentWindow: true }, attachListener);
    }
    var currentUrlDiv = document.getElementById('currentUrl');
    var addUrlButton = document.getElementById('addUrl');
    function attachListener(tabs) {
        currentUrlDiv.innerHTML = tabsToActiveUrl(tabs);
        addUrlButton.addEventListener('click', function (e) {
            console.log(tabs);
            var urlCheck = checkUrl(tabs);
            if (urlCheck) {
                var urlToSend = tabsToActiveUrl(tabs);
                AddLink(urlToSend);
            }
        });
    }
    function tabsToActiveUrl(tabs) {
        var tab = tabs[0];
        var url = 'There is no url on this tab';
        if (tab.url) {
            url = tab.url;
        }
        return url;
    }
    function checkUrl(tabs) {
        var tab = tabs[0];
        if (!tab.url) {
            return false;
        }
        if (tab.url) {
            //check url here.
            var url = tab.url;
            // regex for URL
            var re = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
            var regex = new RegExp(re);
            var result = regex.test(url);
            return result;
        }
        return false;
    }
    /**
     * 1. We pass loginObject to function {email:"someguy@email.com", password: "somePassword"}
     * 2. If it fails we send message to user.
     * 3. If it succeeds we add token to local storage and then call function to change DOM.
     * 4. NOTE - https://www.tjvantoll.com/2015/09/13/fetch-and-errors/
     * 5. FETCH DOES NOT HANDLE ERROR AS EXPECTED - only lack of connectivity triggers rejected!
     */
    function Login(loginObject) {
        var api = 'http://localhost:5000/api/auth/token';
        fetch(api, {
            method: 'POST',
            body: JSON.stringify(loginObject),
            headers: new Headers({
                'Content-Type': 'application/json',
            }),
        })
            .then(function (response) {
            if (!response.ok) {
                console.log(response);
                throw Error(response.statusText);
            }
            return response;
        })
            .then(function (response) { return response.json(); })
            .then(function (json) { return json['access_token']; })
            .then(function (token) {
            console.log(token);
            setTokenInLocal(token);
            handleLoginViewChanges();
        })
            .catch(function (error) {
            var message = error.message;
            console.log(message);
            var badRequest = 'Bad Request';
            if (message === badRequest) {
                setServerError('Wrong password/email combo');
            }
            else {
                setServerError('Unknown error - server may be down');
            }
        });
    }
    //set some variables from dom for dom manipulator functions.
    var formEl = document.getElementById('loginForm');
    var instructionsEl = document.getElementById('instructions');
    /**
     * Changes DOM when we successfully get token back.
     */
    function handleLoginViewChanges() {
        formEl.reset();
        formEl.style.display = 'none';
        instructionsEl.style.display = 'none';
        document.getElementById('loggedIn').style.display = 'block';
        document.getElementById('loggedInMessage').innerHTML =
            'Credentials Accepted! Add any pages you like to your Selpy Account!';
        document.getElementById('linkResults').innerHTML = '';
        document.getElementById('linkError').innerHTML = '';
    }
    /**
     * Changes Dom and removes token if user logs out of extension.
     */
    function removeToken() {
        removeTokenfromLocal();
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('loggedIn').style.display = 'none';
        document.getElementById('instructions').style.display = 'block';
    }
    /**
     * Changes Dom if token is in memory when user click on popup icon.
     */
    function handleTokenExists() {
        document.getElementById('instructions').style.display = 'none';
        document.getElementById('loggedIn').style.display = 'block';
        document.getElementById('loggedInMessage').innerHTML =
            'Linked to account.';
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('linkResults').innerHTML = '';
        document.getElementById('linkError').innerHTML = '';
    }
    function hideUrlButtons() {
        document.getElementById('loggedIn').style.display = 'none';
    }
    function setServerError(message) {
        var error = (document.getElementById('errorFromServer').innerHTML = message);
    }
    /**
     * Returns strings based on any errors in email control.
     */
    function checkEmailControl(email) {
        var validBool = validateEmail(email);
        if (!email) {
            return 'An Email is required.';
        }
        if (!validBool) {
            return 'A Valid Email Address is required.';
        }
        return '';
    }
    /**
     * Returns strings based on any errors in password control.
     */
    function checkPasswordControl(password) {
        if (!password) {
            return 'A password is required.';
        }
        if (password.length < 6) {
            return 'Must be at least 6 characters long';
        }
        return '';
    }
    /**
     * Valdiates email
     */
    function validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    // localstorage helper functions.
    function removeTokenfromLocal() {
        localStorage.removeItem('access_token');
    }
    function getToken() {
        var token = localStorage.getItem('access_token');
        return token;
    }
    function setTokenInLocal(token) {
        if (token) {
            localStorage.setItem('access_token', token);
        }
        else
            throw Error('token was null or undefined.');
    }
    // sends link to API for Selpy.
    function AddLink(linkUrl) {
        var data = { url: linkUrl };
        var api = 'http://localhost:2001/api/Link/secure';
        var token = getToken();
        token = "Bearer " + token;
        fetch(api, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: new Headers({
                'Content-Type': 'application/json',
                Authorization: token,
            }),
        })
            .then(function (response) {
            if (!response.ok) {
                console.log(response);
                throw Error(response.statusText);
            }
            return response;
        })
            .then(function (response) { return response.json(); })
            .then(function () { return setLinkResult('Link added successfully'); })
            .catch(function (error) {
            console.log(error);
            setLinkError('An error has occured - contact Pete');
        });
    }
    function setLinkResult(message) {
        document.getElementById('linkResults').innerHTML = message;
        document.getElementById('linkError').innerHTML = '';
    }
    function setLinkError(message) {
        document.getElementById('linkResults').innerHTML = '';
        document.getElementById('linkError').innerHTML = message;
    }
});
