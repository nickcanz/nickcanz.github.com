---
layout: post
title:  "Changing defaults are hard"
date:   2021-12-04 22:30:00
---

One of my favorite projects at GitHub was changing the default value of the CPU governor configuration across our entire fleet. It was literally a one-line change in our puppet repo, but it felt _hard_ to do. My goal with this post is to explore some of the non-technical reasons why it felt hard and talk about them in the open. If you'd like to discuss more I'd love to make it into a conversation on [Twitter @nick_canz](https://twitter.com/nick_canz).

## The technical backstory

The [Linux CPU governor](https://www.kernel.org/doc/Documentation/cpu-freq/governors.txt) controls what frequency the CPU operates at. Your 3.2 GHz CPU doesn't need to run at 3.2 GHz all the time. That controls additional power for no reason when the CPU core isn't doing any work. The default configuration is `powersave`. For most systems, this is totally fine, but for a large server fleet like GitHub's the scaling up and down of CPU frequency can cause a lot of latency for systems where milliseconds matter. 

The change I introduced was to change `powersave` to `performance`. For some systems, it reduced latency by 10-15%, ranging from 90% reduction to no real noticeable change in the majority of systems. It increased power draw in our datacenters a negligible amount, so overall it was judged a win.

Like all infrastructure work, this involved heavy testing on a subset of systems, communicating with all the teams that owned servers, a rollout plan, a rollback plan, the end-of-project internal post. This was the easy part once I embarked on this project. So, what made this project _hard_?

## This is the second time I made this change

About 18 months before this project started, I _already_ discovered this performance issue and made the change. But just to the systems that my team specifically owned, a few hundred servers out of thousands. I made an internal post about the change, explained how people could make the same change, got some high five emojis in Slack.

Why was this a mistake? I didn't change the _default_ value. I didn't understand what happens when the number of engineers at a company grows at a rapid pace:

* When the main project completed, most engineers hadn't been at the company when I made the original post
* The internal post system I made the original post on was deprecated and the content put in a nebulous state
* No one else made the config change. It's unrealistic to make teams to jump through hoops to _opt in_ to the best settings.

At the time, spending more time on this change in order to change the default would have definitely been more _globally_ optimal, but I made the mistake of going for the _local_ optimum of making a smaller change and getting back to working on my own team's responsibilities.

## Organizational smells

Sandi Metz has a [great talk on code smells](https://www.youtube.com/watch?v=PJjHfa5yxlU) but more pernicious are organizational smells. Looking back on this project, I can think of a few things that can make a good engineering leader think there might be something more beneath the surface:

* Your manager (probably) doesn't care about global optimizations, they only care about local ones.
* I had to talk to a lot of teams that owned individual systems about this change. Broad efforts that involve pushing work to a lot of teams take a long time to get done and just suck for those teams.
* This particular change was logged in an issue and discussed before _I_ joined the company, but no one took it on until I did in a failed effort to get promoted. I didn't take the hint that if these types of optimizations aren't valued, they don't get done and doing them doesn't win you anything.




