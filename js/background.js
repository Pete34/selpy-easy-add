"use strict";
console.log('background running here and now');
// interface ContentMessage {
//   type: string;
//   message: string;
// }
// // create object for content menu.
// let contextMenus: any = {};
// let lastSentLink = '';
// // add context menu to object - and add extension
// contextMenus.easyAdd = chrome.contextMenus.create(
//   { title: 'Add link to your Selpy.' },
//   () => {
//     if (chrome.runtime.lastError) {
//       console.error(chrome.runtime.lastError.message);
//     }
//   },
// );
// // add listener for the context menu we created.
// // handle what happens when user clicks menu.
// chrome.contextMenus.onClicked.addListener((info, tab) => {
//   if (info.menuItemId === contextMenus.easyAdd) {
//     console.log(info);
//     console.log(tab);
//    // handleMenuClicked(info, tab);
//   }
// });
// /**
//  * Handle what happens when context menu is clicked.
//  * 1)
//  */
// function handleMenuClicked(info: chrome.contextMenus.OnClickData, tab: any) {
//   if (checkForToken()) {
//     // send message to content page to user that link has been added successfully.
//     console.log(info.pageUrl);
//     checkLinkIsNew();
//   } else {
//     // send message to content page to remind user to log in.
//     sendMessageToContent(tab.id, {
//       type: 'failure',
//       message: 'tell user to log in!',
//     });
//   }
//   /**
//    * We store page link in variable - and check it so that user does not span link to server.
//    * 1) If link is new we are going to call addLink Ajax function.
//    * 2) If link is not new we currently just console.log (maybe add banner instead)
//    */
//   function checkLinkIsNew() {
//     // we don't want user spamming links by mistake.
//     if (info.pageUrl === lastSentLink) {
//       console.log('Link has already been added.');
//       sendMessageToContent(tab.id, {
//         type: 'repeat',
//         message: 'link was already added',
//       });
//     } else {
//       AddLink(info.pageUrl);
//       sendMessageToContent(tab.id, { type: 'success', message: 'link here' });
//     }
//     // set link here to store in variable.
//     lastSentLink = info.pageUrl;
//   }
// }
// // sends link to API for Selpy.
// function AddLink(linkUrl: string): void {
//   const data: any = { url: linkUrl };
//   const api: string = 'http://localhost:2001/api/Link/secure';
//   let token: string = getToken();
//   token = `Bearer ${token}`;
//   fetch(api, {
//     method: 'POST',
//     body: JSON.stringify(data),
//     headers: new Headers({
//       'Content-Type': 'application/json',
//       Authorization: token,
//     }),
//   })
//     .then((result) => result.json())
//     .then((json) => {
//       console.log(json);
//     });
// }
// /**
//  * Helper function sends link to content page.
//  */
// function sendMessageToContent(tabId: number, message: ContentMessage) {
//   chrome.tabs.query(
//     { active: true, currentWindow: true, windowType: 'normal' },
//     (tab) => {
//       let id = tab[0].id;
//       console.log(id);
//       if (id) {
//         chrome.tabs.sendMessage(id, message);
//       } else{
//         console.log("no id!");
//       }
//     },
//   );
// }
// /**
//  * Helper function checks if token is stored.
//  */
// function checkForToken(): boolean {
//   const access_token: string | null = localStorage.getItem('access_token');
//   if (access_token) {
//     return true;
//   }
//   return false;
// }
// function getToken(): string {
//   const access_token = localStorage.getItem('access_token');
//   return access_token || '';
// }
