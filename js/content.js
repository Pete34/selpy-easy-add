"use strict";
// this is a content script (as per the name)
// executes after web page loads.. can manipulate web page itself if it matches.
console.log('Chrome Extension Ready to Go');
// interface ContentMessage {
//   type: string;
//   message: string;
// }
// /// message reciever from background.js
// chrome.runtime.onMessage.addListener(handleMessage);
// /**
//  * 1. If user adds link we create a banner on the content page.
//  * 2. If he tried to add link but was not logged in we send an alert.
//  */
// function handleMessage(
//   message: ContentMessage,
//   sender: chrome.runtime.MessageSender,
//   sendResponse: any,
// ) {
//   console.log(message);
//   if (message.type === 'success') {
//     displayBanner('Link Succesfully Added To Your Selpy Account!');
//   }
//   if (message.type === 'failure') {
//     displayBanner('Please Log into Selpy Easy Add Extension', 'firebrick');
//   }
//   if (message.type === 'repeat') {
//     displayBanner('You added this link already during this session', 'darkred');
//   }
// }
// function displayBanner(message: string, color?: string) {
//   // mochi color
//   let mochiColor = '#97DAF8';
//   let mochiBorderColor = color || '#97DAF8';
//   let mochiOutlineColor = '#4E7F8D';
//   console.log('displaying banner');
//   // create div that will be banner
//   let banner = document.createElement('div');
//   // create banner if user added link.
//   banner.innerHTML = `
//     <style>
//     #selpyNote{
//        position: fixed;
//        display: flex;
//        align-items: center;
//        justify-content: center;
//        z-index: 10000;
//        top: 0;
//        bottom: 0;
//        left: 0;
//        right: 0;
//        background-color: rgba(255, 255, 255, 0.2);
//     }
//     #selpyNoteMessage{
//         background-color: #EEE;
//         background-image: linear-gradient(to bottom right, white, #F1F1F1, #EEE, #DDD);
//         display: flex;
//         align-items: center;
//         justify-content: center;
//         font-family: sans-serif;
//         font-style: italic;
//         font-size: 15px;
//         min-width: 50%;
//         min-height: 5em;
//         border-radius: 0.5em;
//     }
//     svg{
//         min-width: 50px;
//         margin: 1em;
//     }
//     .st0{fill:${mochiColor};stroke:#6AC8EE;stroke-width:53.7625;stroke-linecap:round;stroke-miterlimit:10;}
//     .st1{opacity:0.8;fill:none;stroke:#FFFFFF;stroke-width:53.7625;stroke-linecap:round;stroke-miterlimit:10;}
//     .st2{fill:none;stroke:#FFFFFF;stroke-width:53.7625;stroke-linecap:round;stroke-miterlimit:10;}
//     .st3{fill:${mochiOutlineColor};}
//     .st4{opacity:0.8;fill:#FFFFFF;}
//     </style>
//     <div id="selpyNote">
//         <div id="selpyNoteMessage">
//             <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
//             viewBox="0 0 1224 792" style="enable-background:new 0 0 1224 792;" xml:space="preserve">
//             <g>
//                <g>
//                    <path class="st0" d="M1058.4,639.1V530.7c0-260-180-472.6-400-472.6H601c-220,0-400,212.7-400,472.6v108.4
//                        C201,787.3,1058.4,787.3,1058.4,639.1z"/>
//                    <path class="st1" d="M274.7,625.9c29.5,22.6,97.1,37.5,177,44.7"/>
//                    <path class="st2" d="M317.9,508.5"/>
//                    <path class="st1" d="M923.9,327.6C890.3,265.6,838.6,217,777,191c-31.9-13.5-66.5-20.9-102.6-20.9"/>
//                </g>
//                <g>
//                    <ellipse class="st3" cx="462.7" cy="373.1" rx="49.5" ry="45.5"/>
//                    <g>
//                        <path class="st3" d="M821.6,428.3l-87.4-31.5c-9.2-3.3-13.8-13-10.2-21.5v0c3.6-8.5,14.1-12.7,23.3-9.4l87.4,31.5
//                            c9.2,3.3,13.8,13,10.2,21.5v0C841.3,427.4,830.8,431.6,821.6,428.3z"/>
//                        <path class="st3" d="M832.5,347.6l-80.7,44.1c-8.5,4.6-19.6,2.1-24.7-5.8v0c-5.1-7.8-2.2-18,6.3-22.7l80.7-44.1
//                            c8.5-4.6,19.6-2.1,24.7,5.8l0,0C843.8,332.8,841,343,832.5,347.6z"/>
//                    </g>
//                </g>
//                <path class="st4" d="M629.7,664.3c104.6,0,189.3-77.9,189.3-174.1H440.3C440.3,586.3,525.1,664.3,629.7,664.3z"/>
//             </g>
//             </svg>
//          <span>${message}</span>
//          </div>
//      </div>`;
//   banner.style.color = color || 'black';
//   // add to body tag if it exists - otherwise add to html tag.
//   let body = document.querySelector('body');
//   if (body) {
//     document.querySelector('body')!.insertAdjacentElement('afterbegin', banner);
//   } else {
//     document.querySelector('html')!.insertAdjacentElement('afterbegin', banner);
//   }
// //   setTimeout(() => {
// //     document.getElementById('selpyNote')!.remove();
// //   }, 1500);
// }
