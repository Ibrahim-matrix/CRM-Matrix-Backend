const { Observable } = require("rxjs");

class ObservableSubject extends Observable {
  constructor() {
    super();
    this.observers = [];
  }

  addObserver(observer) {
    this.observers.push(observer);
  }

  removeObserver(observer) {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  notifyObservers(data) {
    this.observers.forEach((observer) => observer.update(data));
  }
}

class CRUDObserver {
  update(data) {
  }
}

const auth = new ObservableSubject();
const observer = new CRUDObserver();
auth.addObserver(observer);

module.exports = { auth };
