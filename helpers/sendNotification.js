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

module.exports = sendNotification;
