# node-cronlog

node-cronlog is lightweight node-js script that helps to log cron jobs (or other scripts) and send an email if something went wrong (using nodemailer + Gmail).

## Email Setup

*OPTIONAL: If you want to receive alerts via email if something went wrong*

Create a file named `~/.cronlog/.env`
```bash ~/.cronlog/.env
GMAIL_USER="your-gmail-address@gmail.com"
GMAIL_PWD="**********"
MAIL_TO="the-recipient-address@gmail.com"
```

**IMPORTANT NOTE: If you have enabled 2FA on your GMAIL account, you need to create an ["App-specific password"](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwjCzsLKw_XrAhVL5uAKHeN2DBMQFjAAegQIAxAB&url=https%3A%2F%2Fsupport.google.com%2Faccounts%2Fanswer%2F185833%3Fhl%3Den&usg=AOvVaw2qwXmKRTjsa0k-q38HqJIX) from your gmail account settings.**

## USAGE

First, run `npm install` to install the dependencies.

Then, call the script.
```bash
# Make the script executable
chmod +x cronlog
# Launch the script
/path/to/cronlog <jobname> /path/to/command [options...] 
```

To use the script from CRON, I create a link in /etc/bin that points towards my cronlog script. So, I can add a cron line like the following.

```bash
* * * * * cronlog my_job_name echo "MY SCRIPT WORKS WELL"
```

The last result of each job will be stored in a SQLite file at ~/.cronlog/cronlog.sqlite

|name       |cmd                 |started                 |completed               |duration  |output                   |status    
|---------- |--------------------|------------------------|------------------------|----------|-------------------------|----------
|my_job_name|echo MY SCRIPT WORKS WELL|2020-09-19T15:48:26.313Z|2020-09-19T15:48:26.319Z|0.006|MY SCRIPT WORKS WELL     |0