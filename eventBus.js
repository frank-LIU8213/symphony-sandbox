export class EventBus {
    constructor() {
        this._listeners = {};
    }

    on(event, callback) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(callback);
    }

    emit(event, data) {
        if (this._listeners[event]) {
            for (const cb of this._listeners[event]) {
                cb(data);
            }
        }
    }
}

export const bus = new EventBus();
