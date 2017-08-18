---
layout: post
title:  "Missing logs?!? Learning about linux logging systems"
date:   2017-08-18 12:48:00
categories: centos logging journald rsyslog
---

My style of learning and working has gotten me to the point where I have pretty _wide_ knowledge of various computering things, but not _deep_ knowledge. I've bounced around between .NET vs Ruby vs Clojure, Windows vs Linux, colo vs cloud. This means that as I debug problems, I often run head-long into various pits that I didn't even know were there. Linux logging is one of those pits that I just had no idea how it worked...

## The problem

We use Postfix at [Postmark](https://postmarkapp.com) for our external SMTP interface that customers interact with. It's rock solid and performs as advertised, pretty well for software that was written [nearly 20 years ago](https://en.wikipedia.org/wiki/Postfix_(software)). However, while investigating a support issue, I was combing through the logs and didn't find the evidence that the customer provided. This happening once, I could chalk it up to the fact that the customer provided bad data for me to look for and I looked for the evidence in other places. But, after a few more cases it become obvious that lines that _should_ have been in the logs definitely _were not_ in the logs. Something was wrong.

## The resolution

After spelunking into various log files, I finally saw something that stuck out:

{% highlight bash %}
$ journalctl -u systemd-journald

systemd-journal[4431]: Suppressed 316 messages from /system.slice/postfix.service
systemd-journal[4431]: Suppressed 387 messages from /system.slice/postfix.service
systemd-journal[4431]: Suppressed 453 messages from /system.slice/postfix.service
{% endhighlight %}

journald is the system that handles system logging in Centos 7, replacing syslog. It's a centralized logging system that all services on the system can use. Because it's central to the entire server, it has some safeguards such as rate-limiting built into it so that rogue programs can't bring down the server. However, we use our postfix logs almost as an audit system, we *need* all entries form the postfix logs. So while rate-limiting is a very smart default, it wasn't the behavior that we wanted in our system. To remove the journald rate-limiting:

{% highlight bash %}
# in /etc/systemd/journald.conf

RateLimitInterval=0
RateLimitBurst=0

$ systemctl restart systemd-journald
{% endhighlight %}

Also, we had an additional step in our setup to get log messages going to a `/var/log/maillog` file where postfix logs are traditionally stored. System log messages would follow `journald -> rsyslogd -> /var/log/maillog`, so we had to adjust the rate-limiting in rsyslogd.

{% highlight bash %}
# in /etc/rsyslog.conf

$imjournalRatelimitInterval 0
$imjournalRatelimitBurst 0

$ systemctl restart rsyslog
{% endhighlight %}

## Conclusion

At the end of the day, I was pretty happy to learn some more about linux logging and deepened my knowledge a little bit. [A very helpful blog post](https://www.rootusers.com/how-to-change-log-rate-limiting-in-linux/) was one of the few things that my frantic googling hit on that provided help.  
