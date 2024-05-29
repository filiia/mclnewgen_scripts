// ==UserScript==
// @name         MCL NewGen mass send and receive hearts (international version)
// @version      0.0.2
// @description  MCL NewGen mass send and receive hearts
// @match        https://www.mycandylove-newgen.com/*
// @match        https://www.amordoce-newgen.com/*
// @match        https://www.sweetamoris-newgen.de/*
// @match        https://www.corazondemelon-newgen.es/*
// @match        https://www.amoursucre-newgen.com/*
// @match        https://www.slodkiflirt-newgen.pl/*
// @author       Filia
// @grant window.onurlchange
// ==/UserScript==


window.addEventListener('urlchange', function() {
  const base_domain = window.location.hostname;
  let api_domain;
  switch (base_domain) {
    case 'www.mycandylove-newgen.com':
        api_domain = 'api.mycandylove-newgen.com';
        break;
    case 'www.amordoce-newgen.com':
        api_domain = 'api.amordoce-newgen.com';
        break;
    case 'www.sweetamoris-newgen.de':
        api_domain = 'api.sweetamoris-newgen.de';
        break;
    case 'www.corazondemelon-newgen.es':
        api_domain = 'api.corazondemelon-newgen.es';
        break;
    case 'www.amoursucre-newgen.com':
        api_domain = 'api.amoursucre-newgen.com';
        break;
    case 'www.slodkiflirt-newgen.pl':
        api_domain = 'api.slodkiflirt-newgen.pl';
        break;
    default:
        console.log('Unknown domain.');
  }


  if (window.location.href === `https://${base_domain}/messaging`) {
      const receiveButton = document.createElement('button');
      receiveButton.textContent = 'Receive ❤️';

      // Add a click event listener to the button
      receiveButton.addEventListener('click', function() {
      receiveHearts(api_domain);
      });
      const sendButton = document.createElement('button');
      sendButton.textContent = 'Send ❤️';

      // Add a click event listener to the button
      sendButton.addEventListener('click', function() {
      sendHearts(api_domain);
      });

      // Add the button to the page
      let h2Elements = document.querySelectorAll("h2");
      let targetH2 = Array.from(h2Elements).find(h2 => h2.textContent.trim() === "Messages" || h2.textContent.trim() === "Messagerie");
      targetH2.appendChild(receiveButton);
      targetH2.appendChild(sendButton);
  }
});

function receiveHearts(api_domain){
  // Get the value of the "asng-auth" cookie
  const cookieValue = document.cookie
  .split('; ')
  .find(row => row.startsWith('asng-auth='))
  .split('=')[1].split(':')[1]
  .replace('"', '')
  .replace('}', '')
  .replace('"', '');

  // Send the GET request with the bearer token in the Authorization header
  fetch(`https://${api_domain}/api/messaging`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${cookieValue}`,
    'Content-Type': 'application/json'
  }
  })
  .then(response => response.json())
  .then(data => {
    let conversations = data.data.playersPage.conversations;
    let conversationIds = conversations.filter(conversation => conversation.availableGiftedHeart === true).map(conversation => conversation.conversationId);
    conversationIds.forEach(id => {
      fetch(`https://${api_domain}/api/messaging/conversation/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cookieValue}`,
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        let messages = data.data.messages;
        let receivedAvailableIds = messages
          .filter(message => message.status === 'receivedAvailable')
          .map(message => message.id);

        const body = {};
        fetch(`https://${api_domain}/api/messaging/conversation/collect-heart/${receivedAvailableIds}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cookieValue}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
      });
    });
  })
  .catch((error) => console.error('Error:', error));
  alert("Received hearts from everyone!");

}

function sendHearts(api_domain){
  // Get the value of the "asng-auth" cookie
  const cookieValue = document.cookie
  .split('; ')
  .find(row => row.startsWith('asng-auth='))
  .split('=')[1].split(':')[1]
  .replace('"', '')
  .replace('}', '')
  .replace('"', '');

  // Send the POST request with the bearer token in the Authorization header
  fetch(`https://${api_domain}/api/contact`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${cookieValue}`,
    'Content-Type': 'application/json'
  }
  })
  .then(response => response.json())
  .then(data => {
  const friendIds = data.data.friends.map(friend => friend.id);
  friendIds.forEach(id => {
    const data = { playerId: id };

    fetch(`https://${api_domain}/api/contact/send-heart`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cookieValue}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log(`Heart sent to friend ${id}`);
    })
    .catch(error => {
      console.error(`There was a problem sending hearts to friend ${id}:`, error);
    });
  });
  })
  .catch((error) => console.error('Error:', error));
  alert("Sent hearts to everyone!");

}
