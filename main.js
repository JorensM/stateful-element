
const count = new State(0);

document.getElementById('counter-button').addEventListener('click', () => {
    count.set(count.get() + 1);
})

const counterDisplayElement = new StatefulElement('%count%', document.querySelector('#counter-display'));

counterDisplayElement.addState('count', count);

counterDisplayElement.render();