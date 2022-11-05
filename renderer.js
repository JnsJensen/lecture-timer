/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

// const con = require('electron').remote.getGlobal('console')
// con.log('This will be output to the main process console.')

// const remote = require('electron').remote;
// const app = remote.app;

// app.console.log('This will output to the main process console.');

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
let start_of_day = new Date()
start_of_day.setHours(0, 0, 0, 0)

const start_time = start_date.getTime()
const day = start_date.getDay()

let on_break = false
let animation_delay = 20

// const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
// const lectures = [[[0, 0]], [[10, 2]], [[8, 3], [12, 3]], [[8, 2]], [[0, 0]], [[8, 3]], [[0, 0]]]

// const schedule = [
//     new Day("Sunday", []),
//     new Day("Monday", [new Lecture("Advanced Signal Processing", 10, 2)]),
//     new Day("Tuesday", [new Lecture("Advanced Signal Processing", 8, 3), new Lecture("Wireless Sensor Networks", 12, 3)]),
//     new Day("Wednesday", [new Lecture("Requirements and Specification for Software Systems", 8, 2)]),
//     new Day("Thursday", []),
//     new Day("Friday", [new Lecture("Deep Learning", 8, 3)]),
//     new Day("Saturday", [])
// ]
const schedule = [
    new Day("Sunday", [new Lecture("Advanced Signal Processing", 8, 3), new Lecture("Wireless Sensor Networks", 12, 3)]),
    new Day("Monday", [new Lecture("Advanced Signal Processing", 10, 2)]),
    new Day("Tuesday", [new Lecture("Advanced Signal Processing", 8, 3), new Lecture("Wireless Sensor Networks", 12, 3)]),
    new Day("Wednesday", [new Lecture("Requirements and Specification for Software Systems", 8, 2)]),
    new Day("Thursday", [new Lecture("Advanced Signal Processing", 8, 13)]),
    new Day("Friday", [new Lecture("Deep Learning", 20, 3)]),
    new Day("Saturday", [new Lecture("Advanced Signal Processing", 8, 4), new Lecture("Wireless Sensor Networks", 12, 4)])
]

const replace_text = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
}

const append_text = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText += text
}

// replace text function, removing the old text one character at a time with a delay, then entering the new text one character at a time with a delay
const replace_text_animated = (selector, text, delay) => {
    const element = document.getElementById(selector)
    if (element) {
        let old_text = element.innerText
        let new_text = text
        let i = 0
        let j = 0
        let interval = setInterval(() => {
            if (i < old_text.length) {
                element.innerText = old_text.slice(0, old_text.length - i)
                i++
            } else if (j <= new_text.length) {
                element.innerText = new_text.slice(0, j)
                j++
            } else {
                clearInterval(interval)
            }
        }, delay)
    }
}

const add_event_listener = (selector, event, callback) => {
    const element = document.getElementById(selector)
    if (element) element.addEventListener(event, callback)
}

const set_background_color = (selector, color) => {
    const element = document.getElementById(selector)
    if (element) element.style.backgroundColor = color
}

const hr_to_ms = (hr) => {
    return hr * 60 * 60 * 1000
}

let previous_lecture_idx = null

const update = () => {
    const now_date = new Date()
    const now_time = now_date.getTime()
    const ms_from_start_of_day = now_time - start_of_day.getTime()


    // update dom element date with todays date
    replace_text('date', now_date.toLocaleDateString("en-GB"))
    replace_text('time', now_date.toTimeString().slice(0, 8))

    // set text in the DOM id 'lecture' to the current lecture
    let current_lecture_idx = null
    for (let i = 0; i < schedule[day].lectures.length; i++) {
        const start_time_lecture = hr_to_ms(schedule[day].lectures[i].start_time)
        const runtime_lecture = hr_to_ms(schedule[day].lectures[i].expected_runtime)
        const end_time_lecture = start_time_lecture + runtime_lecture
        
        // debugging
        // console.log("start_time_lecture: " + start_time_lecture)
        // console.log("runtime_lecture: " + runtime_lecture)
        // console.log("endtime_lecture: " + end_time_lecture)

        // console.log("over start time: " + (ms_from_start_of_day > start_time_lecture))
        // console.log("under end time: " + (ms_from_start_of_day < end_time_lecture))
        // console.log("ms_from_start_of_day - end_time_lecture: " + (ms_from_start_of_day - end_time_lecture))

        // console.log("start_of_day: " + start_of_day.getTime())
        // console.log("now_time - start_of_day: " + ms_from_start_of_day)

        if (ms_from_start_of_day > start_time_lecture &&
            ms_from_start_of_day < end_time_lecture) {
            current_lecture_idx = i
            // console.log("FOUND LECTURE = " + current_lecture_idx)
            break
        }
    }
    // console.log("FOUND LECTURE = " + current_lecture)
    current_lecture = current_lecture_idx !== null ? schedule[day].lectures[current_lecture_idx] : null
    if (current_lecture !== null) {
        if (previous_lecture_idx !== current_lecture_idx) {
            replace_text_animated('lecture', current_lecture.name, animation_delay)
            previous_lecture_idx = current_lecture_idx
        }

        let start_of_lecture_date = new Date()
        start_of_lecture_date.setHours(current_lecture.start_time, 0, 0, 0)

        // split timestamp from timer time string
        let timer_date = new Date(now_date - start_of_lecture_date - hr_to_ms(1))
        // print hours, minutes and seconds in dom timer
        replace_text('timer', timer_date.toTimeString().slice(0, 8))

        // console.log("start_of_lecture_date: " + start_of_lecture_date)
        // console.log("now_date: " + now_date)
        // console.log("timer: " + timer_date)

        // update expected runtime
        let lecture_runtime_no_break_ms = hr_to_ms((current_lecture.expected_runtime) * 0.75 - 1)
        const expected_runtime_date = new Date(lecture_runtime_no_break_ms)
        replace_text('expected_time_modules', current_lecture.expected_runtime)
        replace_text('expected_time_total', expected_runtime_date.toTimeString().slice(0, 8))

        // expected end time of lecture
        let expected_end_time_date = new Date()
        expected_end_time_date.setHours(current_lecture.start_time + current_lecture.expected_runtime, 0, 0, 0)
        // console.log("expected_end_time_date: " + expected_end_time_date)
        replace_text('expected_end', expected_end_time_date.toTimeString().slice(0, 8))
        // countdown from start of lecture to expected end time
        let expected_end_time_countdown_date = new Date(expected_end_time_date - now_date - hr_to_ms(1))
        replace_text('expected_countdown', expected_end_time_countdown_date.toTimeString().slice(0, 8))
    } else {
        replace_text('lecture', 'No lecture')
        replace_text('timer', '00:00:00')
    }

    console.log("on_break = " + on_break)
}

window.addEventListener('DOMContentLoaded', () => {
    // set text in the DOM id 'day' to the current day
    replace_text('day', schedule[day].name)

    // add callback to break button 'btn_break' to start break
    add_event_listener('btn_break', 'click', () => {
        on_break = !on_break
        if (on_break) {
            replace_text_animated('btn_break', 'End Break', animation_delay)
            replace_text_animated('lecture_status', 'On Break', animation_delay)
            set_background_color('status_icon', 'crimson')
        } else {
            replace_text_animated('btn_break', 'Start Break', animation_delay)
            replace_text_animated('lecture_status', 'Lecture in Progress', animation_delay)
            set_background_color('status_icon', 'limegreen')
        }
    })

    add_event_listener('slide_increment', 'click', () => {
        const element = document.getElementById('total_slide')
        let total_slides = 0
        if (element) {
            total_slides = parseInt(element.value)
            total_slides += 1
            element.value = total_slides
        }
    })

    add_event_listener('slide_decrement', 'click', () => {
        const element = document.getElementById('total_slide')
        let total_slides = 0
        if (element) {
            total_slides = parseInt(element.value)
            if (total_slides > 0) {
                total_slides -= 1
                element.value = total_slides
            }
        }
    })
    
    update()
    setInterval(update, 1000)
})