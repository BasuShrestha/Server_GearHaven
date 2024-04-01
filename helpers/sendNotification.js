const { getMessaging } = require("firebase-admin/messaging");

const sendNotification = async (fcmtoken, title, body, data) => {
    if (!fcmtoken || !title || !body) {
        throw new Error('Missing required parameters');
    }

    const message = {
        notification: {
            title: title,
            body: body,
        },
        data: data,
        token: fcmtoken,
    };

    try {
        const response = await getMessaging().send(message);
        console.log('Successfully sent message:', response);
        return response;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

const sendNotificationMulticast = async (fcmTokens, title, body, data) => {
    if (!fcmTokens || !title || !body) {
        throw new Error('Missing required parameters');
    }

    const message = {
        notification: {
            title: title,
            body: body,
        },
        data: data,
        tokens: fcmTokens,
    };

    try {
        const response = await getMessaging().sendEachForMulticast(message);
        console.log('Successfully sent message:', response);
        return response;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

module.exports = {
    sendNotification,
    sendNotificationMulticast
}
