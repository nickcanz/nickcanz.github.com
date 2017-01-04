---
layout: post
title:  "Fight cognitive biases when debugging, but here's that one time the problem really was on the other server"
date:   2017-01-03 21:36:00
categories: nfs elasticsearch cognitive-bias
---

Humans have [a lot of cognitive biases](https://en.wikipedia.org/wiki/List_of_cognitive_biases#Decision-making.2C_belief.2C_and_behavioral_biases) and as much as developers try to be analytical, there are a lot of mental traps I see developers fall into. The bias I want to discuss now is when debugging an issue, the developer blames or focuses on the part of the system they know the least. I do it all the friggen' time. When a problem comes up, I assume it's DNS. Or a bug in the database. A problem with the framework or the web server. But definitely not with the code that I wrote. The reason the bias is so hard to get rid of is that the more experienced you become, the more weird shit you've seen. The more times the problem was _really_ the other server. This is one of those stories.

We brought in a new Elasticsearch server to our cluster and, because it's new, we were monitoring things pretty closely. We had an error that kept popping up that stopped [Elasticsearch snapshots](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-snapshots.html) from completing successfully. The error in our logs was: 

{% highlight bash %}
IndexShardSnapshotFailedException[[index_name][0] Failed to perform snapshot (index files)]; nested: IOException[Permission denied];
{% endhighlight %}

Our backups are done via NFS, which has a standard set of gotchas for a `Permission denied` error. Making sure the directory is mounted correctly. Making sure the user ids are the same on the client and the server. Making sure the _group_ ids are the same on the client and server. Checked file and directory permissions on the backup directory. Asked a co-worker to double check my work. All came up with nothing.

This was the point where I sat back and started over with a fresh perspective. Ignore the new thing and try to look at it like any other problem. The error was only occurring on _some_ of the files that were getting backed up. The error was actually popping on existing nodes in the cluster, not just the newly added node. It was only happening _sometimes_. I was positive that it wasn't the NFS server. It's been up and running for years. I'd never actually logged onto it, that's how reliable this server had been. Buuuuut, I'd check some logs on it quick to rule it out.

Lo and behold, one of the first things I found in the `dmesg` output was some timestamps that lined up perfectly with the Elasticsearch logs:

{% highlight bash %}
Aug 29 15:24:47 backup-host01 rpcmod: [ID 851375 kern.warning] WARNING: svc_cots_kdup no slots free
Aug 29 15:24:47 backup-host01 last message repeated 2793 times
{% endhighlight %}

Googling resulted in a helpful [mailing list post](https://www.mail-archive.com/nfs-discuss%40mail.opensolaris.org/msg00906.html) that explained the issue:

> This is an error from the NFS server when it attempts to place a request into the duplicate request cache and finds that all of the ones in the duplicate request table are "in progress".

Considering that an Elasticsearch snapshot involves saving a lot of files across the entire cluster at once, it began to make sense why this seemingly unrelated limit was hit. When we added another server to the cluster, this just increased the activity on the NFS server at once. We wound up increasing the values of [`rpcmod:maxdupreqs`](https://docs.oracle.com/cd/E19683-01/806-7009/chapter3-43/index.html) and [`rpcmod:cotsmaxdupreqs`](https://docs.oracle.com/cd/E19683-01/806-7009/chapter3-44/index.html) to solve the issue.

In the end, the problem _was_ with that pesky other server that I was unfamiliar with. And because the problem was so hard to find, it's going to be memorable. Much more memorable than all times it was dumb file permissions that was wrong. That's the bias that I need to fight in myself and the reason it was helpful to me to write this post. If a similar issue came up today, I wouldn't change the order that I checked things in. It's still much more likely that a problem is going to come from the code you wrote or the servers you most recently changed. But those times when it was something weird, those make for much better stories.
