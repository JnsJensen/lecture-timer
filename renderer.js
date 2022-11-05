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

// break class
class Break {
    constructor(start_time, end_time) {
        this.start_time = start_time
        this.end_time = end_time
    }

    duration() {
        return this.end_time - this.start_time
    }
}

// lecture class containing start time and expected runtime of the lecture
class Lecture {
    constructor(name, start_time, expected_runtime, max_runtime) {
        this.name = name
        this.start_time = start_time
        this.expected_runtime = expected_runtime
        this.max_runtime = max_runtime
        this.expected_break_time = expected_runtime * 0.75
        this.break_time = 0
        this.breaks = []
    }
}

// day class containing a list of lectures and the day of the week
class Day {
    constructor(name, lectures) {
        this.name = name
        this.lectures = lectures
    }
}


const start_date = new Date()
let start_of_day = new Date()
start_of_day.setHours(0, 0, 0, 0)

const start_time = start_date.getTime()
const day = start_date.getDay()

let on_break = false
let animation_delay = 20

let start_of_break_date = null
let break_counter = 0

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
    new Day("Sunday", [new Lecture("Advanced Signal Processing", 8, 3, 4), new Lecture("Wireless Sensor Networks", 12, 3, 4)]),
    new Day("Monday", [new Lecture("Advanced Signal Processing", 10, 2, 4)]),
    new Day("Tuesday", [new Lecture("Advanced Signal Processing", 8, 3, 4), new Lecture("Wireless Sensor Networks", 12, 3, 4)]),
    new Day("Wednesday", [new Lecture("Requirements and Specification for Software Systems", 8, 2, 4)]),
    new Day("Thursday", [new Lecture("Advanced Signal Processing", 8, 13, 4)]),
    new Day("Friday", [new Lecture("Deep Learning", 20, 3, 4)]),
    new Day("Saturday", [new Lecture("Advanced Signal Processing", 8, 4, 4), new Lecture("Wireless Sensor Networks", 21, 4, 4)])
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
let current_lecture_idx = null
let current_lecture = null

const update = () => {
    const now_date = new Date()
    const now_time = now_date.getTime()
    const ms_from_start_of_day = now_time - start_of_day.getTime()

    // update dom element date with todays date
    replace_text('date', now_date.toLocaleDateString("en-GB"))
    replace_text('time', now_date.toTimeString().slice(0, 8))

    // set text in the DOM id 'lecture' to the current lecture
    for (let i = 0; i < schedule[day].lectures.length; i++) {
        const start_time_lecture = hr_to_ms(schedule[day].lectures[i].start_time)
        const runtime_lecture = hr_to_ms(schedule[day].lectures[i].max_runtime)
        const end_time_lecture = start_time_lecture + runtime_lecture

        if (ms_from_start_of_day > start_time_lecture &&
            ms_from_start_of_day < end_time_lecture) {
            current_lecture_idx = i
            break
        }
    }
    // console.log("FOUND LECTURE = " + current_lecture)
    current_lecture = current_lecture_idx !== null ? schedule[day].lectures[current_lecture_idx] : null
    if (current_lecture !== null) {
        // console.log(current_lecture.breaks)
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

        // update expected runtime
        let lecture_runtime_no_break_ms = hr_to_ms((current_lecture.expected_runtime) * 0.75)
        const expected_runtime_duration = new Date(lecture_runtime_no_break_ms)
        replace_text('expected_time_modules', current_lecture.expected_runtime)
        replace_text('expected_time_total', expected_runtime_duration.toTimeString().slice(0, 8))

        // expected end time of lecture
        let expected_end_time_date = new Date()
        expected_end_time_date.setHours(current_lecture.start_time + current_lecture.expected_runtime, 0, 0, 0)
        const expected_end_time_no_break_date = new Date(start_of_lecture_date.getTime() + lecture_runtime_no_break_ms)

        // console.log("expected_end_time_date: " + expected_end_time_date)
        replace_text('expected_end', expected_end_time_date.toTimeString().slice(0, 8))
        replace_text('expected_end_date', expected_end_time_date.toLocaleDateString("en-GB"))
        // update lecture break time if on_break is true
        if (on_break && break_counter >= 0) {
            // sum up duration of all breaks in the current lecture
            let break_duration = 0
            current_lecture.breaks.forEach(break_ => {
                break_duration += break_.end_time - break_.start_time
            })
            // console.log("break_duration: " + break_duration)
            const current_break_duration = now_date.getTime() - start_of_break_date.getTime()
            // console.log("current_break_duration: " + current_break_duration)
            current_lecture.break_time = (current_break_duration + break_duration)
        }

        // countdown from start of lecture to expected end time
        const expected_countdown_date = new Date(expected_end_time_no_break_date - now_date + current_lecture.break_time)
        replace_text('expected_countdown', expected_countdown_date.toTimeString().slice(0, 8))

        if (expected_countdown_date.getTime() > 0) {
            replace_text('expected_countdown', expected_countdown_date.toTimeString().slice(0, 8))
        } else {
            const inv_countdown = new Date(expected_countdown_date.getTime() * -1)
            replace_text('expected_countdown', inv_countdown.toTimeString().slice(0, 8))
        }
        const expected_runtime_timer_date = new Date(expected_runtime_duration - expected_countdown_date)
        replace_text('lecture_runtime', expected_runtime_timer_date.toTimeString().slice(0, 8))
    } else {
        replace_text('lecture', 'No lecture')
        replace_text('timer', '00:00:00')
    }

    // console.log("on_break = " + on_break)
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

            start_of_break_date = new Date()
            break_counter++
        } else {
            replace_text_animated('btn_break', 'Start Break', animation_delay)
            replace_text_animated('lecture_status', 'Lecture in Progress', animation_delay)
            set_background_color('status_icon', 'limegreen')
            
            // if current lecture is not null, add a break instance to the current lecture's break array
            const br = new Break(start_of_break_date, new Date())
            // console.log("br: " + br.duration())
            if (current_lecture !== null) {
                current_lecture.breaks.push({
                    start_time: start_of_break_date,
                    end_time: new Date()
                })
            }
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