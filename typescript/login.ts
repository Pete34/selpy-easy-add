// all the work is done after Dom is loaded.
window.addEventListener('DOMContentLoaded', () => {
  // get elements on form to work with..
  let logoutButton = document.getElementById('logout');
  let logInForm = document.getElementById('loginForm');
  let errorPasswordDiv = document.getElementById('errorPassword');
  let errorEmailDiv = document.getElementById('errorEmail');

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

    logoutButton!.addEventListener('click', (e) => {
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
    logInForm!.addEventListener('submit', (e) => {
      // prevent form from trying to submit data itself
      e.preventDefault();

      // get elements of form that we need to work with.
      let email = getEmailControl();
      let password = getPasswordControl();

      // check to see if form inputs are valid and get error strings if they are not.
      const emailError = checkEmailControl(email);
      const passwordError = checkPasswordControl(password);

      // check to see if both form inputs are valid
      const validForm = !emailError && !passwordError;

      // set elements of form to errors if they exist.
      setErrors(errorEmailDiv, emailError, errorPasswordDiv, passwordError);

      // if the form is valid we try to get token from server.
      if (validForm) {
        console.log('submitting form');
        Login({ email: email, password: password });
      }
    });

    // set any errors in the form after submission
    function setErrors(
      errorEmailElement: HTMLElement | null,
      emailError: string,
      errorPasswordElement: HTMLElement | null,
      passwordError: string,
    ) {
      errorEmailElement!.innerHTML = emailError;
      errorPasswordElement!.innerHTML = passwordError;
    }

    // gets password control value
    function getPasswordControl() {
      return (<HTMLInputElement>document.getElementById('mochiPasswordControl'))
        .value;
    }

    //gets email control value
    function getEmailControl() {
      return (<HTMLInputElement>document.getElementById('mochiEmailControl'))
        .value;
    }
  }

  // listener for url button
  function urlButtonHandler() {
    chrome.tabs.query({ active: true, currentWindow: true }, attachListener);
  }

  let currentUrlDiv = document.getElementById('currentUrl');
  let addUrlButton = document.getElementById('addUrl');

  function attachListener(tabs: chrome.tabs.Tab[]) {
    currentUrlDiv!.innerHTML = tabsToActiveUrl(tabs);
    addUrlButton!.addEventListener('click', (e) => {
      console.log(tabs);
      let urlCheck = checkUrl(tabs);
      if (urlCheck) {
        const urlToSend = tabsToActiveUrl(tabs);
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
    email: string;
    password: string;
  }
  /**
   * 1. We pass loginObject to function {email:"someguy@email.com", password: "somePassword"}
   * 2. If it fails we send message to user.
   * 3. If it succeeds we add token to local storage and then call function to change DOM.
   * 4. NOTE - https://www.tjvantoll.com/2015/09/13/fetch-and-errors/
   * 5. FETCH DOES NOT HANDLE ERROR AS EXPECTED - only lack of connectivity triggers rejected!
   */
  function Login(loginObject: LoginObject) {
    const api = 'http://localhost:5000/api/auth/token';
    fetch(api, {
      method: 'POST',
      body: JSON.stringify(loginObject),
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    })
      .then((response) => {
        if (!response.ok) {
          console.log(response);
          throw Error(response.statusText);
        }
        return response;
      })
      .then((response) => response.json())
      .then((json) => json['access_token'])
      .then((token) => {
        console.log(token);
        setTokenInLocal(token);
        handleLoginViewChanges();
      })
      .catch((error) => {
        let message: string = error.message;
        console.log(message);
        const badRequest: string = 'Bad Request';
        if (message === badRequest) {
          setServerError('Wrong password/email combo');
        } else {
          setServerError('Unknown error - server may be down');
        }
      });
  }

  //set some variables from dom for dom manipulator functions.

  let formEl = (<HTMLFormElement>document.getElementById('loginForm'));


  /**
   * Changes DOM when we successfully get token back.
   */
  function handleLoginViewChanges() {
   formEl.reset();
    document.getElementById('instructions')!.style.display = 'none';
    document.getElementById('loginForm')!.style.display = 'none';
    document.getElementById('loggedIn')!.style.display = 'block';
    document.getElementById('loggedInMessage')!.innerHTML =
      'Credentials Accepted! Add any pages you like to your Selpy Account!';
    document.getElementById('linkResults')!.innerHTML = '';
    document.getElementById('linkError')!.innerHTML = '';
  }

  /**
   * Changes Dom and removes token if user logs out of extension.
   */
  function removeToken() {
    removeTokenfromLocal();
    document.getElementById('loginForm')!.style.display = 'block';
    document.getElementById('loggedIn')!.style.display = 'none';
    document.getElementById('instructions')!.style.display = 'block';
  }

  /**
   * Changes Dom if token is in memory when user click on popup icon.
   */
  function handleTokenExists() {
    document.getElementById('instructions')!.style.display = 'none';
    document.getElementById('loggedIn')!.style.display = 'block';
    document.getElementById('loggedInMessage')!.innerHTML =
      'Linked to account.';
    document.getElementById('loginForm')!.style.display = 'none';
    document.getElementById('linkResults')!.innerHTML = '';
    document.getElementById('linkError')!.innerHTML = '';
  }

  function hideUrlButtons() {
    document.getElementById('loggedIn')!.style.display = 'none';
  }

  function setServerError(message: string) {
    let error = (document.getElementById(
      'errorFromServer',
    )!.innerHTML = message);
  }

  /**
   * Returns strings based on any errors in email control.
   */
  function checkEmailControl(email: string) {
    const validBool = validateEmail(email);
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
  function checkPasswordControl(password: string) {
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
  function validateEmail(email: string) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
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
        Authorization: token,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          console.log(response);
          throw Error(response.statusText);
        }
        return response;
      })
      .then((response) => response.json())
      .then(() => setLinkResult('Link added successfully'))
      .catch((error) => {
        console.log(error);
        setLinkError('An error has occured - contact Pete');
      });
  }

  function setLinkResult(message: string) {
    document.getElementById('linkResults')!.innerHTML = message;
    document.getElementById('linkError')!.innerHTML = '';
  }
  function setLinkError(message: string) {
    document.getElementById('linkResults')!.innerHTML = '';
    document.getElementById('linkError')!.innerHTML = message;
  }
});
