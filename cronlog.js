#!/usr/bin/env node
const os = require('os')
const fs = require('fs')
const exec = require('child_process').execSync
const CRONLOG_PATH = `${process.env.HOME}/.cronlog/`
// Create folder if doesn't exist
if (!fs.existsSync(CRONLOG_PATH)) {
    fs.mkdirSync(CRONLOG_PATH);
}

// ARGUMENTS ---------------------------------------------------------------------------

const jobName = process.argv[2]
const jobCmd = process.argv.slice(3).join(" ")

// DATABASE ---------------------------------------------------------------------------

require('dotenv').config({ path: CRONLOG_PATH + '/.env' })

const SQLite = require('better-sqlite3')

var db = SQLite(`${CRONLOG_PATH}/cronlog.sqlite`)

db.exec(`
CREATE TABLE if not exists jobs (
    name TEXT NOT NULL PRIMARY KEY,
    cmd TEXT NOT NULL,
    started DATE NOT NULL,
    completed DATE NOT NULL,
    duration NUMBER NOT NULL,
    output TEXT,
    status INTEGER
)
`)

let getJob = db.prepare("SELECT name,started,status FROM jobs WHERE name=?")
let addJob = db.prepare("INSERT OR REPLACE INTO jobs(name, cmd, started, completed, duration, output, status) values(@name, @cmd, @started, @completed, @duration, @output, @status)")


// Main script ------------------------------------------------------------------------------------------


let startDate = new Date()
var result = { status: 0, stdout: "" }

try {
    result.stdout = exec(jobCmd + " 2>&1", { stdio: 'pipe' })
} catch (err) {
    result = err
}

let completedDate = new Date()
let duration = (completedDate - startDate) / 1000
let previousResult = getJob.get(jobName)
let previousStatus = previousResult ? previousResult.status : null

addJob.run({
    name: jobName,
    cmd: jobCmd,
    started: startDate.toISOString(),
    completed: completedDate.toISOString(),
    duration: duration,
    output: result.stdout,
    status: result.status
})

// EMAIL ------------------------------------------------------------------------------------------

let email = process.env.GMAIL_USER && process.env.GMAIL_PWD && process.env.MAIL_TO

let shouldSendEmail = result.status != previousStatus && (result.status != 0 || previousResult != null) && email

if (!shouldSendEmail) { return }

const nodemailer = require('nodemailer')
let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PWD
    }
});

transporter.sendMail({
    from: `CRON Monitor 🚨<${process.env.GMAIL_USER}>`,
    to: process.env.MAIL_TO,
    subject: `Script: ${jobName} @${os.hostname()}`,
    text:
        `${result.status == 0 ? "✅ Issue resolved" : ("❌ ERROR " + result.status)}
JOB: ${jobName}
HOST: ${os.hostname()}
CMD: ${jobCmd}
STARTED: ${startDate.toISOString()}
COMPLETED: ${completedDate.toISOString()}
DURATION: ${duration} sec.
STATUS: ${result.status}
OUTPUT:
${result.output}
`});
