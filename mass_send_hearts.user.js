// ==UserScript==
// @name         MCL NewGen mass send hearts
// @version      0.0.1
// @description  MCL NewGen mass send hearts
// @match        https://www.mycandylove-newgen.com/*
// @author       Filia
// @grant window.onurlchange
// ==/UserScript==


window.addEventListener('urlchange', function() {
    if (window.location.href === 'https://www.mycandylove-newgen.com/messaging') {
        const button = document.createElement('button');
        button.textContent = 'Mass send hearts';

        // Add a click event listener to the button
        button.addEventListener('click', function() {
        sendHearts();
        });
        // Add the button to the page
        let h2Elements = document.querySelectorAll("h2");
        let targetH2 = Array.from(h2Elements).find(h2 => h2.textContent.trim() === "Messages");
        targetH2.appendChild(button);
    }
});

function sendHearts(){
  // Get the value of the "asng-auth" cookie
  const cookieValue = document.cookie
  .split('; ')
  .find(row => row.startsWith('asng-auth='))
  .split('=')[1].split(':')[1]
  .replace('"', '')
  .replace('}', '')
  .replace('"', '');

  // Send the POST request with the bearer token in the Authorization header
  fetch('https://api.mycandylove-newgen.com/api/contact', {
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

    fetch('https://api.mycandylove-newgen.com/api/contact/send-heart', {
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


}
