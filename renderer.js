/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

// lecture class containing start time and expected runtime of the lecture
class Lecture {
    constructor(name, start_time, expected_runtime) {
        this.name = name;
        this.start_time = start_time;
        this.expected_runtime = expected_runtime;
    }
}

// day class containing a list of lectures and the day of the week
class Day {
    constructor(name, lectures) {
        this.name = name;
        this.lectures = lectures;
    }
}


const start_date = new Date()
const start_time = start_date.getTime()
const day = start_date.getDay()
let timer = 0
let countdown = 0

// const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
// const lectures = [[[0, 0]], [[10, 2]], [[8, 3], [12, 3]], [[8, 2]], [[0, 0]], [[8, 3]], [[0, 0]]]

const schedule = [
    new Day("Sunday", []),
    new Day("Monday", [new Lecture("Advanced Signal Processing", 10, 2)]),
    new Day("Tuesday", [new Lecture("Advanced Signal Processing", 8, 3), new Lecture("Wireless Sensor Networks", 12, 3)]),
    new Day("Wednesday", [new Lecture("Requirements and Specification for Software Systems", 8, 2)]),
    new Day("Thursday", []),
    new Day("Friday", [new Lecture("Deep Learning", 8, 3)]),
    new Day("Saturday", [])
]

const replace_text = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
}

const update = () => {
    const now_date = new Date()
    const now_time = now_date.getTime()
    timer = now_time - start_time
    replace_text('timer', Math.floor(timer / 1000))

    // set text in the DOM id 'lecture' to the current lecture
    let current_lecture = null
    for (let i = 0; i < schedule[day].lectures.length; i++) {
        if (now_time > schedule[day].lectures[i].start_time * 60 * 60 * 1000 && now_time < (schedule[day].lectures[i].start_time + schedule[day].lectures[i].expected_runtime) * 60 * 60 * 1000) {
            current_lecture = i
            break
        }
    }
    if (current_lecture) {
        replace_text('lecture', schedule[day].lectures[current_lecture].name)
    } else {
        replace_text('lecture', 'No lecture')
    }
}

window.addEventListener('DOMContentLoaded', () => {
    // set text in the DOM id 'day' to the current day
    replace_text('day', schedule[day].name)

    

    setInterval(update, 1000)
})