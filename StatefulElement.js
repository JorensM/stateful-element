//@ts-check

/**
 * @typedef {Object} ElementState
 * A state object that is used in StatefulElement class
 * @property { string } name Name of the state used to identify it in templates
 * @property { State } state The state itself
 */

/**
 * State class that lets you create a state variable and add reactive logic for when
 * the state value changes
 * 
 * @template T type of state
 */
class State {
    /**
     * The current value of the state
     * 
     * @type { T }
     */
    value;

    /**
     * The max ID of listeners. Should be incremented each time a new listener is added
     * 
     * @type { number }
     */
    maxID = 0;

    /**
     * Array of 'update' listeners that have been attached to this state. Will be called
     * whenever state value changes.
     * 
     * @type { {
     *      callback: ((newValue: T) => void),
     *      id: number
     * }[] } 
     */
    updateListeners = [];

    /**
     * Initialize state with initial value
     * @param { T } initialValue 
     */
    constructor(initialValue) {
        this.value = initialValue;
    }

    /**
     * Set the state to a new value. If the new value is different from the old one,
     * onUpdate callbacks will be called
     * @param { T } newValue 
     */
    set(newValue) {
        if(this.value === newValue) return;
        this.value = newValue;
        for(const listener of this.updateListeners) {
            listener.callback(newValue);
        }
    }

    /**
     * Get the current value of the state
     * @returns { T }
     */
    get() {
        return this.value;
    }

    /**
     * Add an event listener for when the state's value changes. The callback should accept
     * a single argument which is the new value of the state
     * @param { (newValue: T) => void } callback 
     * @returns { number } ID of the listener which can be used to remove the listener with `offUpdate()`
     */
    onUpdate(callback) {
        this.updateListeners.push({
            callback,
            id: this.maxID++
        })
        return this.maxID;
    }

    /**
     * Remove an update listener by ID
     * @param { number } id ID of the listener to remove 
     */
    offUpdate(id) {
        const listenerIndex = this.updateListeners.findIndex(listener => listener.id == id)
        this.updateListeners.splice(listenerIndex, 1);
    }
}

/**
 * Return the string used to identify a state in a template. Returns a string like
 * '%statename%'
 * 
 * @param { string } stateName 
 * 
 * @returns { string }
 */
const stateIdentifier = (stateName) => `%${stateName}%`;

/**
 * Parse a template and replace any references to state with the actual state value.
 * @param { string } template HTML string of template
 * @param { ElementState[] } state Array of ElementStates which should be checked for
 */
const parseTemplate = (template, state) => {
    let parsedTemplate = template;
    for(const stateEntry of state) {
        parsedTemplate = parsedTemplate.replaceAll(stateIdentifier(stateEntry.name), stateEntry.state.value)
    }
    return parsedTemplate;
}

class StatefulElement {
    /**
     * The HTML template in string form. Any occurences of %statenamehere% in the string
     * will be replaced by the respective state value
     */
    template;

    /**
     * The associated DOM element
     * @type { HTMLElement }
     */
    element;

    /**
     * @type { ElementState[] }
     */
    state = [];

    /**
     * Initialize class
     * @param { string } template the HTML string template for the component
     * @param { HTMLElement } element the element in which the template should be rendered 
     */
    constructor(template, element) {
        this.template = template;
        this.element = element;
    }

    /**
     * Add a state to the element
     * @param { string } name Name of the state as seen in the template string 
     * @param { State } state The state object 
     */
    addState(name, state) {
        this.state.push({
            name,
            state
        })

        state.onUpdate((newValue) => {
            this.render();
        })
    }

    /**
     * Remove a state from the element
     * @param { string } name 
     */
    removeState(name) {
        const stateIndex = this.state.findIndex(state => state.name == name);
        if (stateIndex != -1) {
            this.state.splice(stateIndex, 1);
        }
    }

    /**
     * Renders the DOM element with the appropriate state, based on the template
     */
    render() {
        const parsedTemplate = parseTemplate(this.template, this.state);
        this.element.innerHTML = parsedTemplate;
    }


}