importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js");

// "Default" Firebase configuration (prevents errors)
const defaultConfig = {
    apiKey: "AIzaSyDngyK-w3S7yGmtQa4EXWLaLfCJEqpUyVU",
    projectId: "olex-6bc47",
    messagingSenderId: "852045853347",
    appId: "1:852045853347:web:ce59c95ea0d90bd10a4516",
};

// Initialize Firebase app
firebase.initializeApp(defaultConfig);
const messaging = firebase.messaging();

//Listens for background notifications
messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.data.icon,
        data: {
            url: payload.data.url // Açılacak URL'yi data'ya ekleyin
        }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
