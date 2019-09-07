// all the work is done after Dom is loaded.
window.addEventListener('DOMContentLoaded', () => {
  // get elements on form to work with..

  let logoutButton = document.getElementById('logout');
  let logInForm = document.getElementById('loginForm');
  let errorPasswordDiv = document.getElementById('errorPassword');
  let errorNameDiv = document.getElementById('errorName');

  checkStorage();
  handleForm();
  urlButtonHandler();

  /**
   * 1. We look for token.
   * 2. If Token exists we call function to handle that (display message to user)
   * 3. If it does not exist we hide logged in message.
   */
  function checkStorage() {
    const token = localStorage.getItem('access_token');

    logoutButton!.addEventListener('click', e => {
      removeToken();
    });
    if (token) {
      handleTokenExists();
    } else {
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
    logInForm!.addEventListener('submit', e => {
      // prevent form from trying to submit data itself
      e.preventDefault();

      // get elements of form that we need to work with.
      let name = getnameControl();
      let password = getPasswordControl();

      // check to see if form inputs are valid and get error strings if they are not.
      const nameError = checknameControl(name);
      const passwordError = checkPasswordControl(password);

      // check to see if both form inputs are valid
      const validForm = !nameError && !passwordError;

      // set elements of form to errors if they exist.
      setErrors(errorNameDiv, nameError, errorPasswordDiv, passwordError);

      // if the form is valid we try to get token from server.
      if (validForm) {
        console.log('submitting form');
        Login({ name: name, password: password });
      }
    });

    // set any errors in the form after submission
    function setErrors(
      errornameElement: HTMLElement | null,
      nameError: string,
      errorPasswordElement: HTMLElement | null,
      passwordError: string
    ) {
      errornameElement!.innerHTML = nameError;
      errorPasswordElement!.innerHTML = passwordError;
    }

    // gets password control value
    function getPasswordControl() {
      return (<HTMLInputElement>document.getElementById('mochiPasswordControl'))
        .value;
    }

    //gets name control value
    function getnameControl() {
      return (<HTMLInputElement>document.getElementById('mochinameControl'))
        .value;
    }
  }

  // listener for url button
  function urlButtonHandler() {
    chrome.tabs.query({ active: true, currentWindow: true }, attachListener);
  }

  let currentUrlDiv = document.getElementById('currentUrl');
  let addUrlButton = document.getElementById('addUrl');
  let lastLinkAdded: string = '';

  function attachListener(tabs: chrome.tabs.Tab[]) {
    currentUrlDiv!.innerHTML = tabsToActiveUrl(tabs);
    addUrlButton!.addEventListener('click', e => {
      console.log(tabs);
      let urlCheck = checkUrl(tabs);
      if (urlCheck) {
        const urlToSend = tabsToActiveUrl(tabs);
        lastLinkAdded = urlToSend;
        AddLink(urlToSend);
      }
    });
  }

  function tabsToActiveUrl(tabs: chrome.tabs.Tab[]): string {
    const tab = tabs[0];
    let url = 'There is no url on this tab';
    if (tab.url) {
      url = tab.url;
    }
    return url;
  }

  function checkUrl(tabs: chrome.tabs.Tab[]): boolean {
    const tab = tabs[0];
    if (!tab.url) {
      return false;
    }
    if (tab.url === lastLinkAdded) {
      setLinkError('That link was added this session');
      return false;
    }
    if (tab.url) {
      //check url here.
      let url = tab.url;
      // regex for URL
      let re = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
      let regex = new RegExp(re);
      const result = regex.test(url);
      return result;
    }
    return false;
  }

  interface LoginObject {
    name: string;
    password: string;
  }
  /**
   * 1. We pass loginObject to function {name:"someguy@name.com", password: "somePassword"}
   * 2. If it fails we send message to user.
   * 3. If it succeeds we add token to local storage and then call function to change DOM.
   * 4. NOTE - https://www.tjvantoll.com/2015/09/13/fetch-and-errors/
   * 5. FETCH DOES NOT HANDLE ERROR AS EXPECTED - only lack of connectivity triggers rejected!
   */
  function Login(loginObject: LoginObject) {
    setServerError('Logging in...');
    const api = 'http://localhost:5000/api/auth/token';
    fetch(api, {
      method: 'POST',
      body: JSON.stringify(loginObject),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    })
      .then(response => {
        if (!response.ok) {
          console.log(response);
          throw Error(response.statusText);
        }
        return response;
      })
      .then(response => response.json())
      .then(json => json['access_token'])
      .then(token => {
        console.log(token);
        setTokenInLocal(token);
        handleLoginViewChanges();
      })
      .catch(error => {
        let message: string = error.message;
        console.log(message);
        const badRequest: string = 'Bad Request';
        if (message === badRequest) {
          setServerError('Wrong password/name combo');
        } else {
          setServerError('Unknown error - server may be down');
        }
      });
  }

  //set some variables from dom for dom manipulator functions.

  function hideUrlButtons() {
    document.getElementById('loggedIn')!.style.display = 'none';
  }

  function setServerError(message: string) {
    let error = (document.getElementById(
      'errorFromServer'
    )!.innerHTML = message);
  }

  function formDisplay(show: boolean) {
    let formEl = <HTMLFormElement>document.getElementById('loginForm');
    if (!show) {
      formEl.reset();
      formEl.style.display = 'none';
    } else {
      formEl.style.display = 'block';
    }
  }
  function instructionsDisplay(show: boolean) {
    let instructionsEl = document.getElementById('instructions');

    show
      ? (instructionsEl!.style.display = 'block')
      : (instructionsEl!.style.display = 'none');
  }

  function displayAddLinkInfo(show: boolean, message?: string) {
    let loggedInEl = document.getElementById('loggedIn');
    let loggedInMessEl = document.getElementById('loggedInMessage');

    if (show) {
      loggedInEl!.style.display = 'block';
      loggedInMessEl!.innerHTML = message || '';
    } else {
      loggedInEl!.style.display = 'none';
    }
  }

  /**
   * This method will both set link result and display the mochi icon.
   */
  function setLinkResult(message: string) {
    let results = document.getElementById('linkResults');
    results!.innerHTML = message;
    if (message) {
      displayMochiFigure(true);
    }
    setTimeout(() => {
      results!.innerHTML = '';
      displayMochiFigure(false);
    }, 3000);
  }
  function setLinkError(message: string) {
    let linkError = document.getElementById('linkError');
    linkError!.innerHTML = message;
    setTimeout(() => {
      linkError!.innerHTML = '';
    }, 6000);
  }

  function displayMochiFigure(show: boolean) {
    let mochiFigure = document.getElementById('mochiFigure');
    if (show) {
      mochiFigure!.style.display = 'inline-block';
    } else {
      mochiFigure!.style.display = 'none';
    }
  }

  /**
   * Changes DOM when we successfully get token back.
   */
  function handleLoginViewChanges() {
    // reset and hide form.
    formDisplay(false);
    // hide instructions
    instructionsDisplay(false);
    // clear errors
    setServerError('');
    // log in message show
    displayAddLinkInfo(true, 'Linked to Selpy Account');
    // clear any results from link added display.
    displayMochiFigure(false);
    setLinkResult('');
    setLinkError('');
  }

  /**
   * Changes Dom and removes token if user logs out of extension.
   */
  function removeToken() {
    // removes token from local storage
    removeTokenfromLocal();
    // shows instructions and log in form element
    formDisplay(true);
    instructionsDisplay(true);
    displayAddLinkInfo(false);
  }

  /**
   * Changes Dom if token is in memory when user click on popup icon.
   */
  function handleTokenExists() {
    displayAddLinkInfo(true, 'Linked To Selpy Account.');
    instructionsDisplay(false);
    formDisplay(false);
    displayMochiFigure(false);
    setLinkResult('');
    setLinkError('');
    setServerError('');
  }

  /**
   * Returns strings based on any errors in name control.
   */
  function checknameControl(name: string) {
    
    if (!name) {
      return 'An name is required.';
    }
   
    return '';
  }

  /**
   * Returns strings based on any errors in password control.
   */
  function checkPasswordControl(password: string) {
    if (!password) {
      return 'A password is required.';
    }

    if (password.length < 6) {
      return 'Must be at least 6 characters long';
    }
    return '';
  }



  // localstorage helper functions.
  function removeTokenfromLocal() {
    localStorage.removeItem('access_token');
  }

  function getToken() {
    let token = localStorage.getItem('access_token');
    return token;
  }

  function setTokenInLocal(token: string) {
    if (token) {
      localStorage.setItem('access_token', token);
    } else throw Error('token was null or undefined.');
  }

  // sends link to API for Selpy.
  function AddLink(linkUrl: string): void {
    const data: any = { url: linkUrl };
    const api: string = 'http://localhost:2001/api/Link/secure';
    let token: string | null = getToken();
    token = `Bearer ${token}`;

    fetch(api, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: new Headers({
        'Content-Type': 'application/json',
        Authorization: token
      })
    })
      .then(response => {
        if (!response.ok) {
          console.log(response);
          throw Error(response.statusText);
        }
        return response;
      })
      .then(response => response.json())
      .then(() => {
        setLinkResult('Link added successfully');
        displayMochiFigure(true);
      })
      .catch(error => {
        console.log(error);
        setLinkError('An error has occured - contact Pete');
      });
  }
});
