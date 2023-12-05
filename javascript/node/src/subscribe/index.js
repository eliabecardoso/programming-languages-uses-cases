// Creational

class User {
  constructor(username) {
    if (!username) throw new Error('Missing Params');

    this.username = username;
  }
}

const UserFactory = {
  makeUser: (username) => new User(username),
};

class Subscriber {
  constructor(user, notificationLevel) {
    if (!user) throw new Error('Missing Params');

    this.user = user;
    this.notificationLevel = notificationLevel || 'full';
    this.notifications = [];
  }

  newNotification(message) {
    console.log(`New Notification to ${this.user.username}: ${message}`);
    this.notifications.push({ message, read: false });
  }

  readNotification(messageId) {
    this.notifications[messageId] = { ...this.notifications[messageId], read: true };
  }
}

const SubscribeFactory = {
  makeSubscriber: (user, notificationLevel) => new Subscriber(user, notificationLevel)
};

class SubscribeManager {
  constructor() {
    this.subscribers = new Map();
  }

  validate(subscriber) {
    if (this.subscribers.has(subscriber.user.username)) {
      throw new Error(`Subscriber ${subscriber.user.username} already exists`);
    }
  }

  insert(subscriber) {
    this.validate(subscriber);
    this.subscribers.set(subscriber.user.username, subscriber);
  }

  remove(username) {
    this.subscribers.delete(username);
  }

  get(username) {
    return this.subscribers.get(username);
  }

  getList() {
    return Array.from(this.subscribers)
      .map(([_, value]) => SubscribeFactory
        .makeSubscriber(UserFactory.makeUser(value.user.username), value.notificationLevel));
  }

  getTotal() {
    return this.subscribers.size;
  }
}

SubscribeFactory.makeSubscribeManager = () => new SubscribeManager();

// Structural
class X {
  constructor(subscribeManager) {
    this.subscribeManager = subscribeManager;
  }

  newSubscriber(user) {
    try {
      // some rules for tt (Twitter User, ...)
      const subscriber = new Subscriber(user, 'full');
      this.subscribeManager.insert(subscriber);

      console.log(`CREATED: ${user.username} | ${subscriber.notificationLevel}`);
    } catch (e) {
      console.error(`ERROR | ${e.message}`);
    }
  }

  notify(message) {
    const subscribers = this.subscribeManager.getList();

    subscribers
      .forEach(subcriber => subcriber.newNotification(`TT - ${message}`));
  }
}

class Youtube {
  constructor(subscribeManager) {
    this.subscribeManager = subscribeManager;
  }

  newSubscriber(user, notificationLevel) {
    try {
      // some rules for yt (Youtube User, ...)
      const subscriber = new Subscriber(user, notificationLevel);
      this.subscribeManager.insert(subscriber);

      console.log(`CREATED: ${user.username} | ${subscriber.notificationLevel}`);
    } catch (e) {
      console.error(e.message);
    }
  }

  notify(message, notificationLevel) {
    const subscribers = this.subscribeManager.getList();

    subscribers
      .filter(subcriber => ['full', notificationLevel].includes(subcriber.notificationLevel))
      .forEach(subcriber => subcriber.newNotification(`YT - ${message}`));
  }
}

const x = new X(SubscribeFactory.makeSubscribeManager());
const youtube = new Youtube(SubscribeFactory.makeSubscribeManager());

x.newSubscriber(UserFactory.makeUser('john.doe'));
x.newSubscriber(UserFactory.makeUser('jane.doe'));
x.newSubscriber(UserFactory.makeUser('jane.doe')); // Error: Subscriber jane.doe already exists
x.notify('new post from Rocketseat'); // all receive message

youtube.newSubscriber(UserFactory.makeUser('john.doe'));
youtube.newSubscriber(UserFactory.makeUser('jane.doe'), 'important');
youtube.notify('new video from Fernando Ulrich', 'full'); // Only john.doe received message
youtube.notify('new video from Fernando Ulrich 2', 'important'); // all receive message
